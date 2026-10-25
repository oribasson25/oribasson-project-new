import { useEffect, useRef, useState } from 'react';
import profile from '../../content/profile.js';
import questions from '../../content/questions.js';
import { tx } from '../../shared/text.js';
import { Pet, PetStage } from './Pet.jsx';
import { IntroBubble } from './IntroBubble.jsx';
import { HomeFacts } from './HomeFacts.jsx';
import { Answer, Steps } from './Answer.jsx';
import { messageBidi } from './ui.jsx';
import { architectures } from './architectures.js';
import { diagramProjectId } from '../lib/projectDiagram.js';
import { useReducedMotion, useShortScreen, useTightScreen } from '../lib/hooks.js';
import { useIntroVoice } from '../lib/useIntroVoice.js';
import { loadMarkdown } from '../lib/loadMarkdown.js';

function firstName(lang) {
  return tx(profile.name, lang).split(' ')[0] || 'Ori';
}

function questionBefore(messages, index) {
  for (let i = index - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return '';
}

export function Composer({ value, onChange, onSend, onStop, busy, disabled, placeholder, dir, width = 720, fieldRef, autoFocus, sendLabel = 'Send', sendHint, stopLabel, stopHint, countLabel, large, onFieldFocus }) {
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
  const left = 2000 - value.length;
  const showCount = !!countLabel && value.length >= 1700;
  // The visible count updates on every key. A reader only needs to hear it
  // twice: when it first appears, and when the last forty turn red.
  const band = !showCount ? 'off' : left <= 40 ? 'short' : 'near';
  const bandRef = useRef(band);
  const leftRef = useRef(left);
  leftRef.current = left;
  const [countNote, setCountNote] = useState('');
  useEffect(() => {
    if (band === bandRef.current) return undefined;
    const prev = bandRef.current;
    bandRef.current = band;
    if (!countLabel || band === 'off') { setCountNote(''); return undefined; }
    if (band === 'short' || prev === 'off') setCountNote(countLabel(leftRef.current));
    else setCountNote('');
    return undefined;
  }, [band, countLabel]);
  const hintId = sendHint || (busy && stopHint) ? 'chat-composer-hint' : '';
  const describedBy = [hintId, showCount ? 'composer-count' : ''].filter(Boolean).join(' ');
  return (
    <div style={{ width: `min(${width}px, 100%)`, margin: '0 auto' }}>
    <div dir={dir} style={{
      background: 'var(--bg-card)', border: `1px solid ${focus ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 28, boxShadow: focus ? '0 0 0 4px var(--primary-dim), var(--shadow-lg)' : 'var(--shadow)',
      padding: 6, paddingInlineStart: 8, display: 'flex', alignItems: 'flex-end', gap: 6,
      transition: 'border-color 0.2s var(--ease), box-shadow 0.2s var(--ease)',
    }}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { setFocus(true); if (onFieldFocus) onFieldFocus(); }}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); onSend(); } }}
        dir="auto"
        rows={1}
        maxLength={2000}
        enterKeyHint="send"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-describedby={describedBy || undefined}
        style={{
          flex: 1, resize: 'none', border: 'none', background: 'transparent', outline: 'none',
          boxShadow: 'none', fontSize: 15, lineHeight: 1.55, padding: '12px 10px', maxHeight: 150,
        }}
      />
      <button type="button" onClick={busy ? onStop : onSend} disabled={busy ? false : (disabled || empty)}
        title={busy ? stopLabel : sendLabel} aria-label={busy ? stopLabel : sendLabel}
        aria-keyshortcuts={busy ? 'Escape' : undefined}
        className={busy || disabled || empty ? 'send-btn' : 'send-btn send-ready'}
        style={{
          width: large ? 44 : 40, height: large ? 44 : 40, borderRadius: '50%', flexShrink: 0, marginBottom: 3,
          opacity: busy || !(disabled || empty) ? 1 : 0.35,
        }}>{busy
          ? <span className="send-mark" aria-hidden="true" />
          : <span className="send-arrow" aria-hidden="true">↑</span>}
      </button>
      {(sendHint || (busy && stopHint)) && <span id="chat-composer-hint" className="sr-only">{busy && stopHint ? stopHint : sendHint}</span>}
      <span className="sr-only" aria-live="polite">{countNote}</span>
    </div>
    {showCount && (
      <div id="composer-count" dir={dir} className={left <= 40 ? 'composer-count is-short screen-only' : 'composer-count screen-only'}>
        {countLabel(left)}
      </div>
    )}
    </div>
  );
}

/* On a phone every question stays in view, as a two-column grid of small
   cards: six pills wrapped one per line filled half the screen. */
function QuestionChips({ items, onPick, disabled, dir, style, grid, className, label, stagger, dense }) {
  return (
    <div role="group" aria-label={label} dir={dir} className={className} style={{
      ...(grid
        ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: dense ? 6 : 8 }
        : { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }),
      ...style,
    }}>
      {items.map((text, i) => (
        <button key={text} type="button" className={stagger ? 'q-chip hero-rise' : 'q-chip'} onClick={() => onPick(text)} disabled={disabled}
          style={{
            ...(grid
              ? { borderRadius: 14, padding: dense ? '6px 10px' : '10px 12px', fontSize: dense ? 12 : 13, lineHeight: 1.35, minHeight: dense ? 44 : 52, textAlign: 'start', display: 'flex', alignItems: 'center' }
              : { borderRadius: 999, padding: '8px 14px', fontSize: 13, lineHeight: 1.35 }),
            ...(stagger ? { animationDelay: `${0.42 + i * 0.05}s` } : null),
          }}
        >{text}</button>
      ))}
    </div>
  );
}

function Notice({ children, dir }) {
  return (
    <div role="status" dir={dir} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '9px 14px', fontSize: 12.5, color: 'var(--text-2)',
      width: 'min(720px, 100%)', margin: '0 auto 12px', textAlign: 'center',
    }}>{children}</div>
  );
}

export function HomeChat({ t, lang, chat, status, stacked, seed, onSeedUsed }) {
  const [input, setInput] = useState('');
  const [revealing, setRevealing] = useState(null);
  const [figureHot, setFigureHot] = useState(false);
  const [stuck, setStuck] = useState(true);
  const listRef = useRef(null);
  const threadRef = useRef(null);
  const stick = useRef(true);
  const fieldRef = useRef(null);
  const focusAfterStop = useRef(false);
  const [halted, setHalted] = useState(false);
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const short = useShortScreen();
  const tight = useTightScreen();
  const reduced = useReducedMotion();
  const first = firstName(lang);
  const firstPerson = profile.voice === 'first-person';
  const offline = status.chat === 'unavailable';
  const { messages, pending, streamingId, error } = chat;
  const started = messages.length > 0;
  if (started) loadMarkdown();
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
      loadMarkdown();
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
    const onScroll = () => {
      const next = list.scrollHeight - list.scrollTop - list.clientHeight < 140;
      stick.current = next;
      setStuck((prev) => (prev === next ? prev : next));
    };
    const grew = new ResizeObserver(() => { if (stick.current) list.scrollTop = list.scrollHeight; });
    list.addEventListener('scroll', onScroll, { passive: true });
    grew.observe(thread);
    return () => { grew.disconnect(); list.removeEventListener('scroll', onScroll); };
  }, [started]);

  function submit(text) {
    const body = (text ?? input).trim();
    if (!body) return;
    loadMarkdown();
    setHalted(false);
    chat.send(body);
    setInput('');
  }

  function halt() {
    focusAfterStop.current = true;
    chat.stop();
  }

  // A stop before the first word puts that question back in the box.
  useEffect(() => {
    if (!chat.held) return;
    setInput(chat.held.text);
    setHalted(true);
    chat.takeHeld();
  }, [chat.held]);

  useEffect(() => {
    if (pending || !focusAfterStop.current) return;
    focusAfterStop.current = false;
    setHalted(true);
    fieldRef.current?.focus();
  }, [pending]);

  useEffect(() => {
    if (!pending) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.repeat || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      halt();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending]);

  const offlineNote = offline && <Notice dir={dir}>{t.unavailable}</Notice>;

  /* ── nothing said yet: Ori in the middle of the screen ── */
  if (!started) {
    return (
      <div className={stacked ? 'home-welcome is-phone' : 'home-welcome'} style={{
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'safe center', overflowY: 'auto',
      }}>
        <div className="sr-only" aria-live="polite">{halted ? t.stopped : ''}</div>
        <div className="home-stage hero-rise" style={{ animationDelay: '0.04s' }}>
          <PetStage size={stacked ? (tight ? 96 : short ? 112 : 148) : 230} mode={pending ? 'working' : 'idle'} pulse={chat.pulse} busy={pending} voice={voice} label={t.petJump} onHover={setFigureHot}>
            {!stacked && <IntroBubble t={t} voice={voice} transcript={introText} />}
            {stacked && voice.heard && voice.state !== 'playing' && <IntroBubble t={t} voice={voice} stacked />}
          </PetStage>
          {stacked && !(voice.heard && voice.state !== 'playing') && (
            <IntroBubble t={t} voice={voice} transcript={introText} stacked dense={short} />
          )}
          {/* On a phone the hello sits above the line, so either side is free. */}
          <HomeFacts lang={lang} t={t} hold={voice.state === 'playing' || figureHot}
            avoidRight={!stacked && voice.available && (!voice.heard || voice.state === 'playing')} />
        </div>
        <h1 className="hero-title hero-rise" dir={dir} style={{ animationDelay: '0.14s' }}>{t.hello(first)}</h1>
        <svg className="hero-rule hero-rise" viewBox="0 0 72 8" width="72" height="8" aria-hidden="true" style={{ animationDelay: '0.22s' }}>
          <path className="arch-line hero-draw" d="M2 4 H70" pathLength="1" />
        </svg>
        <div className="hero-sub hero-rise" dir={dir} style={{ animationDelay: '0.3s' }}>{stacked ? t.helloSubShort(firstPerson) : t.helloSub(first, firstPerson)}</div>

        <div className="hero-rise home-ask" style={{ animationDelay: '0.4s', width: '100%' }}>
          {offlineNote}
          <Composer value={input} onChange={setInput} onSend={() => submit()} onStop={halt} busy={pending} fieldRef={fieldRef}
            onFieldFocus={loadMarkdown}
            disabled={pending || offline} dir={dir} sendLabel={t.send} sendHint={t.sendHint}
            stopLabel={t.stop} stopHint={t.stopHint} countLabel={t.charsLeft} large={stacked}
            placeholder={stacked ? t.placeholderShort : t.placeholder} />
        </div>

        <QuestionChips items={chips} onPick={submit} disabled={pending || offline} dir={dir} grid={stacked} label={t.suggestions}
          className="home-chips" stagger dense={stacked && short} />

        <div className="hero-foot hero-rise" dir={dir} style={{ animationDelay: '0.74s' }}>{t.foot(first)}</div>
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
        padding: stacked ? '10px 16px 8px' : '16px 34px 12px',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <Pet crop="head" size={34} decorative />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 dir="auto" style={{ margin: 0, fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.threadTitle(first)}
          </h1>
          <div dir="ltr" style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
            {t.poweredBy(status.model)}
          </div>
        </div>
        <button type="button" onClick={chat.reset} className="thread-action"
          style={{
            fontSize: 11.5, fontWeight: 650, padding: '6px 12px', borderRadius: 10, flexShrink: 0,
            background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)',
          }}>{t.newChat}</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div ref={listRef} style={{
        height: '100%', minHeight: 0, overflowY: 'auto',
        padding: stacked ? '4px 16px 8px' : '6px 30px 10px',
      }}>
        <div ref={threadRef} role="log" dir={dir} aria-relevant="additions" aria-label={t.threadTitle(first)}
          style={{ width: 'min(720px, 100%)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              const bidi = messageBidi(msg.content);
              return (
                <div key={msg.id} dir={bidi.dir} className="bubble-user" style={bidi.style}>
                  <span className="sr-only">{t.you}: </span>
                  <span lang={bidi.lang} style={{ unicodeBidi: 'normal' }}>{msg.content}</span>
                </div>
              );
            }
            return (
            <Answer key={msg.id} content={msg.content} streaming={msg.id === streamingId}
              speaker={first} lang={lang} diagramLabel={t.architecture}
              diagram={architectures[diagramProjectId(questionBefore(messages, i), msg.content)] || null}
              onRevealed={() => setRevealing((id) => (id === msg.id ? null : id))} />
            );
          })}

          {waitingForFirstToken && <Steps steps={t.steps(first)} dir={dir} />}

          {error && !pending && (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <Pet pulse={chat.pulse} size={58} decorative />
              <div role="alert" dir={dir} style={{
                flex: 1, background: 'var(--danger-dim)', border: '1px solid rgba(220,38,38,0.25)',
                color: 'var(--danger-ink)', padding: '9px 13px', borderRadius: 'var(--r-md)',
                fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6,
              }}>
                <span style={{ flex: 1, minWidth: 160 }}>{t.errors[error] || t.errors.error}</span>
                {error !== 'refusal' && error !== 'unavailable' && (
                  <button type="button" onClick={chat.retry} className="thread-action"
                    style={{ background: 'var(--bg-card)', border: '1px solid rgba(220,38,38,0.3)', color: 'var(--danger)', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 650 }}>
                    {t.retry}
                  </button>
                )}
              </div>
            </div>
          )}

          {!writing && !error && last && last.role === 'assistant' && followUps.length > 0 && (
            <QuestionChips items={followUps} onPick={submit} disabled={offline} dir={dir} grid={stacked} label={t.suggestions} className="fade-in"
              style={{ justifyContent: 'flex-start', marginTop: 2 }} />
          )}
        </div>
      </div>
      {started && !stuck && (
        <button type="button" className="thread-latest" onClick={() => {
          const el = listRef.current;
          if (!el) return;
          // The scroll itself clears the control, once the latest line is in view.
          // Hiding it first made the control come back for a moment and cut the jump short.
          el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
        }}>{t.latest}</button>
      )}
      </div>

      <div className="screen-only" style={{ flexShrink: 0, padding: stacked ? '6px 16px 14px' : '6px 30px 20px' }}>
        {offlineNote}
        <div className="sr-only" aria-live="polite">{halted ? t.stopped : ''}</div>
        <Composer value={input} onChange={setInput} onSend={() => submit()} onStop={halt} busy={pending} fieldRef={fieldRef} dir={dir}
          onFieldFocus={loadMarkdown}
          disabled={pending || offline} placeholder={t.answer} autoFocus={!stacked} sendLabel={t.send} sendHint={t.sendHint}
          stopLabel={t.stop} stopHint={t.stopHint} countLabel={t.charsLeft} large={stacked} />
      </div>
    </div>
  );
}
