import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { db, Conversations, Messages, Uploads, uid } from './db.js';
import { inspectFile, buildContentParts } from './files.js';
import { streamChat, complete, apiKeys, splitModel, PROVIDERS, OpenRouterError } from './openrouter.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uploadDir = path.join(root, 'data', 'uploads');
const generatedDir = path.join(root, 'data', 'generated');
// Her iki klasor de acilista var olmali; multer eksik dizine yazamaz.
await mkdir(uploadDir, { recursive: true });
await mkdir(generatedDir, { recursive: true });

/** ".env" icindeki "kimlik|ad,kimlik|ad" listesini ayristirir. */
function parseModels(raw) {
  return (raw || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, label] = entry.split('|').map((x) => (x || '').trim());
      return id ? { id, label: label || id } : null;
    })
    .filter(Boolean);
}

const CHAT_MODELS = parseModels(process.env.CHAT_MODELS).length
  ? parseModels(process.env.CHAT_MODELS)
  : [{ id: process.env.CHAT_MODEL || 'stealth/ox-alpha', label: 'Ox Alpha' }];

// Anahtari olmayan saglayicinin modellerini listeden dusur.
for (const m of CHAT_MODELS) m.provider = splitModel(m.id).provider;
const USABLE = CHAT_MODELS.filter((m) => apiKeys(m.provider).length > 0);
if (USABLE.length) CHAT_MODELS.length = 0, CHAT_MODELS.push(...USABLE);
for (const m of CHAT_MODELS) m.providerLabel = PROVIDERS[m.provider].label;

const CHAT_MODEL = CHAT_MODELS[0].id;
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'google/gemini-2.5-flash-image';

/** Istemciden gelen model kimligini yalnizca izinli listeyle esitler. */
const resolveModel = (wanted) =>
  CHAT_MODELS.some((m) => m.id === wanted) ? wanted : CHAT_MODEL;

// Kimlik dayatmiyoruz: birden fazla model kullaniliyor, her biri kendi
function buildSystemPrompt(lang, userName, customInstructions) {
  const langNames = {
    tr: 'Türkçe',
    en: 'English',
    ru: 'Русский',
    de: 'Deutsch',
  };
  const targetLang = langNames[lang] || 'Türkçe';

  let sys = `You are a helpful, expert AI assistant.
Language instructions:
- The user's active interface language is ${targetLang} (${lang || 'tr'}).
- CRITICAL LANGUAGE RULE: ALWAYS detect and match the language used by the user in their message. If the user asks in English, reply entirely in English. If the user asks in Turkish, reply in Turkish. If the user asks in Russian, reply in Russian. If the user asks in German, reply in German.
- If the language of the user query is ambiguous, reply in the user's preferred interface language: ${targetLang}.
- Format your response using clean Markdown. Always specify the programming language on code blocks (e.g. \`\`\`html, \`\`\`python, \`\`\`javascript).
- When generating HTML games or web applications, provide complete, self-contained single-file HTML (including all necessary CSS and JavaScript in <style> and <script> tags). Make them mobile-friendly: support BOTH touchscreen touch/tap events AND keyboard controls so they can be played on mobile touchscreens without a physical keyboard.
- When document, image, or video attachments are provided, examine them carefully and provide factual, concrete analysis. Never invent facts.`;

  if (userName && String(userName).trim()) {
    sys += `\nUser's name / salutation: ${String(userName).trim()}.`;
  }
  if (customInstructions && String(customInstructions).trim()) {
    sys += `\nUser's custom instructions:\n${String(customInstructions).trim()}`;
  }
  return sys;
}

/**
 * Kullanici sohbet ortasinda model degistirebiliyor. Gecmisteki yanitlar baska
 * bir modele aitse, yeni model onlari kendi sozu sanip kimligini taklit ediyor.
 * Bu not, hangi yanitin kime ait oldugunu acikca soyler.
 */
const IDENTITY_NOTE = `ONEMLI: Bu sohbetteki onceki asistan yanitlarinin bir kismi SENIN degil,
su modellerin urunudur: {{DIGERLERI}}. Sen onlardan biri DEGILSIN; onlarin kimligini ustlenme,
onlarin verdigi kimlik yanitini tekrarlama. Kim oldugun sorulursa kendi gercek kimligini
kendi bildigin sekilde soyle. Bu notu yanitinda anma, buradaki teknik kimlikleri aynen yazma,
yanitinin basina model adi veya koseli parantezli etiket EKLEME.`;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${uid()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 64 * 1024 * 1024, files: 10 },
});

