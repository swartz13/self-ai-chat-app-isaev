/**
 * Desteklenen saglayicilar. Ikisi de OpenAI uyumlu /chat/completions sunar,
 * bu yuzden tek istemci ikisine de hizmet eder.
 */
export const PROVIDERS = {
  openrouter: {
    base: 'https://openrouter.ai/api/v1',
    envKeys: ['OPENROUTER_API_KEYS', 'OPENROUTER_API_KEY'],
    label: 'OpenRouter',
    extraHeaders: { 'HTTP-Referer': 'http://localhost', 'X-Title': 'ISAEV' },
  },
  hf: {
    base: 'https://router.huggingface.co/v1',
    envKeys: ['HF_API_KEYS', 'HF_API_KEY'],
    label: 'HuggingFace',
    extraHeaders: {},
  },
};

/**
 * "hf:Qwen/Qwen3-4B" -> { provider: 'hf', model: 'Qwen/Qwen3-4B' }
 * Onek yoksa OpenRouter varsayilir. OpenRouter kimliklerindeki ":free" eki
 * onek sayilmaz; yalnizca bastaki "hf:" dikkate alinir.
 */
export function splitModel(id) {
  const raw = String(id || '');
  for (const name of Object.keys(PROVIDERS)) {
    if (raw.startsWith(name + ':')) return { provider: name, model: raw.slice(name.length + 1) };
  }
  return { provider: 'openrouter', model: raw };
}

export class OpenRouterError extends Error {
  constructor(message, { status, code, retryable = false, raw } = {}) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
    this.raw = raw;
  }
}

/** Bir saglayicinin .env'deki anahtarlarini okur (virgulle coklu olabilir). */
export function apiKeys(provider = 'openrouter') {
  const cfg = PROVIDERS[provider] || PROVIDERS.openrouter;
  const raw = cfg.envKeys.map((k) => process.env[k]).find(Boolean) || '';
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

/** Anahtar sirasi saglayici basina ayri ilerler. */
const keyCursor = {};

function headers(key, provider) {
  const cfg = PROVIDERS[provider] || PROVIDERS.openrouter;
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...cfg.extraHeaders,
  };
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
// Bu hatalarda ayni anahtarla beklemek yerine sonraki anahtari denemek mantikli.
const KEY_SWITCH = new Set([401, 402, 403, 429]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function toError(res, provider = 'openrouter') {
  let body = null;
  try { body = await res.json(); } catch { /* metin govdesi */ }
  const err = typeof body?.error === 'string' ? { message: body.error } : (body?.error ?? {});
  // HuggingFace ayrintiyi baslikta da yollar.
  const detail = err.metadata?.raw || err.message || body?.message
    || res.headers.get('x-error-message') || res.statusText;
  const e = new OpenRouterError(detail, {
    status: res.status,
    code: err.code ?? res.status,
    retryable: RETRYABLE.has(res.status),
    raw: body,
  });
  e.provider = provider;
  return e;
}

/** Rate-limit ve gecici hatalar icin ustel geri cekilmeli fetch. */
async function requestWithRetry(path, payloadIn, { retries = 4, signal, provider = 'openrouter' } = {}) {
  let payload = payloadIn;
  const cfg = PROVIDERS[provider] || PROVIDERS.openrouter;
  const keys = apiKeys(provider);
  if (!keys.length) {
    throw new OpenRouterError(
      `${cfg.label} icin API anahtari tanimli degil (.env icindeki ${cfg.envKeys[0]}).`);
  }
  if (keyCursor[provider] == null) keyCursor[provider] = 0;

  let lastErr;
  // Her anahtar icin ayri sayac tutmak yerine, anahtar degistirdikce ayni
  // deneme butcesinden harcariz; boylece toplam bekleme suresi sinirli kalir.
  const totalAttempts = retries + keys.length;

  for (let attempt = 0; attempt <= totalAttempts; attempt++) {
    if (signal?.aborted) throw new OpenRouterError('Istek iptal edildi.', { code: 'aborted' });

    const key = keys[keyCursor[provider] % keys.length];
    let res;
    try {
      res = await fetch(`${cfg.base}${path}`, {
        method: 'POST', headers: headers(key, provider), body: JSON.stringify(payload), signal,
      });
    } catch (e) {
      if (e.name === 'AbortError') throw new OpenRouterError('Istek iptal edildi.', { code: 'aborted' });
      lastErr = new OpenRouterError(`Aga ulasilamadi: ${e.message}`, { retryable: true });
      await sleep(600 * 2 ** Math.min(attempt, 4));
      continue;
    }
    if (res.ok) return res;

    lastErr = await toError(res, provider);

    // Bazi modeller max_tokens icin kendi ust sinirini bildirir
    // ("limited to 16384"). Sinir neyse ona indirip bir kez daha dene.
    const capped = /limited to (\d+)/i.exec(lastErr.message || '');
    if (capped && payload.max_tokens > Number(capped[1])) {
      payload = { ...payload, max_tokens: Number(capped[1]) };
      continue;
    }

    // Anahtara bagli bir hataysa ve elde baska anahtar varsa hemen ona gec.
    if (keys.length > 1 && KEY_SWITCH.has(lastErr.status)) {
      keyCursor[provider] = (keyCursor[provider] + 1) % keys.length;
      lastErr.retryable = true;
      if (attempt < totalAttempts) continue;
    }

    if (!lastErr.retryable || attempt === totalAttempts) throw lastErr;

    // Saglayici bir bekleme suresi onerdiyse ona uy.
    const hinted = Number(res.headers.get('retry-after')) * 1000;
    await sleep(Number.isFinite(hinted) && hinted > 0 ? Math.min(hinted, 15_000) : 800 * 2 ** Math.min(attempt, 4));
  }
  throw lastErr;
}

/**
 * Sohbet tamamlamayi akis halinde calistirir.
 * onEvent({type:'reasoning'|'content', text}) her parcada cagrilir.
 * Donus: { content, reasoning, usage, model }
 */
export async function streamChat(payload, { onEvent, signal, provider = 'openrouter' } = {}) {
  const res = await requestWithRetry(
    '/chat/completions', { ...payload, stream: true }, { signal, provider });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let reasoning = '';
  let usage = null;
  let model = payload.model;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE olaylari satir satir gelir; son yarim satiri tamponda birak.
      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;

        let chunk;
        try { chunk = JSON.parse(data); } catch { continue; }
        if (chunk.error) {
          throw new OpenRouterError(chunk.error.metadata?.raw || chunk.error.message || 'Akis hatasi', {
            code: chunk.error.code, retryable: RETRYABLE.has(chunk.error.code), raw: chunk,
          });
        }
        if (chunk.model) model = chunk.model;
        if (chunk.usage) usage = chunk.usage;

        const delta = chunk.choices?.[0]?.delta;
        if (!delta) continue;
        const think = delta.reasoning ?? delta.reasoning_content;
        if (think) { reasoning += think; onEvent?.({ type: 'reasoning', text: think }); }
        if (delta.content)   { content   += delta.content;   onEvent?.({ type: 'content',   text: delta.content   }); }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  return { content, reasoning, usage, model };
}

/** Akissiz istek - baslik uretimi ve gorsel uretimi icin. */
export async function complete(payload, { signal, retries = 2, provider = 'openrouter' } = {}) {
  const res = await requestWithRetry('/chat/completions', payload, { signal, retries, provider });
  return res.json();
}
