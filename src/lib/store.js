/*
 * What the browser remembers about its own visitor: an anonymous id, the
 * language they picked, and their conversations (the sidebar's "Recent
 * questions"). Storage can be missing or full — private windows, blocked
 * site data — so every access is guarded and the site works without it.
 */
const VISITOR = 'ob_visitor';
const CHATS = 'ob_chats_v1';
const LANG = 'ob_lang';
const MAX_CHATS = 30;

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

let visitor = null;
export function visitorId() {
  if (visitor) return visitor;
  visitor = read(VISITOR, null);
  if (typeof visitor !== 'string' || visitor.length !== 36) {
    visitor = uuid();
    write(VISITOR, visitor);
  }
  return visitor;
}

/** English unless this visitor has switched to Hebrew themselves — never from the browser's language. */
export function savedLang() {
  const v = read(LANG, null);
  return v === 'he' ? 'he' : 'en';
}
export function saveLang(lang) { write(LANG, lang); }

/** [{ id, title, messages, updatedAt }], newest first. */
export function loadChats() {
  const list = read(CHATS, []);
  return Array.isArray(list) ? list.filter((c) => c && c.id && Array.isArray(c.messages)) : [];
}

export function upsertChat(chat) {
  const rest = loadChats().filter((c) => c.id !== chat.id);
  const next = [{ ...chat, updatedAt: Date.now() }, ...rest].slice(0, MAX_CHATS);
  write(CHATS, next);
  return next;
}

export function clearChats() {
  write(CHATS, []);
  return [];
}

export function chatTitle(messages) {
  const first = (messages || []).find((m) => m.role === 'user');
  return first ? first.content.replace(/\s+/g, ' ').trim() : '';
}
