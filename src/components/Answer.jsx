import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { renderMarkdown } from '../lib/markdown.js';
import { useReducedMotion } from '../lib/hooks.js';
import { Pet } from './Pet.jsx';

/*
 * How an answer arrives, in stages: while the model reads, Ori works through
 * a short list of steps; then the answer is written out a word at a time.
 *
 * The network delivers text in uneven bursts, and showing each burst as it
 * lands makes the bubble jump. So the answer being written now is revealed at
 * its own steady pace, catching up quickly when it falls behind: each new
 * paragraph or bullet rises into place, and each new word fades in from a
 * blur. Answers from before (an old conversation reopened) appear whole.
 */

const WORD_MS = 520;           // keep in step with .rv-w in styles.css
const BLOCK_MS = 420;          // keep in step with .rv-b
const MIN_RATE = 70;           // characters a second, however short the backlog
const STEP_AT = [700, 1600];   // when the second and third steps begin, in ms
const BLOCKS = ':scope > p, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > blockquote, :scope > pre, :scope > table, li';

/** Close a ** or ` left open at the cursor, so bold text is bold as it appears rather than asterisks until the end. */
function closeOpen(text) {
  let out = text.replace(/\*+$/, '');
  if ((out.match(/\*\*/g) || []).length % 2) out = `${out.trimEnd()}**`;
  if ((out.match(/`/g) || []).length % 2) out = `${out.trimEnd()}\``;
  return out;
}

/**
 * Give the newest paragraphs and words their entrance. The markup is rebuilt
 * on every step of the reveal, so each element is re-timed by how long ago it
 * first appeared (a negative animation delay): an entrance carries on where it
 * was instead of starting over.
 */
function animateEntrances(root, trail, now) {
  root.querySelectorAll(BLOCKS).forEach((el, i) => {
    if (trail.blocks[i] == null) trail.blocks[i] = now;
    const age = now - trail.blocks[i];
    if (age < BLOCK_MS) {
      el.classList.add('rv-b');
      el.style.animationDelay = `${-age}ms`;
    }
  });

  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
  const total = nodes.reduce((sum, n) => sum + n.data.length, 0);

  // marks: which stretch of the text appeared when — [{ from, to, at }].
  if (total > trail.length) trail.marks.push({ from: trail.length, to: total, at: now });
  trail.length = total;
  trail.marks = trail.marks.filter((m) => now - m.at < WORD_MS && m.from < total);
  if (!trail.marks.length) return;

  let start = 0;
  for (const node of nodes) {
    const end = start + node.data.length;
    const from = start;
    start = end;
    if (end <= trail.marks[0].from || !node.data.trim()) continue;
    // From the last stretch back, so the start of the node stays put while it is split.
    for (let k = trail.marks.length - 1; k >= 0; k--) {
      const m = trail.marks[k];
      const a = Math.max(m.from, from);
      const b = Math.min(m.to, end);
      if (a >= b) continue;
      if (b - from < node.data.length) node.splitText(b - from);
      const piece = a > from ? node.splitText(a - from) : node;
      const span = document.createElement('span');
      span.className = 'rv-w';
      span.style.animationDelay = `${-(now - m.at)}ms`;
      piece.parentNode.insertBefore(span, piece);
      span.appendChild(piece);
    }
  }
}

export function Answer({ content, streaming, onRevealed }) {
  const reduced = useReducedMotion();
  const [live] = useState(() => streaming && !reduced);
  const [shown, setShown] = useState(live ? 0 : Infinity);
  const latest = useRef({});
  latest.current = { content, streaming, onRevealed };
  const mdRef = useRef(null);
  const trail = useRef({ blocks: [], marks: [], length: 0 });

  useEffect(() => {
    if (!live) return undefined;
    let raf = 0;
    let last = performance.now();
    let pos = 0;
    let revealed = 0;
    const tick = (now) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      const { content: text, streaming: more } = latest.current;
      if (pos >= text.length) {
        if (!more) {
          setShown(Infinity);
          if (latest.current.onRevealed) latest.current.onRevealed();
          return;
        }
      } else {
        // Faster the further behind, so the reveal trails the model by a moment, not a paragraph.
        pos = Math.min(text.length, pos + Math.max(MIN_RATE, (text.length - pos) * (more ? 3 : 5)) * dt);
        let at = Math.floor(pos);
        // Whole words: stop at the end of the word the cursor is in…
        const end = text.slice(at).search(/\s/);
        if (end >= 0 && end < 24) at += end;
        else if (end < 0 && !more) at = text.length;
        else if (end < 0) {
          // …and when the stream has stopped in the middle of one, wait for the rest of it.
          const cut = text.slice(0, at).search(/\s\S*$/);
          at = cut >= 0 ? cut : revealed;
        }
        revealed = Math.max(revealed, at);
        pos = Math.max(pos, revealed);
        setShown(revealed);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  // Without the reveal (reduced motion), the answer is done when the stream is.
  useEffect(() => {
    if (!live && !streaming && latest.current.onRevealed) latest.current.onRevealed();
  }, [live, streaming]);

  const writing = streaming || (live && shown < content.length);
  const visible = shown < content.length ? content.slice(0, shown) : content;
  const html = useMemo(() => {
    const out = renderMarkdown(writing ? closeOpen(visible) : visible);
    // The caret goes before the whole run of closing tags, so it follows the last word even inside a list.
    return writing ? out.replace(/((?:<\/[a-z0-9]+>\s*)+)$/i, '<span class="caret"></span>$1') : out;
  }, [visible, writing]);

  useLayoutEffect(() => {
    if (live && mdRef.current) animateEntrances(mdRef.current, trail.current, performance.now());
  }, [html]);

  return (
    <div dir="auto" className={live ? 'fade-in' : undefined} style={{
      alignSelf: 'stretch', background: 'var(--bg-card)', border: '1px solid var(--border)',
      padding: '12px 15px', borderRadius: '16px 16px 16px 4px', fontSize: 13.5,
    }}>
      <div ref={mdRef} className="md" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

const check = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Before the first word: Ori at work, and the step it is on. Steps already passed get a tick. */
export function Steps({ steps, dir }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = STEP_AT.slice(0, steps.length - 1).map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '2px 2px 6px' }}>
      <Pet mode="working" size={58} />
      <ol dir={dir} aria-live="polite" style={{ listStyle: 'none', margin: 0, padding: '0 0 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.slice(0, step + 1).map((label, i) => {
          const done = i < step;
          return (
            <li key={label} className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, lineHeight: 1.3 }}>
              <span style={{
                width: 16, height: 16, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--primary)' : 'transparent', color: 'var(--primary-ink)',
              }}>
                {done ? check : <span className="spin" style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--text)' }} />}
              </span>
              <span className={done ? undefined : 'shimmer'} style={{ color: done ? 'var(--text-muted)' : undefined, fontWeight: done ? 500 : 600 }}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
