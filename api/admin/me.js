import { send } from '../../server/http.js';
import { isAdmin } from '../../server/auth.js';

/** GET /api/admin/me — whether this browser holds an admin session. */
export default async function handler(req, res) {
  return send(res, 200, { admin: isAdmin(req) });
}
