/* Small helpers every function uses. */

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/** Vercel parses JSON bodies already; the local dev server does not. */
export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 256 * 1024) break;
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

export function clientIp(req) {
  const h = req.headers || {};
  const fwd = String(h['x-vercel-forwarded-for'] || h['x-forwarded-for'] || h['x-real-ip'] || '');
  return fwd.split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || 'unknown';
}

/** Vercel's edge fills these in; locally they are simply absent. */
export function clientGeo(req) {
  const h = req.headers || {};
  const dec = (v) => { try { return v ? decodeURIComponent(String(v)) : null; } catch { return String(v); } };
  return { country: dec(h['x-vercel-ip-country']), city: dec(h['x-vercel-ip-city']) };
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  return send(res, 405, { error: 'Method not allowed' });
}
