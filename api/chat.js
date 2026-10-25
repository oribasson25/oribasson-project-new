import Anthropic from '@anthropic-ai/sdk';
import { readBody, send, clientIp, clientGeo, methodNotAllowed } from '../server/http.js';
import { loadSettings, modelInfo } from '../server/settings.js';
import { hit, LIMITS } from '../server/ratelimit.js';
import { systemPrompt } from '../server/prompt.js';
import { hashIp } from '../server/secrets.js';
import { saveConversation } from '../server/conversations.js';

/*
 * POST /api/chat — one visitor turn, answered as a Server-Sent Events stream.
 *
 * The browser sends the conversation so far; the key never leaves this
 * function. Events: {type:'delta', text} as the answer is written, then
 * {type:'done'} or {type:'error', code}.
 */

const MAX_TOKENS = 4096;       // per answer; answers are short, this is a cost ceiling
const MAX_CONTEXT = 20;        // messages of history sent to the model
const MAX_STORED = 80;         // messages kept for one conversation
const MAX_USER_CHARS = 2000;
const MAX_ASSISTANT_CHARS = 12000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The conversation as the browser sent it, or null if it is not one. */
function validMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_STORED - 1) return null;
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i] || {};
    const role = i % 2 === 0 ? 'user' : 'assistant';
    if (m.role !== role || typeof m.content !== 'string') return null;
    const content = m.content.trim();
    if (!content) return null;
    if (content.length > (role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS)) return null;
    out.push({ role, content });
  }
  return out[out.length - 1].role === 'user' ? out : null;
}

/** The tail the model sees — always starting on a visitor message. */
function contextWindow(messages) {
  let tail = messages.slice(-MAX_CONTEXT);
  if (tail[0].role !== 'user') tail = tail.slice(1);
  return tail;
}

function errorCode(err) {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return 'unavailable';
  if (err instanceof Anthropic.RateLimitError) return 'busy';
  if (err instanceof Anthropic.InternalServerError) return 'busy';      // 5xx, including 529 overloaded
  if (err instanceof Anthropic.APIConnectionError) return 'busy';
  return 'error';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const body = await readBody(req);
  const conversationId = String(body.conversationId || '');
  const visitorId = String(body.visitorId || '');
  const lang = body.lang === 'he' ? 'he' : 'en';
  const messages = validMessages(body.messages);
  if (!UUID.test(conversationId) || !UUID.test(visitorId) || !messages) {
    return send(res, 400, { code: 'bad_request' });
  }

  let settings;
  try {
    settings = await loadSettings();
  } catch (err) {
    console.error('[chat] settings unavailable:', err.message);
    return send(res, 503, { code: 'unavailable' });
  }
  if (!settings.apiKey || !settings.chatEnabled) return send(res, 503, { code: 'unavailable' });

  const ipHash = hashIp(clientIp(req));
  let allowed;
  try {
    allowed = (await hit(`ip-burst:${ipHash}`, LIMITS.perIpBurst))
      && (await hit(`ip-day:${ipHash}`, LIMITS.perIpDay))
      && (await hit('global-day', LIMITS.globalDay));
  } catch (err) {
    console.error('[chat] rate limiter unavailable:', err.message);
    return send(res, 503, { code: 'unavailable' });
  }
  if (!allowed) return send(res, 429, { code: 'rate_limited' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const emit = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);

  const info = modelInfo(settings.model);
  const params = {
    model: info.id,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(),
    messages: contextWindow(messages),
    // Caches the profile and the conversation so far; the next turn reads it back at a tenth of the price.
    cache_control: { type: 'ephemeral' },
    metadata: { user_id: ipHash },
  };
  if (info.effort) params.output_config = { effort: 'low' };   // a chat answer, not a research task
  if (info.fallbacks) {
    // If a safety classifier declines, the API retries on Anthropic's recommended model in the same stream.
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }

  const client = new Anthropic({ apiKey: settings.apiKey, maxRetries: 1 });
  const stream = client.beta.messages.stream(params);
  res.on('close', () => { if (!res.writableEnded) stream.abort(); });

  let answer = '';
  let failure = null;
  stream.on('text', (delta) => {
    answer += delta;
    emit({ type: 'delta', text: delta });
  });

  try {
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') failure = 'refusal';
  } catch (err) {
    // The visitor closed the page mid-answer: nothing to tell them, but the question is still worth keeping.
    failure = err instanceof Anthropic.APIUserAbortError ? 'left' : errorCode(err);
    if (failure !== 'left') console.error('[chat]', err.status || '', err.message);
  }

  if (failure !== 'left') emit(failure ? { type: 'error', code: failure } : { type: 'done' });

  try {
    const { country, city } = clientGeo(req);
    // Only a complete answer is kept; a refused or cut-off one was never shown as an answer.
    const stored = answer.trim() && !failure
      ? [...messages, { role: 'assistant', content: answer.trim() }]
      : messages;
    await saveConversation({
      id: conversationId, visitorId, lang, messages: stored, ipHash, country, city,
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
    });
  } catch (err) {
    console.error('[chat] could not save conversation:', err.message);
  }
  res.end();
}
