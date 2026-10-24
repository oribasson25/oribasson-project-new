import crypto from 'crypto';

/*
 * Two environment variables hold everything secret:
 *
 *   ADMIN_PASSWORD   the one password for the admin screens
 *   SESSION_SECRET   signs the admin cookie and encrypts the stored API key
 *
 * SESSION_SECRET is optional. Without it, one is derived from the password —
 * which works, but changing the password then also signs you out and makes
 * the stored API key unreadable (you paste it again). Set it to keep the two
 * independent.
 *
 * On a laptop with no password set the password is "admin", so the admin
 * screens can be tried locally. Deployed without one, admin login is closed.
 */
const DEPLOYED = !!process.env.VERCEL;

export function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return DEPLOYED ? '' : 'admin';
}

function rootSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const pw = adminPassword();
  return pw ? `derived:${pw}` : '';
}

/** A purpose-specific 32-byte key, so one secret never does two jobs directly. */
export function subkey(purpose) {
  const root = rootSecret();
  if (!root) return null;
  return crypto.createHash('sha256').update(`${root}:${purpose}`).digest();
}

export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** AES-256-GCM, stored as v1:<iv>:<tag>:<ciphertext> in base64url. */
export function encrypt(plain) {
  const key = subkey('api-key');
  if (!key) throw new Error('No secret available to encrypt with.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), enc.toString('base64url')].join(':');
}

export function decrypt(stored) {
  try {
    const [v, iv, tag, enc] = String(stored || '').split(':');
    if (v !== 'v1') return null;
    const key = subkey('api-key');
    if (!key) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(enc, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;   // written under a different secret
  }
}

/** One-way, keyed: lets the admin view group visits without storing raw IPs. */
export function hashIp(ip) {
  const key = subkey('ip-hash') || Buffer.from('no-secret');
  return crypto.createHmac('sha256', key).update(String(ip || '')).digest('hex').slice(0, 16);
}
