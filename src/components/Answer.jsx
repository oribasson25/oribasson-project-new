import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { loadMarkdown, renderMarkdownSync, plainHtml } from '../lib/loadMarkdown.js';
import projects from '../../content/projects.js';
import { tx } from '../../shared/text.js';
import { stripProjectMarkers } from '../lib/projectDiagram.js';
import { strings } from '../i18n.js';
import { useReducedMotion } from '../lib/hooks.js';
import { Pet } from './Pet.jsx';
import { messageBidi } from './ui.jsx';
import { Architecture } from './Architecture.jsx';
import { architectures } from './architectures.js';

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

/** The words on screen, without the note that a link opens in a new tab. */
function answerText(root) {
  const clone = root.cloneNode(true);
  clone.querySelectorAll('.sr-only, .caret').forEach((el) => el.remove());
  clone.querySelectorAll('p, li, h1, h2, h3, h4, pre, blockquote, tr').forEach((el) => {
    el.append('\n');
  });
  return (clone.textContent || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function CopyAnswer({ rootRef, lang }) {
  const t = strings(lang === 'he' ? 'he' : 'en');
  const [note, setNote] = useState('');
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    const root = rootRef.current;
    const value = root ? answerText(root) : '';
    if (!value) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.insetInlineStart = '-9999px';
      document.body.appendChild(area);
      area.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      area.remove();
    }
    setNote(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(''), 1600);
  }
  const label = note === 'copied' ? t.copied : note === 'failed' ? t.copyFailedName : t.copyAnswerName;
  const visible = note === 'copied' ? t.copied : note === 'failed' ? t.copyFailed : t.copyAnswer;
  const spoken = note === 'copied' ? t.copied : note === 'failed' ? t.copyFailed : '';
  return (
    <>
      <button type="button" className="copy-answer screen-only fade-in" onClick={copy}
        aria-label={label}>
        {visible}
      </button>
      <span className="sr-only" aria-live="polite">{spoken}</span>
    </>
  );
}

function diagramName(diagram, lang) {
  if (!diagram) return '';
  const id = Object.keys(architectures).find((key) => architectures[key] === diagram);
  const project = id && projects.find((p) => p.id === id);
  return project ? tx(project.name, lang) : '';
}

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

export function Answer({ content, streaming, onRevealed, diagram, lang, diagramLabel, speaker }) {
  const reduced = useReducedMotion();
  const [live] = useState(() => streaming && !reduced);
  // This answer is the one being written now, including when motion is reduced
  // and there is no word-by-word reveal. Older answers stay quiet.
  const [fresh] = useState(() => streaming);
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

  const [mdReady, setMdReady] = useState(() => !!renderMarkdownSync());
  useEffect(() => {
    if (mdReady) return undefined;
    let on = true;
    loadMarkdown().then(() => { if (on) setMdReady(true); });
    return () => { on = false; };
  }, [mdReady]);

  const writing = streaming || (live && shown < content.length);
  const visible = shown < content.length ? content.slice(0, shown) : content;
  const html = useMemo(() => {
    const text = stripProjectMarkers(visible);
    const render = renderMarkdownSync();
    const out = render
      ? render(writing ? closeOpen(text) : text, { newTab: strings(lang === 'he' ? 'he' : 'en').newTab })
      : plainHtml(text);
    // The caret goes before the whole run of closing tags, so it follows the last word even inside a list.
    // A new-tab note sits inside the link; the caret stays in front of that note.
    return writing
      ? out.replace(/((?:<span class="sr-only">[\s\S]*?<\/span>)?(?:<\/[a-z0-9]+>\s*)+)$/i, '<span class="caret"></span>$1')
      : out;
  }, [visible, writing, lang, mdReady]);

  useLayoutEffect(() => {
    if (live && mdRef.current) animateEntrances(mdRef.current, trail.current, performance.now());
  }, [html]);

  const bidi = messageBidi(content);
  return (
    <div dir={bidi.dir} className={live ? 'bubble-assistant fade-in' : 'bubble-assistant'} style={bidi.style}>
      <div aria-busy={writing ? 'true' : undefined}
        aria-live={fresh ? (writing ? 'off' : 'polite') : undefined}
        aria-atomic={fresh ? 'true' : undefined}>
        {speaker && <span className="sr-only">{speaker}: </span>}
        {/* Hidden while the words are still arriving, so a reader hears the
            finished answer once instead of every new word. */}
        <div ref={mdRef} className="md" dir={bidi.dir} style={{ unicodeBidi: 'isolate' }} aria-hidden={writing ? true : undefined} dangerouslySetInnerHTML={{ __html: html }} />
        {diagram && !writing && (
          <div dir={lang === 'he' ? 'rtl' : 'ltr'} style={{ marginTop: 12 }}>
            <Architecture spec={diagram} lang={lang} label={diagramLabel} name={diagramName(diagram, lang)} />
          </div>
        )}
      </div>
      {!writing && content.trim() && <CopyAnswer rootRef={mdRef} lang={lang} />}
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
      <Pet mode="working" size={58} decorative />
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
