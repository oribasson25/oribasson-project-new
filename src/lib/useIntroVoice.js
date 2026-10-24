import { useEffect, useRef, useState } from 'react';

/*
 * Ori's recorded hello. Browsers will not start sound before the visitor
 * touches the page, so it is offered rather than played: the first tap on
 * the offer starts it, and the visitor is remembered so it is offered once.
 *
 * While it plays, the voice's loudness is measured every frame into
 * levelRef (0–1). The figure and its glitch read that ref in their own
 * animation loops, so nothing re-renders at sixty frames a second.
 */
const HEARD_KEY = 'ob_intro_heard_v1';

function readHeard() {
  try { return localStorage.getItem(HEARD_KEY) === '1'; } catch { return false; }
}

export function useIntroVoice(src) {
  const [state, setState] = useState('idle');        // 'idle' | 'playing' | 'ended'
  const [heard, setHeard] = useState(readHeard);
  const [failed, setFailed] = useState(false);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);
  const levelRef = useRef(0);
  const rafRef = useRef(0);
  const marksRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    if (!src) return undefined;
    setFailed(false);
    const a = new Audio();
    a.preload = 'metadata';
    a.src = src;
    const onMeta = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const onError = () => setFailed(true);
    const onEnded = () => finish();
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('error', onError);
    a.addEventListener('ended', onEnded);
    audioRef.current = a;
    return () => {
      a.pause();
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('error', onError);
      a.removeEventListener('ended', onEnded);
      cancelAnimationFrame(rafRef.current);
      if (ctxRef.current) ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
      analyserRef.current = null;
      audioRef.current = null;
    };
  }, [src]);

  function markHeard() {
    setHeard(true);
    try { localStorage.setItem(HEARD_KEY, '1'); } catch { /* storage unavailable */ }
  }

  function measure(now) {
    const an = analyserRef.current;
    let level;
    if (an) {
      const data = dataRef.current;
      an.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const x = (data[i] - 128) / 128;
        sum += x * x;
      }
      level = Math.min(1, Math.max(0, (Math.sqrt(sum / data.length) - 0.015) * 7));
    } else {
      // No Web Audio: a flutter that still reads as speech.
      level = 0.25 + 0.3 * Math.abs(Math.sin(now / 95)) * Math.random();
    }
    // Rise at once, fall slowly — syllables, not samples.
    levelRef.current = Math.max(level, levelRef.current * 0.86);
    rafRef.current = requestAnimationFrame(measure);
  }

  function finish() {
    cancelAnimationFrame(rafRef.current);
    levelRef.current = 0;
    marksRef.current.end = performance.now();
    setState('ended');
  }

  /** Must run inside the click: that tap is what lets the browser make sound. */
  function play() {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          const source = ctx.createMediaElementSource(a);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 1024;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          ctxRef.current = ctx;
          analyserRef.current = analyser;
          dataRef.current = new Uint8Array(analyser.fftSize);
        }
      }
      if (ctxRef.current) ctxRef.current.resume();
    } catch {
      analyserRef.current = null;   // the voice still plays; the figure uses the flutter
    }
    a.currentTime = 0;
    a.play().then(() => {
      marksRef.current.start = performance.now();
      setState('playing');
      markHeard();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    }).catch(() => setState('idle'));
  }

  function stop() {
    if (audioRef.current) audioRef.current.pause();
    finish();
  }

  return {
    available: !!src && !failed,
    state, heard, duration,
    play, stop, dismiss: markHeard,
    levelRef, audioRef, marksRef,
  };
}
