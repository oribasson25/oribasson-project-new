/*
 * One chat turn against /api/chat. The answer arrives as Server-Sent Events;
 * `onDelta` gets each piece of text as it is written. Resolves when the
 * answer is complete, rejects with a ChatError carrying a code the
 * interface has copy for.
 */
export class ChatError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export async function streamChat({ conversationId, visitorId, lang, messages, onDelta, signal }) {
  let resp;
  try {
    resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, visitorId, lang, messages }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ChatError('network');
  }

  if (!resp.ok) {
    let code = resp.status === 429 ? 'rate_limited' : resp.status === 503 ? 'unavailable' : 'error';
    try { code = (await resp.json()).code || code; } catch { /* not JSON */ }
    throw new ChatError(code === 'bad_request' ? 'error' : code);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let cut;
      while ((cut = buffer.indexOf('\n\n')) !== -1) {
        const chunk = buffer.slice(0, cut);
        buffer = buffer.slice(cut + 2);
        const line = chunk.split('\n').find((l) => l.startsWith('data: '));
        if (!line) continue;
        let event;
        try { event = JSON.parse(line.slice(6)); } catch { continue; }
        if (event.type === 'delta') onDelta(event.text);
        else if (event.type === 'error') throw new ChatError(event.code || 'error');
        else if (event.type === 'done') finished = true;
      }
      if (finished) break;
    }
  } catch (err) {
    if (err instanceof ChatError || err.name === 'AbortError') throw err;
    throw new ChatError('network');
  } finally {
    reader.cancel().catch(() => {});
  }

  if (!finished) throw new ChatError('network');
}
