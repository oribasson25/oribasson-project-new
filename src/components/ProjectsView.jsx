import { useLayoutEffect, useRef, useState } from 'react';
import projects from '../../content/projects.js';
import { tx, tl, bullet } from '../../shared/text.js';
import { Icons, PageHeader, Btn, Chip, EmptyState, Section } from './ui.jsx';

// Every card is this tall; whatever does not fit waits behind "Read more".
const CARD_HEIGHT = 340;

function ProjectCard({ p, t, lang, onAsk }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const clipRef = useRef(null);
  const bodyRef = useRef(null);
  const name = tx(p.name, lang);
  const highlights = tl(p.highlights, lang);
  const links = p.links || {};
  const meta = [p.year, tx(p.role, lang)].filter(Boolean).join(' · ');

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

  return (
    <div className="fade-in"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)', borderRadius: 'var(--r-lg)',
        border: `1px solid ${hovered ? 'var(--primary-soft)' : 'var(--border)'}`,
        boxShadow: hovered ? '0 0 26px rgba(13,15,20,0.06), var(--shadow)' : 'var(--shadow)',
        padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: 12,
        height: expanded ? 'auto' : CARD_HEIGHT, minHeight: CARD_HEIGHT,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
      <div ref={clipRef} style={{ flex: 1, minHeight: 0, overflow: expanded ? 'visible' : 'hidden', position: 'relative' }}>
        <div ref={bodyRef} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {p.image && (
            <div style={{ margin: '-18px -18px 0', borderRadius: 'var(--r-lg) var(--r-lg) 0 0', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
              <img src={p.image} alt="" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <div dir="auto" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{name}</div>
            {tx(p.tagline, lang) && <div dir="auto" style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 4, fontWeight: 500 }}>{tx(p.tagline, lang)}</div>}
            {meta && <div dir="auto" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{meta}</div>}
          </div>
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
        </div>
        {overflows && !expanded && (
          <div aria-hidden="true" style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), var(--bg-card))',
          }} />
        )}
      </div>

      {(overflows || expanded) && (
        <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}
          style={{
            alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'transparent', padding: '2px 0', fontSize: 12, fontWeight: 650, color: 'var(--text-2)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; }}>
          {expanded ? t.showLess : t.readMore}
          <span style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>▾</span>
        </button>
      )}

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 13 }}>
        {links.live && <Btn size="sm" icon={Icons.external} href={links.live}>{t.live}</Btn>}
        {links.repo && <Btn size="sm" icon={Icons.github} href={links.repo}>{t.code}</Btn>}
        <Btn size="sm" icon={Icons.sparkle} onClick={() => onAsk(t.askProjectQuestion(name))} style={{ marginInlineStart: 'auto' }}>
          {t.askAboutProject}
        </Btn>
      </div>
    </div>
  );
}

export function ProjectsView({ t, lang, onAsk, onOpenChat, stacked }) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const list = projects || [];
  return (
    <div dir={dir}>
      {!stacked && <PageHeader eyebrow={t.portfolio} title={t.projectsTitle} subtitle={list.length ? t.projectCount(list.length) : null} />}
      {list.length === 0 ? (
        <Section>
          <EmptyState icon={Icons.projects} title={t.comingSoon} subtitle={t.comingSoonSub}
            action={<Btn icon={Icons.chat} onClick={onOpenChat}>{t.openChat}</Btn>} />
        </Section>
      ) : (
        // An opened card grows on its own; the rest of its row keeps the common height.
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
          {list.map((p, i) => <ProjectCard key={p.id || i} p={p} t={t} lang={lang} onAsk={onAsk} />)}
        </div>
      )}
    </div>
  );
}
