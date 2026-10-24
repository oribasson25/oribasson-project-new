import { useEffect, useState } from 'react';

/*
 * The speech bubble beside Ori that offers the recorded hello, then shows
 * it playing: a live waveform, the sentence being said, and a stop button.
 * Once a visitor has heard it (or waved it away) it shrinks to a small
 * replay button for the rest of their visits.
 */

const fmt = (sec) => {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * The line being said at `time` seconds. A transcript is either timed cues —
 * [{ at: seconds, text }], exact — or plain text, split into sentences and
 * timed by their length across the recording.
 */
function captionAt(transcript, time, duration) {
  if (Array.isArray(transcript)) {
    let line = null;
    for (const cue of transcript) if (cue.at <= time) line = cue.text;
    return line;
  }
  const sentences = String(transcript || '').trim().split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (!sentences.length || !duration) return null;
  const total = sentences.reduce((n, x) => n + x.length, 0);
  const progress = time / duration;
  let at = 0;
  for (const text of sentences) {
    at += text.length;
    if (progress < at / total) return text;
  }
  return sentences[sentences.length - 1];
}

const speakerIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

function Tail({ side }) {
  const at = side === 'top'
    ? { top: -6, left: '50%', marginLeft: -6, borderLeft: '1px solid var(--border)', borderTop: '1px solid var(--border)' }
    : { left: -6, top: 22, borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' };
  return <span aria-hidden="true" style={{ position: 'absolute', width: 12, height: 12, background: 'var(--bg-card)', transform: 'rotate(45deg)', ...at }} />;
}

export function IntroBubble({ t, voice, transcript, stacked }) {
  const { state, heard, duration, play, stop, dismiss, levelRef, audioRef } = voice;
  const playing = state === 'playing';
  const [, setTick] = useState(0);

  // Captions, waveform and progress follow the audio at ~12 frames a second.
  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0;
    let last = 0;
    const loop = (now) => {
      if (now - last > 80) { last = now; setTick((x) => x + 1); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  if (!voice.available) return null;

  // Heard before: a small round replay button on the figure's shoulder.
  if (!playing && heard) {
    return (
      <button type="button" onClick={play} title={t.introReplay} aria-label={t.introReplay}
        style={{
          position: 'absolute', top: stacked ? 6 : 14, right: stacked ? 0 : 6, zIndex: 3,
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)',
        }}>{speakerIcon}</button>
    );
  }

  const a = audioRef.current;
  const progress = a && duration ? Math.min(1, a.currentTime / duration) : 0;
  const caption = playing && a ? captionAt(transcript, a.currentTime, duration) : null;
  const level = playing ? levelRef.current : 0;
  const place = stacked
    ? { position: 'relative', margin: '2px auto 0', maxWidth: 'min(300px, 100%)' }
    : { position: 'absolute', left: '86%', top: '16%', width: 'max-content', maxWidth: 270 };

  return (
    <div className="fade-in" style={{
      ...place, zIndex: 3, background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: '9px 10px 9px 9px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <Tail side={stacked ? 'top' : 'left'} />
      {playing ? (
        <>
          <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 3, height: 26, padding: '0 4px', flexShrink: 0 }}>
            {[0.55, 1, 0.75, 0.9].map((k, i) => (
              <span key={i} style={{
                width: 3, borderRadius: 2, background: 'var(--primary)',
                height: 5 + Math.round(level * 20 * k * (0.75 + Math.random() * 0.25)), transition: 'height 0.08s',
              }} />
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div dir="auto" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.45 }}>
              {caption || fmt((duration || 0) - (a ? a.currentTime : 0))}
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-hover)', marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--primary)' }} />
            </div>
          </div>
          <button type="button" onClick={stop} title={t.introStop} aria-label={t.introStop}
            style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--bg-hover)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: 'currentColor' }} />
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={play}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', padding: 0, textAlign: 'start' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'var(--primary)', color: 'var(--primary-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>▶</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>{t.introOffer}</span>
            {duration > 0 && <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{fmt(duration)}</span>}
          </button>
          <button type="button" onClick={dismiss} title={t.introDismiss} aria-label={t.introDismiss}
            style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 15, lineHeight: 1, padding: '0 2px' }}>×</button>
        </>
      )}
    </div>
  );
}