export const api = express.Router();
api.use(express.json({ limit: '4mb' }));

/** Saglayici hatalarina Turkce, eyleme donuk bir ipucu ekler. */
function hintFor(e) {
  const msg = String(e?.message || '');
  const code = e?.status ?? e?.code;

  // HuggingFace'e ozgu durumlar once; aksi halde OpenRouter metinleri yanlislikla eklenir.
  if (e?.provider === 'hf' || /included credits|Inference Providers/i.test(msg)) {
    if (/depleted|included credits/i.test(msg)) {
      return 'HuggingFace\'in aylik ucretsiz kredisi (ucretsiz hesaplarda 0,10 USD) tukendi. '
        + 'Ayin basinda yenilenir. O zamana kadar OpenRouter modellerini kullanabilirsiniz; '
        + '"Ox Alpha" gunluk kotaya da tabi degildir.';
    }
    if (code === 401 || code === 403) {
      return 'HuggingFace anahtari reddedildi. .env icindeki HF_API_KEY degerini kontrol edin.';
    }
    return null;
  }

  // SIRA ONEMLI: gunluk kota mesaji da "credits" kelimesini icerdigi icin
  // once bunu yakalamazsak bakiye ipucu yanlislikla eklenir.
  if (/free-models-per-day/i.test(msg)) {
    return 'OpenRouter\'in gunluk bedava model kotasi doldu (bakiyesiz hesaplarda gunde ~50 istek). '
      + 'Kota yarin sifirlanir. "Ox Alpha" bu kotaya dahil degildir, calismaya devam eder. '
      + 'Hesaba 10 USD kredi eklenirse gunluk sinir 1000 istege cikar.';
  }
  if (code === 429 || /rate.?limit/i.test(msg)) {
    return 'Model su an yogun. Birkac saniye bekleyip tekrar deneyin; uygulama kendiliginden de yeniden dener.';
  }
  if (/for video/i.test(msg)) {
    return 'Video girdisi OpenRouter hesabinizda en az 1 USD bakiye gerektiriyor: https://openrouter.ai/credits';
  }
  if (code === 402 || /balance|afford|more credits/i.test(msg)) {
    return 'OpenRouter bakiyeniz yetersiz. Gorsel uretimi ucretli bir modele gittigi icin bakiye ister: '
      + 'https://openrouter.ai/credits';
  }
  if (code === 401 || code === 403) {
    return 'API anahtari reddedildi. .env icindeki OPENROUTER_API_KEYS degerini kontrol edin.';
  }
  if (code === 413 || /too large|payload/i.test(msg)) {
    return 'Gonderilen dosya cok buyuk. Daha kucuk bir dosya deneyin.';
  }
  return null;
}

const fail = (res, e) => {
  const status = e instanceof OpenRouterError ? (e.status ?? 502) : 500;
  const hint = hintFor(e);
  res.status(status).json({
    error: hint ? e.message + ' — ' + hint : e.message,
    code: e.code,
    retryable: !!e.retryable,
  });
};

/* ---------------------------------------------------------------- yapilandirma */

/**
 * Model yeteneklerini (baglam uzunlugu, gorsel girdi) saglayici kataloglarindan
 * bir kez cekip onbellege alir. Basarisiz olursa uygulama yine calisir,
 * sadece bu bilgiler bos kalir.
 */
let capsPromise = null;
function modelCaps() {
  if (capsPromise) return capsPromise;
  capsPromise = (async () => {
    const caps = {};
    const add = (id, ctx, mods) => {
      caps[id] = { context: ctx || 0, vision: (mods || []).includes('image') };
    };
    try {
      const r = await fetch('https://openrouter.ai/api/v1/models');
      for (const m of (await r.json()).data || []) {
        add(m.id, m.context_length, m.architecture?.input_modalities);
      }
    } catch { /* katalog yoksa sorun degil */ }
    if (apiKeys('hf').length) {
      try {
        const r = await fetch('https://router.huggingface.co/v1/models');
        for (const m of (await r.json()).data || []) {
          const ctx = Math.max(0, ...(m.providers || []).map((p) => p.context_length || 0));
          add('hf:' + m.id, ctx, m.architecture?.input_modalities);
        }
      } catch { /* yoksay */ }
    }
    return caps;
  })();
  return capsPromise;
}

