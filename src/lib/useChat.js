import { useEffect, useRef, useState } from 'react';
import { streamChat, ChatError } from './chat.js';
import { uuid, visitorId, upsertChat } from './store.js';

/*
 * The conversation on the home screen. Lives above the screens so the sidebar
 * can reopen an old one and the phone layout shares the same thread.
 *
 * messages: [{ id, role: 'user' | 'assistant', content }]
 * A failed turn leaves its question on screen with an error and a retry; if
 * the visitor types something else instead, the unanswered question and the
 * new one go to the model together as one message.
 */
export function useChat({ lang, onSaved }) {
  const [chatId, setChatId] = useState(() => uuid());
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState({ name: null, n: 0 });
  const abortRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => () => abortRef.current && abortRef.current.abort(), []);

  function react(name) {
    setPulse((p) => ({ name, n: p.n + 1 }));
  }

  /** What the server expects: strictly alternating, starting and ending with the visitor. */
  function toWire(list) {
    const out = [];
    for (const m of list) {
      const last = out[out.length - 1];
      if (last && last.role === m.role) last.content += `\n\n${m.content}`;
      else out.push({ role: m.role, content: m.content });
    }
    return out;
  }

  async function run(list) {
    const controller = new AbortController();
    abortRef.current = controller;
    const id = chatId;
    const answerId = uuid();
    setPending(true);
    setError(null);
    let answer = '';
    try {
      await streamChat({
        conversationId: id,
        visitorId: visitorId(),
        lang,
        messages: toWire(list),
        signal: controller.signal,
        onDelta: (text) => {
          answer += text;
          setStreamingId(answerId);
          setMessages((prev) => {
            const has = prev.some((m) => m.id === answerId);
            return has
              ? prev.map((m) => (m.id === answerId ? { ...m, content: answer } : m))
              : [...prev, { id: answerId, role: 'assistant', content: answer }];
          });
        },
      });
      const done = [...list, { id: answerId, role: 'assistant', content: answer.trim() }];
      setMessages(done);
      onSaved(upsertChat({ id, messages: done }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      // A half-written answer is not an answer: take it back and offer a retry.
      setMessages(list);
      setError(err instanceof ChatError ? err.code : 'error');
      react('failed');
      onSaved(upsertChat({ id, messages: list }));
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setPending(false);
        setStreamingId(null);
      }
    }
  }

  function send(text) {
    const body = String(text || '').trim();
    if (!body || pending) return;
    const list = [...messagesRef.current, { id: uuid(), role: 'user', content: body }];
    setMessages(list);
    run(list);
  }

  function retry() {
    if (pending) return;
    const list = messagesRef.current;
    if (list.length && list[list.length - 1].role === 'user') run(list);
  }

  function reset() {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
    setPending(false);
    setStreamingId(null);
    setError(null);
    setMessages([]);
    setChatId(uuid());
  }

  function open(chat) {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
    setPending(false);
    setStreamingId(null);
    setError(null);
    setChatId(chat.id);
    setMessages(chat.messages.map((m) => ({ id: m.id || uuid(), role: m.role, content: m.content })));
  }

  return { chatId, messages, pending, streamingId, error, pulse, react, send, retry, reset, open };
}
