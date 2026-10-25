import { send } from '../server/http.js';
import { loadSettings, modelInfo } from '../server/settings.js';

/** GET /api/status — whether the chat can answer right now, and on which model. Says nothing about the key. */
export default async function handler(req, res) {
  try {
    const s = await loadSettings();
    const ready = !!(s.apiKey && s.chatEnabled);
    return send(res, 200, { chat: ready ? 'ready' : 'unavailable', model: ready ? modelInfo(s.model).label : null });
  } catch (err) {
    console.error('[status]', err.message);
    return send(res, 200, { chat: 'unavailable', model: null });
  }
}