/** Hesapta gorsel uretimini karsilayacak bakiye var mi? (kisa sureli onbellek) */
let creditCache = { at: 0, credits: null, total: null, usage: null };
async function remainingCredits() {
  if (Date.now() - creditCache.at < 60_000) return creditCache;
  try {
    const key = apiKeys()[0];
    const r = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const j = await r.json();
    const total = j?.data?.total_credits ?? 0;
    const usage = j?.data?.total_usage ?? 0;
    const left = total - usage;
    creditCache = { at: Date.now(), credits: left, total, usage };
  } catch {
    creditCache = { at: Date.now(), credits: null, total: null, usage: null };
  }
  return creditCache;
}

api.get('/config', async (_req, res) => {
  const creditInfo = await remainingCredits();
  const credits = creditInfo.credits;
  // ":free" ekli modeller OpenRouter'in gunluk bedava kotasina tabidir;
  // "stealth/ox-alpha" gibi eki olmayanlar degildir.
  // Yalnizca OpenRouter'in gunluk bedava kotasina TABI OLMAYANLAR.
  // HuggingFace modelleri ayri bir aylik krediye tabi, buraya girmemeli.
  const unmetered = CHAT_MODELS
    .filter((m) => m.provider === 'openrouter' && !m.id.endsWith(':free') && m.id !== 'openrouter/free')
    .map((m) => m.id);
  const caps = await modelCaps();
  res.json({
    unmetered,
    chatModel: CHAT_MODEL,
    chatModels: CHAT_MODELS.map((m) => ({
      ...m,
      context: caps[m.id]?.context ?? null,
      vision: caps[m.id]?.vision ?? null,
    })),
    imageModel: IMAGE_MODEL,
    // Gorsel uretimi ucretli bir modele gidiyor; bakiye yoksa pesinen soyle.
    imageGeneration: credits === null || credits > 0,
    credits,
    creditDetails: creditInfo,
    videoGeneration: false,
    videoUnderstanding: true,
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'high',
  });
});

/* ---------------------------------------------------------------- sohbetler */

api.get('/conversations', (req, res) => {
  const q = (req.query.q || '').toString().trim();
  res.json(q ? Conversations.search(q) : Conversations.list());
});

api.post('/conversations', (req, res) => {
  res.status(201).json(Conversations.create({ title: req.body?.title, model: CHAT_MODEL }));
});

api.get('/conversations/:id', (req, res) => {
  const conversation = Conversations.get(req.params.id);
  if (!conversation) return res.status(404).json({ error: 'Sohbet bulunamadi.' });
  res.json({ conversation, messages: Messages.listByConversation(conversation.id) });
});

api.patch('/conversations/:id', (req, res) => {
  if (!Conversations.get(req.params.id)) return res.status(404).json({ error: 'Sohbet bulunamadi.' });
  if (typeof req.body?.title === 'string') Conversations.rename(req.params.id, req.body.title.trim() || 'Yeni sohbet');
  if (typeof req.body?.pinned === 'boolean') Conversations.setPinned(req.params.id, req.body.pinned);
  res.json(Conversations.get(req.params.id));
});

api.delete('/conversations/:id', (req, res) => {
  Conversations.remove(req.params.id);
  res.json({ ok: true });
});

api.delete('/conversations', (_req, res) => {
  Conversations.removeAll();
  res.json({ ok: true });
});

api.post('/import', (req, res) => {
  const { conversations = [], messages = [] } = req.body || {};
  let cCount = 0, mCount = 0;
  for (const c of conversations) {
    if (!Conversations.get(c.id)) {
      Conversations.create({ id: c.id, title: c.title, model: c.model });
      cCount++;
    }
  }
  for (const m of messages) {
    try {
      Messages.add({
        conversationId: m.conversation_id || m.conversationId,
        role: m.role,
        content: m.content || '',
        reasoning: m.reasoning || null,
        attachments: m.attachments || [],
        images: m.images || [],
        meta: m.meta || {},
      });
      mCount++;
    } catch { }
  }
  res.json({ ok: true, conversations: cCount, messages: mCount });
});

/* ---------------------------------------------------------------- dosya yukleme */

api.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const out = [];
    for (const file of req.files ?? []) {
      const info = await inspectFile(file.path, file.originalname);
      const row = Uploads.add({
        name: file.originalname, kind: info.kind, mime: info.mime,
        size: file.size, path: file.path, text: info.text ?? null, error: info.error ?? null,
      });
      out.push({
        id: row.id, name: row.name, kind: row.kind, mime: row.mime,
        size: row.size, error: row.error,
        url: row.kind === 'image' || row.kind === 'video' ? `/files/${row.id}` : null,
      });
    }
    res.json({ files: out });
  } catch (e) { fail(res, e); }
});

