import { useEffect, useRef, useState } from 'react';
import profile from '../../content/profile.js';
import questions from '../../content/questions.js';
import { tx } from '../../shared/text.js';
import { Pet, PetStage } from './Pet.jsx';
import { IntroBubble } from './IntroBubble.jsx';
import { Answer, Steps } from './Answer.jsx';
import { useIntroVoice } from '../lib/useIntroVoice.js';

function firstName(lang) {
  return tx(profile.name, lang).split(' ')[0] || 'Ori';
}

export function Composer({ value, onChange, onSend, disabled, placeholder, dir, width = 720, fieldRef, autoFocus }) {
  const [focus, setFocus] = useState(false);
  const own = useRef(null);
  const ref = fieldRef || own;

  // Grows with the text, up to a limit, like 8Legs' composer.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [value]);

  const empty = !value.trim();
  return (
    <div dir={dir} style={{
      width: `min(${width}px, 100%)`, margin: '0 auto',
      background: 'var(--bg-card)', border: `1px solid ${focus ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 26, boxShadow: focus ? '0 0 0 4px var(--primary-dim), var(--shadow)' : 'var(--shadow)',
      padding: '5px 6px', display: 'flex', alignItems: 'flex-end', gap: 8,
      transition: 'border-color 0.18s, box-shadow 0.18s',
    }}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); onSend(); } }}
        dir="auto"
        rows={1}
        maxLength={2000}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          flex: 1, resize: 'none', border: 'none', background: 'transparent', outline: 'none',
          boxShadow: 'none', fontSize: 14.5, lineHeight: 1.6, padding: '13px 12px', maxHeight: 150,
        }}
      />
      <button type="button" onClick={onSend} disabled={disabled || empty} title="Send" aria-label="Send"
        style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, marginBottom: 4,
          background: 'var(--primary)', color: 'var(--primary-ink)', fontSize: 17, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: disabled || empty ? 0.35 : 1,
        }}>↑</button>
    </div>
  );
}

/* On a phone every question stays in view, as a two-column grid of small
   cards: six pills wrapped one per line filled half the screen. */
function QuestionChips({ items, onPick, disabled, dir, style, grid, className }) {
  return (
    <div dir={dir} className={className} style={{
      ...(grid
        ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
        : { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }),
      ...style,
    }}>
      {items.map((text) => (
        <button key={text} type="button" onClick={() => onPick(text)} disabled={disabled}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)',
            fontWeight: 600,
            ...(grid
              ? { borderRadius: 14, padding: '9px 12px', fontSize: 12.5, lineHeight: 1.35, minHeight: 50, textAlign: 'start', display: 'flex', alignItems: 'center' }
              : { borderRadius: 999, padding: '8px 15px', fontSize: 12.5 }),
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >{text}</button>
      ))}
    </div>
  );
}

function Notice({ children, dir }) {
  return (
    <div dir={dir} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '9px 14px', fontSize: 12.5, color: 'var(--text-2)',
      width: 'min(720px, 100%)', margin: '0 auto 12px', textAlign: 'center',
    }}>{children}</div>
  );
}

export function HomeChat({ t, lang, chat, status, stacked, seed, onSeedUsed }) {
  const [input, setInput] = useState('');
  const [revealing, setRevealing] = useState(null);
  const listRef = useRef(null);
  const threadRef = useRef(null);
  const stick = useRef(true);
  const fieldRef = useRef(null);
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const first = firstName(lang);
  const firstPerson = profile.voice === 'first-person';
  const offline = status.chat === 'unavailable';
  const { messages, pending, streamingId, error } = chat;
  const started = messages.length > 0;
  const chips = (questions[lang] || questions.en || []);
  const intro = profile.intro || {};
  const voice = useIntroVoice(tx(intro.audio, lang));
  // Timed cues are an array, so they are picked by language here rather than by tx().
  const introText = Array.isArray(intro.transcript) ? intro.transcript
    : intro.transcript && typeof intro.transcript === 'object'
      ? (intro.transcript[lang] || intro.transcript.en || intro.transcript.he || '')
      : intro.transcript || '';

  // Something elsewhere on the site asked a question ("Ask about this project").
  useEffect(() => {
    if (seed && seed.text) {
      chat.send(seed.text);
      onSeedUsed();
    }
  }, [seed && seed.n]);

  // The hello belongs to the welcome screen; asking a question ends it.
  useEffect(() => { if (started && voice.state === 'playing') voice.stop(); }, [started]);

  // Wave hello the first time the welcome screen shows.
  const waved = useRef(false);
  useEffect(() => {
    if (!started && !waved.current) {
      waved.current = true;
      const timer = setTimeout(() => chat.react('waving'), 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [started]);

  // The answer is written out after it arrives, so it is still being written
  // until the reveal says it is done, not just until the stream ends.
  useEffect(() => { if (streamingId) setRevealing(streamingId); }, [streamingId]);
  const writing = pending || (!!revealing && messages.some((m) => m.id === revealing));

  // A new question scrolls to the bottom.
  useEffect(() => {
    const el = listRef.current;
    if (el && (stick.current || !streamingId)) el.scrollTop = el.scrollHeight;
  }, [messages, pending, error]);

  // Follow the answer as it is written, unless the visitor scrolled up to read.
  useEffect(() => {
    const list = listRef.current;
    const thread = threadRef.current;
    if (!list || !thread || typeof ResizeObserver === 'undefined') return undefined;
    const onScroll = () => { stick.current = list.scrollHeight - list.scrollTop - list.clientHeight < 140; };
    const grew = new ResizeObserver(() => { if (stick.current) list.scrollTop = list.scrollHeight; });
    list.addEventListener('scroll', onScroll, { passive: true });
    grew.observe(thread);
    return () => { grew.disconnect(); list.removeEventListener('scroll', onScroll); };
  }, [started]);

  function submit(text) {
    const body = (text ?? input).trim();
    if (!body) return;
    chat.send(body);
    setInput('');
  }

  const offlineNote = offline && <Notice dir={dir}>{t.unavailable}</Notice>;

  /* ── nothing said yet: Ori in the middle of the screen ── */
  if (!started) {
    return (
      <div style={{
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: stacked ? '8px 18px 18px' : '0 34px 50px', overflowY: 'auto',
      }}>
        <PetStage size={stacked ? 148 : 230} mode={pending ? 'working' : 'idle'} pulse={chat.pulse} busy={pending} voice={voice}>
          {!stacked && <IntroBubble t={t} voice={voice} transcript={introText} />}
          {stacked && voice.heard && voice.state !== 'playing' && <IntroBubble t={t} voice={voice} stacked />}
        </PetStage>
        {stacked && !(voice.heard && voice.state !== 'playing') && (
          <IntroBubble t={t} voice={voice} transcript={introText} stacked />
        )}
        <div dir={dir} style={{
          fontSize: stacked ? 25 : 30, fontWeight: 800, letterSpacing: '-0.035em',
          textAlign: 'center', marginTop: 6,
        }}>{t.hello(first)}</div>
        <div dir={dir} style={{
          fontSize: 13.5, color: 'var(--text-2)', textAlign: 'center',
          marginTop: stacked ? 6 : 9, lineHeight: 1.65, maxWidth: 520,
        }}>{stacked ? t.helloSubShort(firstPerson) : t.helloSub(first, firstPerson)}</div>

        <div style={{ width: '100%', marginTop: stacked ? 20 : 24 }}>
          {offlineNote}
          <Composer value={input} onChange={setInput} onSend={() => submit()} fieldRef={fieldRef}
            disabled={pending || offline} dir={dir}
            placeholder={stacked ? t.placeholderShort : t.placeholder} />
        </div>

        <QuestionChips items={chips} onPick={submit} disabled={pending || offline} dir={dir} grid={stacked}
          style={{ marginTop: stacked ? 14 : 18, width: stacked ? '100%' : 'min(760px, 100%)' }} />

        {!stacked && (
          <div dir={dir} style={{ marginTop: 26, fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center' }}>{t.foot(first)}</div>
        )}
      </div>
    );
  }

  /* ── in conversation: Ori moves into the corner ── */
  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.content));
  const followUps = chips.filter((q) => !asked.has(q)).slice(0, 3);
  const last = messages[messages.length - 1];
  const waitingForFirstToken = pending && last && last.role === 'user';

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div dir={dir} style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 11,
        padding: stacked ? '8px 16px 6px' : '14px 30px 10px',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <Pet crop="head" size={34} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div dir="auto" style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.threadTitle(first)}
          </div>
          <div dir="ltr" style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
            {t.poweredBy(status.model)}
          </div>
        </div>
        <button type="button" onClick={chat.reset}
          style={{
            fontSize: 11.5, fontWeight: 650, padding: '6px 12px', borderRadius: 10, flexShrink: 0,
            background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)',
          }}>{t.newChat}</button>
      </div>

      <div ref={listRef} style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: stacked ? '4px 16px 8px' : '6px 30px 10px',
      }}>
        <div ref={threadRef} style={{ width: 'min(720px, 100%)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg) => (msg.role === 'user' ? (
            <div key={msg.id} dir="auto" style={{
              alignSelf: 'flex-end', maxWidth: '85%', background: 'var(--primary)', color: 'var(--primary-ink)',
              padding: '10px 14px', borderRadius: '16px 16px 4px 16px', fontSize: 13.5,
              lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{msg.content}</div>
          ) : (
            <Answer key={msg.id} content={msg.content} streaming={msg.id === streamingId}
              onRevealed={() => setRevealing((id) => (id === msg.id ? null : id))} />
          )))}

          {waitingForFirstToken && <Steps steps={t.steps(first)} dir={dir} />}

          {error && !pending && (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <Pet pulse={chat.pulse} size={58} />
              <div dir={dir} style={{
                flex: 1, background: 'var(--danger-dim)', border: '1px solid rgba(220,38,38,0.25)',
                color: 'var(--danger)', padding: '9px 13px', borderRadius: 'var(--r-md)',
                fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6,
              }}>
                <span style={{ flex: 1, minWidth: 160 }}>{t.errors[error] || t.errors.error}</span>
                {error !== 'refusal' && error !== 'unavailable' && (
                  <button type="button" onClick={chat.retry}
                    style={{ background: 'var(--bg-card)', border: '1px solid rgba(220,38,38,0.3)', color: 'var(--danger)', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 650 }}>
                    {t.retry}
                  </button>
                )}
              </div>
            </div>
          )}

          {!writing && !error && last && last.role === 'assistant' && followUps.length > 0 && (
            <QuestionChips items={followUps} onPick={submit} disabled={offline} dir={dir} grid={stacked} className="fade-in"
              style={{ justifyContent: 'flex-start', marginTop: 2 }} />
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: stacked ? '6px 16px 14px' : '6px 30px 20px' }}>
        {offlineNote}
        <Composer value={input} onChange={setInput} onSend={() => submit()} dir={dir}
          disabled={pending || offline} placeholder={t.answer} autoFocus={!stacked} />
      </div>
    </div>
  );
}
