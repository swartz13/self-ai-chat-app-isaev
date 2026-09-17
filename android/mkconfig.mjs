// .env icindeki anahtar ve model listesini tarayici tarafi yapilandirmasina cevirir.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , envPath, outPath] = process.argv;
const env = {};
let content = '';
try {
  content = readFileSync(envPath, 'utf8');
} catch {
  try {
    content = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  } catch {}
}

for (const line of content.split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) {
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[m[1]] = val;
  }
}

const keys = (v) => (v || '').split(',').map((k) => k.trim()).filter(Boolean);
const models = (env.CHAT_MODELS || '').split(',').map((e) => e.trim()).filter(Boolean).map((e) => {
  const [id, label] = e.split('|').map((x) => (x || '').trim());
  return id ? { id, label: label || id } : null;
}).filter(Boolean);

const isPublic = process.env.PUBLIC_RELEASE === '1' || process.env.PUBLIC_RELEASE === 'true';
const isPlaceholder = (k) => k.includes('your-openrouter-key') || k.includes('your-huggingface-key');

const cfg = {
  openrouterKeys: isPublic ? [] : keys(env.OPENROUTER_API_KEYS || env.OPENROUTER_API_KEY).filter((k) => !isPlaceholder(k)),
  hfKeys: isPublic ? [] : keys(env.HF_API_KEYS || env.HF_API_KEY).filter((k) => !isPlaceholder(k)),
  chatModels: models,
  imageModel: env.IMAGE_MODEL || 'google/gemini-2.5-flash-image',
  imageMaxTokens: Number(env.IMAGE_MAX_TOKENS) || 4096,
};

writeFileSync(outPath, 'window.OX_CONFIG = ' + JSON.stringify(cfg, null, 2) + ';\n');
console.log(`  config.js: ${cfg.chatModels.length} model, `
  + `${cfg.openrouterKeys.length} OpenRouter + ${cfg.hfKeys.length} HF anahtari`);
