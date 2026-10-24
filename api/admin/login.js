import { readBody, send, clientIp, methodNotAllowed } from '../../server/http.js';
import { adminPassword, safeEqual, hashIp } from '../../server/secrets.js';
import { setAdminCookie } from '../../server/auth.js';
import { hit, peek, LIMITS } from '../../server/ratelimit.js';

/** POST /api/admin/login { password } — sets the admin cookie. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const expected = adminPassword();
  if (!expected) return send(res, 503, { code: 'not_configured' });

  try {
    const bucket = `login-fail:${hashIp(clientIp(req))}`;
    if (!(await peek(bucket, LIMITS.loginFail))) return send(res, 429, { code: 'rate_limited' });

    const { password } = await readBody(req);
    if (typeof password !== 'string' || !password || !safeEqual(password, expected)) {
      await hit(bucket, LIMITS.loginFail);
      return send(res, 401, { code: 'wrong_password' });
    }
  } catch (err) {
    console.error('[admin/login]', err.message);
    return send(res, 503, { code: err.code === 'NO_DATABASE' ? 'no_database' : 'server_error' });
  }

  setAdminCookie(res);
  return send(res, 200, { admin: true });
}
