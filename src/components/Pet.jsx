import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/hooks.js';

/*
 * Ori, from the Codex pet spritesheet (v2 layout): 8 columns × 11 rows of
 * 192×208 cells. Rows 0–8 are animations, rows 9–10 are sixteen look
 * directions, clockwise from straight up.
 *
 * The left-facing look frames in this sheet face right, so every look to the
 * left is the matching right-hand frame mirrored.
 */
const SHEET = '/pet/ori.webp';
const CW = 192;
const CH = 208;
const COLS = 8;
const ROWS = 11;
const NEUTRAL = { row: 0, col: 6 };
// The head, in cell pixels: centred on the figure, from the top of the hair.
const HEAD = { x: 47, y: 3, size: 96 };

/* Frame timings are the Codex pet contract's, except `working`: its six
   frames are six different poses, which read as a flicker at 120ms. */
const ANIMS = {
  idle:    { row: 0, ms: [280, 110, 110, 140, 140, 320], loop: true, rest: [2400, 5200] },
  waving:  { row: 3, ms: [140, 140, 140, 280], times: 2 },
  jumping: { row: 4, ms: [140, 140, 140, 140, 280] },
  failed:  { row: 5, ms: [140, 140, 140, 140, 140, 140, 140, 240], hold: 2400 },
  waiting: { row: 6, ms: [150, 150, 150, 150, 150, 260], loop: true },
  working: { row: 7, ms: [520, 520, 520, 520, 520, 640], loop: true },
  // No mouth frames in the sheet: speaking is the explaining hands from the
  // `waiting` row — open palm, both palms, hands together — in a loop.
  talking: { row: 6, cols: [0, 3, 0, 4, 3, 2], ms: [260, 300, 240, 320, 280, 300], loop: true },
};

const rand = ([a, b]) => a + Math.random() * (b - a);

/**
 * mode   'idle' | 'working' | 'talking' — the state it settles into
 * pulse  { name, n } — play a one-shot ('waving', 'jumping', 'failed'); bump n to replay
 * follow look toward the cursor while idle
 * crop   'full' (the whole figure) or 'head' (a square avatar)
 * size   height for 'full', side for 'head'
 * glitch { rgb, slices } — red/cyan split in px, and bands of the figure torn sideways
 */
