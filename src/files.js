import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';

export const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.heic', '.heif']);
export const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v']);
export const AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.flac']);
const TEXT_EXT = new Set([
  '.txt', '.md', '.markdown', '.csv', '.tsv', '.json', '.jsonl', '.yaml', '.yml', '.xml', '.html', '.htm',
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.rb', '.go', '.rs', '.java', '.kt', '.c', '.h',
  '.cpp', '.hpp', '.cs', '.php', '.sh', '.bash', '.zsh', '.sql', '.ini', '.toml', '.conf', '.env',
  '.log', '.svg', '.vue', '.svelte', '.css', '.scss', '.dart', '.swift', '.r', '.lua', '.pl',
]);

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.bmp': 'image/bmp', '.heic': 'image/heic', '.heif': 'image/heif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo', '.m4v': 'video/mp4',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.flac': 'audio/flac',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain', '.md': 'text/markdown', '.csv': 'text/csv', '.tsv': 'text/tab-separated-values',
  '.json': 'application/json', '.xml': 'application/xml', '.html': 'text/html', '.htm': 'text/html',
  '.yaml': 'text/yaml', '.yml': 'text/yaml', '.svg': 'image/svg+xml', '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Inspects an uploaded file, identifies its kind, and extracts text if applicable. */
export async function inspectFile(diskPath, originalName) {
  const ext = path.extname(originalName || diskPath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  if (IMAGE_EXT.has(ext)) return { kind: 'image', ext, mime };
  if (VIDEO_EXT.has(ext)) return { kind: 'video', ext, mime };
  if (AUDIO_EXT.has(ext)) return { kind: 'audio', ext, mime };
  if (ext === '.pdf') return { kind: 'pdf', ext, mime };

  if (ext === '.docx') {
    try {
      const { value } = await mammoth.extractRawText({ path: diskPath });
      return { kind: 'text', ext, mime, text: value.trim() };
    } catch (e) {
      return { kind: 'unsupported', ext, mime, error: `Could not read DOCX: ${e.message}` };
    }
  }

  if (TEXT_EXT.has(ext) || !ext) {
    const buf = await readFile(diskPath);
    // Prevent treating binary files as plain text
    if (buf.includes(0)) return { kind: 'unsupported', ext, mime, error: 'Binary file, cannot be parsed as text.' };
    return { kind: 'text', ext, mime, text: buf.toString('utf8') };
  }

  return { kind: 'unsupported', ext, mime, error: `File format ${ext || 'unknown'} is not supported.` };
}

const MAX_TEXT_CHARS = 400_000; // ~100k tokens, fits comfortably in large contexts

/**
 * Builds OpenAI-compatible content parts from uploaded attachments.
 * Returns: { parts, needsPdfPlugin, notes }
 */
export async function buildContentParts(text, attachments) {
  const parts = [];
  const notes = [];
  let needsPdfPlugin = false;

  for (const att of attachments) {
    const { kind, mime, name, path: diskPath } = att;

    if (kind === 'image') {
      const b64 = (await readFile(diskPath)).toString('base64');
      parts.push({ type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } });
      continue;
    }

    if (kind === 'video') {
      const b64 = (await readFile(diskPath)).toString('base64');
      parts.push({ type: 'video_url', video_url: { url: `data:${mime};base64,${b64}` } });
      continue;
    }

    if (kind === 'pdf') {
      const b64 = (await readFile(diskPath)).toString('base64');
      parts.push({ type: 'file', file: { filename: name, file_data: `data:application/pdf;base64,${b64}` } });
      needsPdfPlugin = true;
      continue;
    }

    if (kind === 'text') {
      let body = att.text ?? (await readFile(diskPath, 'utf8'));
      if (body.length > MAX_TEXT_CHARS) {
        body = body.slice(0, MAX_TEXT_CHARS);
        notes.push(`${name} was truncated to the first ${MAX_TEXT_CHARS} characters.`);
      }
      parts.push({ type: 'text', text: `<file name="${name}">\n${body}\n</file>` });
      continue;
    }

    if (kind === 'audio') {
      notes.push(`${name}: Audio input is not supported by this model, file skipped.`);
      continue;
    }

    notes.push(`${name}: ${att.error || 'unsupported file'}, skipped.`);
  }

  if (text && text.trim()) parts.push({ type: 'text', text });
  if (parts.length === 0) parts.push({ type: 'text', text: '(empty message)' });

  return { parts, needsPdfPlugin, notes };
}