/* ---------------------------------------------------------------- sohbet akisi */

api.post('/chat', async (req, res) => {
  const { conversationId, text = '', attachmentIds = [], effort = 'high',
          regenerate = false, model: wantedModel,
          webSearch = false, customInstructions = '', userName = '', lang = 'tr' } = req.body ?? {};
  const model = resolveModel(wantedModel);

  let conversation = conversationId ? Conversations.get(conversationId) : null;
  if (!conversation) conversation = Conversations.create({ model });
  // Sohbet acildiginda son kullanilan model geri yuklensin.
  if (conversation.model !== model) {
    db.prepare('UPDATE conversations SET model = ? WHERE id = ?').run(model, conversation.id);
    conversation = Conversations.get(conversation.id);
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  // Baglanti kesilirse akisi durdur. Not: req akisi govde okunur okunmaz
  // 'close' yaydigi icin dinleyici res uzerinde olmali.
  const controller = new AbortController();
  let finished = false;
  res.on('close', () => { if (!finished) controller.abort(); });

  try {
    // Yeniden uretimde son asistan yanitini sil, mevcut gecmisi tekrar kullan.
    if (regenerate) {
      const all = Messages.listByConversation(conversation.id);
      const last = all[all.length - 1];
      if (last?.role === 'assistant') Messages.removeFrom(conversation.id, last.id);
    }

    let notes = [];
    let userMessage = null;

    if (!regenerate) {
      const rows = Uploads.getMany(attachmentIds);
      const attachments = rows.map((r) => ({
        id: r.id, name: r.name, kind: r.kind, mime: r.mime, size: r.size,
        path: r.path, text: r.text, error: r.error,
      }));
      userMessage = Messages.add({
        conversationId: conversation.id,
        role: 'user',
        content: text,
        attachments: attachments.map(({ path: _p, text: _t, ...rest }) => ({
          ...rest, url: rest.kind === 'image' || rest.kind === 'video' ? `/files/${rest.id}` : null,
        })),
      });
      send({ type: 'user_message', message: userMessage });
    }

    // Gecmisin tamamini modele uygun parcalara cevir.
    const history = Messages.listByConversation(conversation.id);
    const sysContent = buildSystemPrompt(lang, userName, customInstructions);
    const messages = [{ role: 'system', content: sysContent }];
    let needsPdfPlugin = false;

    // Gecmiste baska model kullanildiysa bunu SISTEM mesajinda belirtiriz.
    // Etiketi asistan metnine gomunce model onu kendi yanitina kopyaliyordu.
    const otherModels = new Set();
    for (const m of history) {
      if (m.role === 'assistant') {
        const author = m.meta?.model;
        if (author && author !== model) otherModels.add(author);
        messages.push({ role: 'assistant', content: m.content || '(bos)' });
        continue;
      }
      const rows = Uploads.getMany((m.attachments ?? []).map((a) => a.id));
      const built = await buildContentParts(m.content, rows.map((r) => ({
        id: r.id, name: r.name, kind: r.kind, mime: r.mime, path: r.path, text: r.text, error: r.error,
      })));
      needsPdfPlugin ||= built.needsPdfPlugin;
      if (m.id === history[history.length - 1]?.id) notes = built.notes;
      messages.push({ role: 'user', content: built.parts });
    }

    // Kimlik notunu SON kullanici mesajinin hemen ONUNE ayri bir sistem mesaji
    // olarak koy: model en cok son baglama agirlik veriyor. Asistan metnine
    // gomulen etiketi ise model kendi yanitina kopyaliyordu.
    if (otherModels.size) {
      // Gorunen adlari kullan: ham kimlikleri veren modeller onlari aynen yaziyordu.
      const names = [...otherModels].map((id) =>
        (CHAT_MODELS.find((m) => m.id === id) || {}).label || id);
      const note = IDENTITY_NOTE.replace('{{DIGERLERI}}', names.join(', '));
      messages.splice(messages.length - 1, 0, { role: 'system', content: note });
    }

    const { provider, model: bareModel } = splitModel(model);
    // HuggingFace saglayicilarinin cikti sinirlari daha dusuk; guvenli bir
    // degerle basla, gerekirse istemci sinira gore kendini ayarlar.
    const payload = {
      model: bareModel,
      messages,
      max_tokens: provider === 'hf' ? Number(process.env.HF_MAX_TOKENS) || 8192 : 32768,
    };

    if (provider === 'openrouter') {
      // Akil yurutme derinligi ve PDF eklentisi OpenRouter'a ozgu.
      payload.reasoning = { effort: ['low', 'high', 'max'].includes(effort) ? effort : 'high' };
      payload.usage = { include: true };
      const plugins = [];
      if (needsPdfPlugin) plugins.push({ id: 'file-parser', pdf: { engine: 'pdf-text' } });
      if (webSearch) plugins.push({ id: 'web' });
      if (plugins.length) payload.plugins = plugins;
    } else {
      if (needsPdfPlugin) notes.push('Bu model PDF ayristirmayi desteklemiyor; PDF icerigi gonderilemedi.');
      if (webSearch) notes.push('Web arama ozelligi yalnizca OpenRouter modelleri tarafindan destekleniyor.');
    }

    send({ type: 'start', conversationId: conversation.id, notes });

    const result = await streamChat(payload, {
      provider,
      signal: controller.signal,
      onEvent: (ev) => send(ev),
    });

    const assistantMessage = Messages.add({
      conversationId: conversation.id,
      role: 'assistant',
      content: stripModelTag(result.content),
      reasoning: result.reasoning || null,
      meta: { model, usage: result.usage ?? null, effort: payload.reasoning?.effort ?? null },
    });

    // Ilk tur tamamlandiysa sohbete anlamli bir baslik ver.
    if (conversation.title === 'Yeni sohbet') {
      const title = await makeTitle(text || result.content, controller.signal, model);
      Conversations.rename(conversation.id, title);
    }

    send({
      type: 'done',
      message: assistantMessage,
      conversation: Conversations.get(conversation.id),
    });
  } catch (e) {
    const hint = hintFor(e);
    send({
      type: 'error',
      message: (e.message || 'Bilinmeyen hata') + (hint ? ' — ' + hint : ''),
      code: e.code ?? null,
      retryable: !!e.retryable,
    });
  } finally {
    finished = true;
    res.end();
  }
});

/** Model yine de basa "[... yaniti]" eklerse temizle. */
function stripModelTag(text) {
  return String(text || '').replace(/^\s*\[[^\]\n]{1,80}?\s*yaniti\]\s*\n?/i, '');
}

