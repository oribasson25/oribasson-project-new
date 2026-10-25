import crypto from 'crypto';
import { subkey } from './secrets.js';
import { send } from './http.js';

/*
 * The admin session is a signed cookie: { exp } and an HMAC over it. There is
 * one admin and no user table, so there is nothing else for it to carry.
 * HttpOnly keeps it away from page scripts; SameSite=Strict keeps another
 * site from riding it into a settings change.
 */
const COOKIE = 'ob_admin';
const MAX_AGE = 60 * 60 * 24 * 7;   // a week

function sign(payload) {
  const key = subkey('admin-session');
  if (!key) return null;
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', key).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token) {
  const key = subkey('admin-session');
  if (!key || !token) return null;
  const [body, mac] = String(token).split('.');
  if (!body || !mac) return null;
  const want = crypto.createHmac('sha256', key).update(body).digest('base64url');
  if (want.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(mac))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

function readCookie(req, name) {
  const raw = String((req.headers && req.headers.cookie) || '');
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function cookieFlags() {
  return `Path=/; HttpOnly; SameSite=Strict${process.env.VERCEL ? '; Secure' : ''}`;
}

export function setAdminCookie(res) {
  const token = sign({ exp: Date.now() + MAX_AGE * 1000 });
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Max-Age=${MAX_AGE}; ${cookieFlags()}`);
}

export function clearAdminCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Max-Age=0; ${cookieFlags()}`);
}

export function isAdmin(req) {
  return !!verify(readCookie(req, COOKIE));
}

/** Gate for admin-only endpoints. Returns false after answering 401. */
export function requireAdmin(req, res) {
  if (isAdmin(req)) return true;
  send(res, 401, { error: 'Not signed in' });
  return false;
}
