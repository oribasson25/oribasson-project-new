import { send, methodNotAllowed } from '../../server/http.js';
import { clearAdminCookie } from '../../server/auth.js';

/** POST /api/admin/logout */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  clearAdminCookie(res);
  return send(res, 200, { admin: false });
}