function sanitizeTitleSeed(seed) {
  if (!seed) return '';
  let s = String(seed);
  s = s.replace(/```[\s\S]*?```/g, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/<!DOCTYPE[^>]*>/gi, ' ');
  return s.replace(/\s+/g, ' ').trim().slice(0, 300);
}

function makeFallbackTitle(seed) {
  const clean = sanitizeTitleSeed(seed);
  if (!clean) return 'Yeni sohbet';
  let words = clean.split(' ').slice(0, 5).join(' ');
  if (words.length > 40) words = words.slice(0, 40) + '…';
  return words || 'Yeni sohbet';
}

function cleanGeneratedTitle(raw, fallback) {
  if (!raw) return fallback;
  let t = String(raw).trim();
  t = t.replace(/```[\s\S]*?```/g, '');
  t = t.replace(/<[^>]+>/g, '');
  t = t.replace(/<!DOCTYPE[^>]*>/gi, '');
  t = t.replace(/^["'#\s:.-]+|["'\s:.-]+$/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  if (!t || t.length < 2 || /^(<!|doctype|html|<div|<script|function\b|const\b|let\b|var\b|import\b)/i.test(t)) {
    return fallback;
  }
  return t.slice(0, 48);
}

async function makeTitle(seed, signal, modelId = CHAT_MODEL) {
  const cleanSeed = sanitizeTitleSeed(seed);
  const fallback = makeFallbackTitle(cleanSeed);
  if (!cleanSeed) return fallback;

  try {
    const { provider, model } = splitModel(modelId);
    const body = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a concise conversation title generator. Detect the language of the user request and output ONLY a 2 to 5 word title in that EXACT SAME language summarizing the request (English for English, Turkish for Turkish, Russian for Russian, German for German, etc.). Never output code, HTML, tags, quotes, or punctuation.',
        },
        {
          role: 'user',
          content: `Create a brief 2-5 word title in the exact same language as this request:\n"${cleanSeed}"`,
        },
      ],
      max_tokens: 30,
    };
    if (provider === 'openrouter') body.reasoning = { effort: 'low' };
    const out = await complete(body, { signal, retries: 1, provider });
    const t = out?.choices?.[0]?.message?.content;
    return cleanGeneratedTitle(t, fallback);
  } catch {
    return fallback;
  }
}

