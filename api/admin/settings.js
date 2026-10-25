import Anthropic from '@anthropic-ai/sdk';
import { readBody, send, methodNotAllowed } from '../../server/http.js';
import { requireAdmin } from '../../server/auth.js';
import { publicSettings, saveSettings, loadSettings, modelInfo } from '../../server/settings.js';

/*
 * GET  /api/admin/settings — key status (last four characters only), model, on/off.
 * PUT  /api/admin/settings — { apiKey?, removeKey?, model?, chatEnabled? }
 *
 * A new key, or a new model on the stored key, is checked against the API
 * before it is saved: a typo would otherwise sit there looking configured
 * until the first recruiter got an error.
 */
async function check(apiKey, model) {
  try {
    await new Anthropic({ apiKey, maxRetries: 0, timeout: 15000 }).models.retrieve(model);
    return null;
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return 'key_refused';
    if (err instanceof Anthropic.PermissionDeniedError) return 'key_refused';
    if (err instanceof Anthropic.NotFoundError) return 'model_unavailable';
    if (err instanceof Anthropic.APIConnectionError) return 'unreachable';
    return 'check_failed';
  }
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') return send(res, 200, await publicSettings());

    if (req.method === 'PUT') {
      const body = await readBody(req);
      const patch = {
        apiKey: typeof body.apiKey === 'string' ? body.apiKey.trim() : undefined,
        removeKey: body.removeKey === true,
        model: typeof body.model === 'string' ? modelInfo(body.model).id : undefined,
        chatEnabled: typeof body.chatEnabled === 'boolean' ? body.chatEnabled : undefined,
      };

      if (!patch.removeKey && (patch.apiKey || patch.model)) {
        const current = await loadSettings();
        const key = patch.apiKey || current.apiKey;
        if (key) {
          const problem = await check(key, patch.model || current.model);
          if (problem) return send(res, 400, { code: problem });
        }
      }
      return send(res, 200, await saveSettings(patch));
    }

    return methodNotAllowed(res, ['GET', 'PUT']);
  } catch (err) {
    console.error('[admin/settings]', err.message);
    return send(res, 500, { code: err.code === 'NO_DATABASE' ? 'no_database' : 'server_error', message: err.message });
  }
}
