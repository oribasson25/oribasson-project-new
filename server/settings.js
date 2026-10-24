import { sql } from './db.js';
import { encrypt, decrypt } from './secrets.js';

/*
 * The models the admin can pick. `effort` and `fallbacks` are sent only where
 * the model accepts them: Haiku 4.5 takes neither.
 */
export const MODELS = [
  { id: 'claude-opus-5-5',   label: 'Claude Opus 5.5',   note: { en: 'Most capable · $4 / $20 per M tokens', he: 'החזק ביותר · ‎$4 / $20 למיליון טוקנים' }, effort: true, fallbacks: true },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', note: { en: 'Fast and capable · $2 / $10 per M tokens', he: 'מהיר ומוכשר · ‎$2 / $10 למיליון טוקנים' }, effort: true, fallbacks: true },
  { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  note: { en: 'Cheapest · $1 / $5 per M tokens', he: 'הזול ביותר · ‎$1 / $5 למיליון טוקנים' }, effort: false, fallbacks: false },
];
export const DEFAULT_MODEL = 'claude-opus-5-5';

export function modelInfo(id) {
  return MODELS.find((m) => m.id === id) || MODELS.find((m) => m.id === DEFAULT_MODEL);
}

async function row() {
  const [r] = await sql`select api_key_enc, model, chat_enabled, updated_at from site_settings where id = 1`;
  return r || null;
}

/** What the server itself uses: the decrypted key. Never sent to a browser. */
export async function loadSettings() {
  const r = await row();
  const apiKey = r && r.api_key_enc ? decrypt(r.api_key_enc) : null;
  return {
    apiKey,
    keyUnreadable: !!(r && r.api_key_enc && !apiKey),
    model: modelInfo(r && r.model).id,
    chatEnabled: r ? r.chat_enabled !== false : true,
    updatedAt: r ? r.updated_at : null,
  };
}

/** What the admin screen sees: whether a key is set and its last four characters. */
export async function publicSettings() {
  const s = await loadSettings();
  return {
    hasKey: !!s.apiKey,
    keyHint: s.apiKey ? `…${s.apiKey.slice(-4)}` : null,
    keyUnreadable: s.keyUnreadable,
    model: s.model,
    chatEnabled: s.chatEnabled,
    updatedAt: s.updatedAt,
    models: MODELS.map(({ id, label, note }) => ({ id, label, note })),
  };
}

/**
 * Patch semantics: a field that is absent is left alone. `apiKey: ''` with
 * `removeKey: true` clears the key; an empty apiKey on its own means "keep".
 */
export async function saveSettings({ apiKey, removeKey, model, chatEnabled }) {
  const current = await row();
  let enc = current ? current.api_key_enc : null;
  if (removeKey) enc = null;
  else if (typeof apiKey === 'string' && apiKey.trim()) enc = encrypt(apiKey.trim());
  const nextModel = model ? modelInfo(model).id : (current && current.model) || DEFAULT_MODEL;
  const nextEnabled = typeof chatEnabled === 'boolean' ? chatEnabled : current ? current.chat_enabled !== false : true;
  await sql`
    insert into site_settings (id, api_key_enc, model, chat_enabled, updated_at)
    values (1, ${enc}, ${nextModel}, ${nextEnabled}, now())
    on conflict (id) do update set
      api_key_enc = excluded.api_key_enc,
      model = excluded.model,
      chat_enabled = excluded.chat_enabled,
      updated_at = now()
  `;
  return publicSettings();
}