/* ---------------------------------------------------------------- gorsel uretimi */

api.post('/image', async (req, res) => {
  const { conversationId, prompt = '', attachmentIds = [] } = req.body ?? {};
  if (!prompt.trim()) return res.status(400).json({ error: 'Gorsel icin bir aciklama yazin.' });

  try {
    const rows = Uploads.getMany(attachmentIds).filter((r) => r.kind === 'image');
    const { parts } = await buildContentParts(prompt, rows.map((r) => ({
      id: r.id, name: r.name, kind: r.kind, mime: r.mime, path: r.path,
    })));

    // Uretim once yapilir; basarisiz olursa sohbete yarim mesaj yazilmaz.
    const out = await generateImage(parts);
    const message = out?.choices?.[0]?.message ?? {};
    const saved = [];
    for (const img of message.images ?? []) {
      const url = img?.image_url?.url ?? '';
      const m = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/s.exec(url);
      if (!m) continue;
      const ext = m[1].split('/')[1].replace('jpeg', 'jpg');
      const id = uid();
      const diskPath = path.join(generatedDir, `${id}.${ext}`);
      await writeFile(diskPath, Buffer.from(m[2], 'base64'));
      Uploads.add({ id, name: `uretilen-${id}.${ext}`, kind: 'image', mime: m[1], path: diskPath });
      saved.push({ id, url: `/files/${id}`, mime: m[1] });
    }

    if (!saved.length) {
      return res.status(502).json({ error: 'Model gorsel dondurmedi. Aciklamayi degistirip tekrar deneyin.' });
    }

    // Buraya kadar geldiysek gorsel elimizde; simdi sohbeti olustur/kaydet.
    let conversation = conversationId ? Conversations.get(conversationId) : null;
    if (!conversation) conversation = Conversations.create({ model: CHAT_MODEL });

    const userMessage = Messages.add({
      conversationId: conversation.id,
      role: 'user',
      content: prompt,
      attachments: rows.map((r) => ({
        id: r.id, name: r.name, kind: r.kind, mime: r.mime, size: r.size, url: `/files/${r.id}`,
      })),
      meta: { mode: 'image' },
    });

    const assistantMessage = Messages.add({
      conversationId: conversation.id,
      role: 'assistant',
      content: message.content?.trim() || '',
      images: saved,
      meta: { model: out.model ?? IMAGE_MODEL, mode: 'image', usage: out.usage ?? null },
    });

    if (conversation.title === 'Yeni sohbet') {
      Conversations.rename(conversation.id, prompt.replace(/\s+/g, ' ').trim().slice(0, 48) || 'Gorsel');
    }

    res.json({
      conversation: Conversations.get(conversation.id),
      userMessage,
      message: assistantMessage,
    });
  } catch (e) { fail(res, e); }
});

/**
 * Gorsel uretir. Bedava/az bakiyeli hesaplarda OpenRouter "su kadar token
 * karsilayabilirsin" diyerek reddedebiliyor; o sayiyi okuyup bir kez daha
 * deneriz.
 */
const IMAGE_MAX_TOKENS = Number(process.env.IMAGE_MAX_TOKENS) || 4096;

async function generateImage(parts) {
  const call = (maxTokens) => complete({
    model: IMAGE_MODEL,
    messages: [{ role: 'user', content: parts }],
    modalities: ['image', 'text'],
    max_tokens: maxTokens,
  }, { retries: 2 });

  try {
    return await call(IMAGE_MAX_TOKENS);
  } catch (e) {
    const afford = /can only afford (\d+)/i.exec(e?.message || '');
    if (!afford) throw e;
    // Kucuk bir emniyet payi birak; sinira dayanirsak yine reddediliyor.
    const budget = Math.floor(Number(afford[1]) * 0.9);
    if (!(budget > 512) || budget >= IMAGE_MAX_TOKENS) throw e;
    return call(budget);
  }
}

/* ---------------------------------------------------------------- dosya sunumu */

export function serveFile(req, res) {
  const row = Uploads.get(req.params.id);
  if (!row) return res.status(404).send('Bulunamadi');
  res.type(row.mime);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(row.name)}"`);
  res.sendFile(row.path);
}
