import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'chat.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT 'Yeni sohbet',
  model       TEXT,
  pinned      INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  content         TEXT NOT NULL DEFAULT '',
  reasoning       TEXT,
  attachments     TEXT NOT NULL DEFAULT '[]',
  images          TEXT NOT NULL DEFAULT '[]',
  meta            TEXT NOT NULL DEFAULT '{}',
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS uploads (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL,
  mime       TEXT NOT NULL,
  size       INTEGER NOT NULL DEFAULT 0,
  path       TEXT NOT NULL,
  text       TEXT,
  error      TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conv_updated  ON conversations(updated_at DESC);
`);

const now = () => Date.now();
const uid = () => (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

const parse = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };

export const Conversations = {
  create({ title = 'Yeni sohbet', model = null, id = uid() } = {}) {
    const t = now();
    db.prepare(
      `INSERT INTO conversations (id,title,model,created_at,updated_at) VALUES (?,?,?,?,?)`
    ).run(id, title, model, t, t);
    return this.get(id);
  },
  get(id) {
    return db.prepare(`SELECT * FROM conversations WHERE id = ?`).get(id) ?? null;
  },
  list() {
    return db.prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
       FROM conversations c ORDER BY c.pinned DESC, c.updated_at DESC`
    ).all();
  },
  search(q) {
    const like = `%${q}%`;
    return db.prepare(
      `SELECT DISTINCT c.*, (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
       FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id
       WHERE c.title LIKE ? OR m.content LIKE ?
       ORDER BY c.pinned DESC, c.updated_at DESC`
    ).all(like, like);
  },
  rename(id, title) {
    db.prepare(`UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?`).run(title, now(), id);
    return this.get(id);
  },
  setPinned(id, pinned) {
    db.prepare(`UPDATE conversations SET pinned = ? WHERE id = ?`).run(pinned ? 1 : 0, id);
    return this.get(id);
  },
  touch(id) {
    db.prepare(`UPDATE conversations SET updated_at = ? WHERE id = ?`).run(now(), id);
  },
  remove(id) {
    db.prepare(`DELETE FROM messages WHERE conversation_id = ?`).run(id);
    db.prepare(`DELETE FROM conversations WHERE id = ?`).run(id);
  },
  removeAll() {
    db.exec(`DELETE FROM messages; DELETE FROM conversations;`);
  },
};

export const Messages = {
  add({ conversationId, role, content = '', reasoning = null, attachments = [], images = [], meta = {} }) {
    const id = uid();
    db.prepare(
      `INSERT INTO messages (id,conversation_id,role,content,reasoning,attachments,images,meta,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(id, conversationId, role, content, reasoning,
          JSON.stringify(attachments), JSON.stringify(images), JSON.stringify(meta), now());
    Conversations.touch(conversationId);
    return this.get(id);
  },
  get(id) {
    const row = db.prepare(`SELECT * FROM messages WHERE id = ?`).get(id);
    return row ? hydrate(row) : null;
  },
  listByConversation(conversationId) {
    return db.prepare(
      `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC`
    ).all(conversationId).map(hydrate);
  },
  /** Bir mesaj ve sonrasindaki her seyi siler (duzenle / yeniden uret icin). */
  removeFrom(conversationId, messageId) {
    const target = db.prepare(`SELECT created_at, rowid FROM messages WHERE id = ?`).get(messageId);
    if (!target) return;
    db.prepare(
      `DELETE FROM messages WHERE conversation_id = ?
       AND (created_at > ? OR (created_at = ? AND rowid >= ?))`
    ).run(conversationId, target.created_at, target.created_at, target.rowid);
  },
};

export const Uploads = {
  add({ id = uid(), name, kind, mime, size = 0, path: diskPath, text = null, error = null }) {
    db.prepare(
      `INSERT INTO uploads (id,name,kind,mime,size,path,text,error,created_at) VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(id, name, kind, mime, size, diskPath, text, error, now());
    return this.get(id);
  },
  get(id) { return db.prepare(`SELECT * FROM uploads WHERE id = ?`).get(id) ?? null; },
  getMany(ids) { return ids.map((i) => this.get(i)).filter(Boolean); },
};

function hydrate(row) {
  return {
    ...row,
    attachments: parse(row.attachments, []),
    images: parse(row.images, []),
    meta: parse(row.meta, {}),
  };
}

export { uid };
