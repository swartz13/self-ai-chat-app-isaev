/**
 * Supported API providers. Both provide OpenAI-compatible /chat/completions endpoints,
 * allowing a single unified client to serve both.
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
 * Defaults to OpenRouter if no prefix is present.
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

/** Reads provider API keys from environment variables (comma-separated). */
export function apiKeys(provider = 'openrouter') {
  const cfg = PROVIDERS[provider] || PROVIDERS.openrouter;
  const raw = cfg.envKeys.map((k) => process.env[k]).find(Boolean) || '';
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

/** Per-provider key rotation cursor. */
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
const KEY_SWITCH = new Set([401, 402, 403, 429]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function toError(res, provider = 'openrouter') {
  let body = null;
  try { body = await res.json(); } catch { /* text body */ }
  const err = typeof body?.error === 'string' ? { message: body.error } : (body?.error ?? {});
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

/** Fetch with exponential backoff and automatic key failover. */
async function requestWithRetry(path, payloadIn, { retries = 4, signal, provider = 'openrouter' } = {}) {
  let payload = payloadIn;
  const cfg = PROVIDERS[provider] || PROVIDERS.openrouter;
  const keys = apiKeys(provider);
  if (!keys.length) {
    throw new OpenRouterError(
      `No API key configured for ${cfg.label} (${cfg.envKeys[0]} in .env or via Settings).`);
  }
  if (keyCursor[provider] == null) keyCursor[provider] = 0;

  let lastErr;
  const totalAttempts = retries + keys.length;

  for (let attempt = 0; attempt <= totalAttempts; attempt++) {
    if (signal?.aborted) throw new OpenRouterError('Request cancelled.', { code: 'aborted' });

    const key = keys[keyCursor[provider] % keys.length];
    let res;
    try {
      res = await fetch(`${cfg.base}${path}`, {
        method: 'POST', headers: headers(key, provider), body: JSON.stringify(payload), signal,
      });
    } catch (e) {
      if (e.name === 'AbortError') throw new OpenRouterError('Request cancelled.', { code: 'aborted' });
      lastErr = new OpenRouterError(`Network unreachable: ${e.message}`, { retryable: true });
      await sleep(600 * 2 ** Math.min(attempt, 4));
      continue;
    }
    if (res.ok) return res;

    lastErr = await toError(res, provider);

    // Auto-adjust if model reports lower max_tokens limit
    const capped = /limited to (\d+)/i.exec(lastErr.message || '');
    if (capped && payload.max_tokens > Number(capped[1])) {
      payload = { ...payload, max_tokens: Number(capped[1]) };
      continue;
    }

    // Switch key immediately on key-related errors
    if (keys.length > 1 && KEY_SWITCH.has(lastErr.status)) {
      keyCursor[provider] = (keyCursor[provider] + 1) % keys.length;
      lastErr.retryable = true;
      if (attempt < totalAttempts) continue;
    }

    if (!lastErr.retryable || attempt === totalAttempts) throw lastErr;

    const hinted = Number(res.headers.get('retry-after')) * 1000;
    await sleep(Number.isFinite(hinted) && hinted > 0 ? Math.min(hinted, 15_000) : 800 * 2 ** Math.min(attempt, 4));
  }
  throw lastErr;
}

/**
 * Executes a streaming chat completion.
 * onEvent({ type: 'reasoning'|'content', text }) is called for each chunk.
 */
export async function streamChat(payload, { onEvent, signal, provider = 'openrouter' } = {}) {
  const res = await requestWithRetry(
    '/chat/completions',
    { ...payload, stream: true },
    { signal, provider }
  );

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let content = '';
  let reasoning = '';
  let usage = null;
  let responseModel = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;

        let json;
        try { json = JSON.parse(data); } catch { continue; }

        if (json.error) {
          const detail = json.error.metadata?.raw || json.error.message || 'Stream error';
          throw new OpenRouterError(detail, { status: json.error.code });
        }

        if (json.model && !responseModel) responseModel = json.model;
        if (json.usage) usage = json.usage;

        const delta = json.choices?.[0]?.delta;
        if (!delta) continue;

        const thinkChunk = delta.reasoning ?? delta.reasoning_content;
        if (thinkChunk) {
          reasoning += thinkChunk;
          onEvent?.({ type: 'reasoning', text: thinkChunk });
        }

        const textChunk = delta.content;
        if (textChunk) {
          content += textChunk;
          onEvent?.({ type: 'content', text: textChunk });
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { content, reasoning, usage, model: responseModel || payload.model };
}

/** Single non-streaming completion (used for titles and image generation). */
export async function complete(payload, { signal, retries = 2, provider = 'openrouter' } = {}) {
  const res = await requestWithRetry(
    '/chat/completions',
    { ...payload, stream: false },
    { retries, signal, provider }
  );
  return res.json();
}
