import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import projects from '../../content/projects.js';
import { tx, tl, bullet } from '../../shared/text.js';
import { useReducedMotion } from '../lib/hooks.js';
import { titleFor } from '../lib/seo.js';
import { Icons, PageHeader, Btn, Chip, EmptyState, Section } from './ui.jsx';
import { Architecture } from './Architecture.jsx';
import { architectures } from './architectures.js';

// Every card is this tall; whatever does not fit waits behind "Read more".
const CARD_HEIGHT = 372;

/** The address remembers the open project, so a copied link lands on the whole card. */
function rememberProject(id, open) {
  if (!id || typeof history === 'undefined') return;
  const base = `${location.pathname}${location.search}`;
  if (open) {
    const next = `${base}#${id}`;
    if (`${base}${location.hash}` !== next) history.replaceState(history.state, '', next);
  } else if (location.hash === `#${id}`) {
    history.replaceState(history.state, '', base);
  }
  document.title = titleFor('projects', open ? id : '');
}

function ProjectCard({ p, t, lang, onAsk, linked, index = 0 }) {
  // A shared link names one project. That card starts open, so the write-up
  // is not still folded behind Read more when the page arrives.
  const [expanded, setExpanded] = useState(!!linked);
  // A pixel max-height while the fold is moving. Null means the card is at rest.
  const [held, setHeld] = useState(null);
  const [overflows, setOverflows] = useState(false);
  const clipRef = useRef(null);
  const bodyRef = useRef(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();
  const name = tx(p.name, lang);
  const highlights = tl(p.highlights, lang);
  const links = p.links || {};
  const role = tx(p.role, lang);
  const year = p.year && /^\d{4}$/.test(String(p.year))
    ? <time dateTime={String(p.year)}>{p.year}</time>
    : p.year;
  const spec = p.id ? architectures[p.id] : null;
  const restH = useRef(spec ? 120 : null);

  useEffect(() => {
    if (linked) setExpanded(true);
  }, [linked]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // The resting height of a card that has no diagram, so closing it returns
  // to the same fold instead of a guessed one.
  useLayoutEffect(() => {
    if (spec || expanded || held != null || !clipRef.current) return;
    restH.current = clipRef.current.offsetHeight;
  }, [spec, expanded, held, lang]);

  function later(fn) {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(fn);
    });
  }

  // The fold eases open and shut. Reduced motion just switches.
  function toggle() {
    const next = !expanded;
    const clip = clipRef.current;
    rememberProject(p.id, next);
    if (!clip || reduced) {
      setHeld(null);
      setExpanded(next);
      return;
    }
    const from = clip.offsetHeight;
    const full = clip.scrollHeight;
    const shut = spec ? Math.min(120, full) : Math.round(restH.current || from);
    const to = next ? full : shut;
    if (Math.abs(to - from) < 2) {
      setHeld(null);
      setExpanded(next);
      return;
    }
    setHeld(from);
    if (next) setExpanded(true);
    later(() => {
      setExpanded(next);
      setHeld(to);
    });
  }

  // Measured, not guessed: the same card can fit in English and overflow in Hebrew.
  useLayoutEffect(() => {
    const clip = clipRef.current;
    const body = bodyRef.current;
    if (!clip || !body) return undefined;
    const measure = () => setOverflows(body.scrollHeight > clip.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(clip);
    ro.observe(body);
    return () => ro.disconnect();
  }, [lang, expanded]);

  const head = (
    <div>
      <h2 tabIndex={-1} dir="auto" style={{ margin: 0, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{name}</h2>
      {tx(p.tagline, lang) && <div dir="auto" style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, fontWeight: 500, lineHeight: 1.45 }}>{tx(p.tagline, lang)}</div>}
      {(p.year || role) && (
        <div dir="auto" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
          {year}{p.year && role ? ' · ' : ''}{role}
        </div>
      )}
    </div>
  );
  const prose = (
    <>
      {tx(p.description, lang) && (
        <div dir="auto" style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{tx(p.description, lang)}</div>
      )}
      {highlights.length > 0 && (
        <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          {highlights.map((item, i) => {
            const { title, text } = bullet(item);
            return <li key={i} style={{ unicodeBidi: 'normal' }}>{title && <strong style={{ color: 'var(--text)', fontWeight: 650 }}>{title}: </strong>}{text}</li>;
          })}
        </ul>
      )}
      {(p.tech || []).length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {p.tech.map((x) => <Chip key={x} mono>{x}</Chip>)}
        </div>
      )}
    </>
  );

  return (
    <div id={p.id || undefined} className="project-card fade-in"
      style={{
        scrollMarginTop: 18,
        animationDelay: `${Math.min(index, 7) * 70}ms`,
        padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14,
        height: spec ? 'auto' : (expanded || held != null ? 'auto' : CARD_HEIGHT), minHeight: spec ? 0 : CARD_HEIGHT,
      }}>
      {spec && head}
      {spec && <Architecture spec={spec} lang={lang} label={t.architecture} />}
      <div ref={clipRef} className={`project-clip${held != null ? ' is-easing' : ''}`}
        onTransitionEnd={(e) => {
          if (e.propertyName !== 'max-height' || e.target !== e.currentTarget) return;
          setHeld(null);
        }}
        style={(() => {
          const moving = held != null;
          const open = expanded && !moving;
          return spec
            ? { maxHeight: moving ? held : (expanded ? 'none' : 120), overflow: open ? 'visible' : 'hidden', position: 'relative' }
            : { flex: !expanded && !moving ? 1 : undefined, minHeight: 0, maxHeight: moving ? held : (expanded ? 'none' : undefined), overflow: open ? 'visible' : 'hidden', position: 'relative' };
        })()}>
        <div ref={bodyRef} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {p.image && (
            <div style={{ margin: '-20px -20px 0', borderRadius: 'var(--r-lg) var(--r-lg) 0 0', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--bg-app)' }}>
              <img src={p.image} alt="" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
            </div>
          )}
          {!spec && head}
          {prose}
        </div>
        {overflows && (!expanded || held != null) && (
          <div className="project-fade" aria-hidden="true" style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), var(--bg-card))',
          }} />
        )}
      </div>

      {(overflows || expanded || held != null) && (
        <button type="button" onClick={toggle} aria-expanded={expanded}
          aria-label={expanded ? t.showLessAbout(name) : t.readMoreAbout(name)}
          className="read-more"
          style={{
            alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'transparent', padding: '6px 2px', fontSize: 12, fontWeight: 650, color: 'var(--text-2)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; }}>
          {expanded ? t.showLess : t.readMore}
            <span style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s var(--ease)' }}>▾</span>
        </button>
      )}

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 2 }}>
        {links.live && <Btn size="sm" icon={Icons.external} href={links.live} note={t.newTab}>{t.live}</Btn>}
        {links.repo && <Btn size="sm" icon={Icons.github} href={links.repo} note={t.newTab}>{t.code}</Btn>}
        <Btn size="sm" icon={Icons.sparkle} onClick={() => onAsk(t.askProjectQuestion(name))} style={{ marginInlineStart: 'auto' }}>
          {t.askAboutProject}
        </Btn>
      </div>
    </div>
  );
}

export function ProjectsView({ t, lang, onAsk, onOpenChat, stacked, hash }) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const list = projects || [];
  return (
    <div dir={dir}>
      {!stacked && <PageHeader eyebrow={t.portfolio} title={t.projectsTitle} subtitle={list.length ? t.projectCount(list.length) : null} />}
      {stacked && list.length > 0 && <p className="page-lead" dir="auto">{t.projectCount(list.length)}</p>}
      {list.length === 0 ? (
        <Section>
          <EmptyState icon={Icons.projects} title={t.comingSoon} subtitle={t.comingSoonSub}
            action={<Btn icon={Icons.chat} onClick={onOpenChat}>{t.openChat}</Btn>} />
        </Section>
      ) : (
        // An opened card grows on its own; the rest of its row keeps the common height.
        <div className="project-grid">
          {list.map((p, i) => (
            <ProjectCard key={p.id || i} p={p} t={t} lang={lang} onAsk={onAsk} index={i} linked={!!p.id && hash === p.id} />
          ))}
        </div>
      )}
    </div>
  );
}
