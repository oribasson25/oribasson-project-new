import { send, methodNotAllowed } from '../../server/http.js';
import { requireAdmin } from '../../server/auth.js';
import { listConversations, getConversation, deleteConversation } from '../../server/conversations.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/*
 * GET    /api/admin/conversations            newest first (?before=<iso> pages back)
 * GET    /api/admin/conversations?id=<uuid>  one conversation, every message
 * DELETE /api/admin/conversations?id=<uuid>
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const q = new URL(req.url, 'http://local').searchParams;
  const id = q.get('id');
  if (id && !UUID.test(id)) return send(res, 400, { code: 'bad_request' });

  try {
    if (req.method === 'GET') {
      if (id) {
        const convo = await getConversation(id);
        return convo ? send(res, 200, convo) : send(res, 404, { code: 'not_found' });
      }
      const before = q.get('before');
      return send(res, 200, await listConversations({ before: before && !isNaN(Date.parse(before)) ? before : null }));
    }
    if (req.method === 'DELETE' && id) {
      await deleteConversation(id);
      return send(res, 200, { deleted: id });
    }
    return methodNotAllowed(res, ['GET', 'DELETE']);
  } catch (err) {
    console.error('[admin/conversations]', err.message);
    return send(res, 500, { code: 'server_error' });
  }
}