export function Pet({ mode = 'idle', pulse, follow = false, crop = 'full', size = 200, onClick, title, style, glitch }) {
  const reduced = useReducedMotion();
  const base = mode === 'working' || mode === 'talking' ? mode : 'idle';
  const [override, setOverride] = useState(null);
  const [frame, setFrame] = useState(0);
  const [look, setLook] = useState(null);
  const ref = useRef(null);
  const current = override || base;

  useEffect(() => { if (pulse && pulse.name) setOverride(pulse.name); }, [pulse && pulse.n]);
  useEffect(() => { if (base !== 'idle') setOverride(null); }, [base]);

  useEffect(() => {
    const a = ANIMS[current];
    if (!a) return undefined;
    if (reduced) { setFrame(0); return undefined; }
    let timer;
    let i = 0;
    let cycle = 0;
    const step = () => {
      setFrame(i);
      const delay = a.ms[i];
      i += 1;
      if (i < a.ms.length) { timer = setTimeout(step, delay); return; }
      cycle += 1;
      if (a.loop || (a.times && cycle < a.times)) {
        i = 0;
        if (a.rest) {
          timer = setTimeout(() => {
            setFrame(0);
            timer = setTimeout(() => { i = 1; step(); }, rand(a.rest));
          }, delay);
        } else {
          timer = setTimeout(step, delay);
        }
        return;
      }
      timer = setTimeout(() => setOverride(null), delay + (a.hold || 0));
    };
    step();
    return () => clearTimeout(timer);
  }, [current, reduced, pulse && pulse.n]);

  /* Looking at the cursor: only while idle, and only while the cursor is
     moving — after a pause the figure goes back to its own idle loop. */
  useEffect(() => {
    if (!follow) return undefined;
    let raf = 0;
    let settle;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < r.height * 0.45) { setLook(null); return; }
        const deg = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
        setLook(Math.round(deg / 22.5) % 16);
        clearTimeout(settle);
        settle = setTimeout(() => setLook(null), 2600);
      });
    };
    const onLeave = () => setLook(null);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [follow]);

  let row;
  let col;
  let flip = false;
  if (follow && look != null && current === 'idle') {
    if (look === 8) { row = 10; col = 0; }
    else if (look < 8) { row = 9; col = look; }
    else { row = 9; col = 16 - look; flip = true; }
  } else if (reduced) {
    if (current === 'idle') ({ row, col } = NEUTRAL);
    else { row = ANIMS[current].row; col = ANIMS[current].cols ? ANIMS[current].cols[0] : 0; }
  } else {
    const a = ANIMS[current];
    row = a.row;
    col = a.cols ? (a.cols[frame] ?? a.cols[0]) : frame;
  }

  let box;
  if (crop === 'head') {
    const k = size / HEAD.size;
    box = {
      width: size, height: size,
      backgroundSize: `${CW * COLS * k}px ${CH * ROWS * k}px`,
      backgroundPosition: `-${(col * CW + HEAD.x) * k}px -${(row * CH + HEAD.y) * k}px`,
    };
  } else {
    const w = (size * CW) / CH;
    box = {
      width: w, height: size,
      backgroundSize: `${w * COLS}px ${size * ROWS}px`,
      backgroundPosition: `-${col * w}px -${row * size}px`,
    };
  }

  const rgb = glitch && glitch.rgb > 0.4 ? glitch.rgb : 0;
  const slices = (glitch && glitch.slices) || [];
  const sprite = { backgroundImage: `url(${SHEET})`, backgroundRepeat: 'no-repeat', backgroundSize: box.backgroundSize, backgroundPosition: box.backgroundPosition };

  return (
    <div ref={ref} role="img" aria-label={title || 'Ori'} title={title} onClick={onClick}
      style={{
        ...box,
        ...sprite,
        position: 'relative',
        flexShrink: 0,
        transform: flip ? 'scaleX(-1)' : undefined,
        // The figure's own outline, shifted red one way and cyan the other.
        filter: rgb ? `drop-shadow(${rgb}px 0 0 rgba(255,0,80,0.55)) drop-shadow(${-rgb}px 0 0 rgba(0,210,255,0.55))` : undefined,
        cursor: onClick ? 'pointer' : undefined,
        userSelect: 'none',
        ...style,
      }}>
      {slices.map((sl, i) => (
        <div key={i} aria-hidden="true" style={{
          ...sprite, position: 'absolute', inset: 0, pointerEvents: 'none',
          clipPath: `inset(${sl.top}% 0 ${Math.max(0, 100 - sl.top - sl.height)}% 0)`,
          transform: `translateX(${sl.dx}px)`,
        }} />
      ))}
    </div>
  );
}

/** The neutral frame, no motion: 8Legs' faint watermark in the corner of every page. */
export function PetWatermark({ size = 560, style }) {
  const w = (size * CW) / CH;
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', pointerEvents: 'none', userSelect: 'none',
      width: w, height: size, opacity: 0.035, filter: 'grayscale(1)',
      backgroundImage: `url(${SHEET})`, backgroundRepeat: 'no-repeat',
      backgroundSize: `${w * COLS}px ${size * ROWS}px`,
      backgroundPosition: `-${NEUTRAL.col * w}px -${NEUTRAL.row * size}px`,
      ...style,
    }} />
  );
}

/*
 * While the recorded hello plays, its loudness drives the figure: it bounces
 * on the syllables, and the louder ones tear it with a glitch — red/cyan
 * split, bands shoved sideways, scanlines. A burst of glitch opens and
 * closes the recording.
 */
function useVoiceGlitch(voice, reduced) {
  const [fx, setFx] = useState({ rgb: 0, slices: [], bounce: 0, scan: 0 });
  const playing = !!voice && voice.state === 'playing';
  const endMark = voice ? voice.marksRef.current.end : 0;

  useEffect(() => {
    if (!voice || reduced) return undefined;
    const marks = voice.marksRef.current;
    let raf = 0;
    let lastSlices = 0;
    let slices = [];
    const tick = (now) => {
      const sinceStart = now - marks.start;
      const sinceEnd = marks.end > marks.start ? now - marks.end : Infinity;
      if (!playing && sinceEnd > 450) {
        setFx({ rgb: 0, slices: [], bounce: 0, scan: 0 });
        return;
      }
      const level = playing ? voice.levelRef.current : 0;
      const burst = sinceStart < 450 || sinceEnd < 450 ? 1 : 0;
      const amp = Math.max(level, burst * 0.9);
      // Torn bands change in steps, like dropped frames, not every frame.
      if (now - lastSlices > 70) {
        lastSlices = now;
        slices = Math.random() < amp * 0.4
          ? Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
              top: Math.random() * 85, height: 4 + Math.random() * 12, dx: (Math.random() - 0.5) * 22 * amp,
            }))
          : [];
      }
      setFx({
        rgb: 1 + amp * 5 + (Math.random() < amp * 0.25 ? Math.random() * 6 : 0),
        slices,
        bounce: level,
        scan: 0.25 + amp * 0.55 * (0.7 + Math.random() * 0.3),
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, endMark, reduced]);

  return { fx, playing };
}

/**
 * The home screen's centrepiece, in place of 8Legs' spider: the figure on a
 * soft light halo, standing on a faint shadow. Clicking it makes it jump.
 * `voice` (from useIntroVoice) makes it speak along with the recording.
 */
export function PetStage({ size = 220, mode, pulse, busy, voice, children }) {
  const reduced = useReducedMotion();
  const { fx, playing } = useVoiceGlitch(voice, reduced);
  // The parent's reactions and the click share one counter, so the latest wins.
  const [own, setOwn] = useState({ name: null, n: 0 });
  // A reaction from before this stage mounted (an earlier conversation's error) is not replayed.
  const seen = useRef(pulse && pulse.n);
  useEffect(() => {
    if (!pulse || !pulse.name || pulse.n === seen.current) return;
    seen.current = pulse.n;
    setOwn((p) => ({ name: pulse.name, n: p.n + 1 }));
  }, [pulse && pulse.n]);
  return (
    <div style={{
      position: 'relative', width: size * 1.15, height: size * 1.04, flexShrink: 0,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div className={`pet-halo${busy ? ' busy' : ''}`} style={{
        position: 'absolute', left: '50%', top: '46%', width: size * 1.1, height: size * 1.1,
        marginLeft: -(size * 0.55), marginTop: -(size * 0.55), borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.75) 38%, rgba(255,255,255,0) 68%)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', bottom: size * 0.025, width: size * 0.42, height: size * 0.06,
        marginLeft: -(size * 0.21), borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(13,15,20,0.16) 0%, rgba(13,15,20,0) 70%)',
      }} />
      {fx.scan > 0 && (
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: fx.scan,
          background: 'repeating-linear-gradient(to bottom, rgba(13,15,20,0.10) 0 1px, transparent 1px 3px)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 30%, transparent 68%)',
          maskImage: 'radial-gradient(circle at 50% 50%, #000 30%, transparent 68%)',
        }} />
      )}
      <div style={{
        position: 'relative', display: 'flex', transformOrigin: '50% 100%',
        transform: fx.bounce ? `translateY(${-fx.bounce * 7}px) scaleY(${1 + fx.bounce * 0.03})` : undefined,
      }}>
        <Pet size={size} mode={playing ? 'talking' : mode} pulse={own} follow={!playing}
          glitch={fx.rgb || fx.slices.length ? fx : undefined}
          onClick={() => setOwn((p) => ({ name: 'jumping', n: p.n + 1 }))} />
      </div>
      {children}
    </div>
  );
}
