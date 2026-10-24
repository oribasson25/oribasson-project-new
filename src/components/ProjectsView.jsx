import projects from '../../content/projects.js';
import { tx, tl, bullet } from '../../shared/text.js';
import { Icons, PageHeader, Btn, EmptyState, Section } from './ui.jsx';

function ProjectEntry({ p, t, lang, onAsk, index }) {
  const name = tx(p.name, lang);
  const highlights = tl(p.highlights, lang);
  const links = p.links || {};
  const lead = index === 0;
  const Title = lead ? 'h2' : 'h3';
  return (
    <article className={`project-entry${lead ? ' is-lead' : ''}`}>
      <div className="project-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
      <div className="project-copy">
        {tx(p.tagline, lang) && <div className="project-kicker" dir="auto">{tx(p.tagline, lang)}</div>}
        <Title dir="auto" className="project-name">{name}</Title>
        {p.image && (
          <img src={p.image} alt="" loading="lazy" className="project-shot" />
        )}
        {tx(p.description, lang) && (
          <p dir="auto" className="project-desc">{tx(p.description, lang)}</p>
        )}
        {highlights.length > 0 && (
          <ul className="project-points">
            {highlights.map((item, i) => {
              const { title, text } = bullet(item);
              return (
                <li key={i}>
                  {title && <strong>{title}. </strong>}
                  {text}
                </li>
              );
            })}
          </ul>
        )}
        {(p.tech || []).length > 0 && (
          <p className="project-tech">{p.tech.join(' · ')}</p>
        )}
        <div className="project-actions">
          {links.live && <Btn size="sm" icon={Icons.external} href={links.live}>{t.live}</Btn>}
          {links.repo && <Btn size="sm" icon={Icons.github} href={links.repo}>{t.code}</Btn>}
          <Btn size="sm" onClick={() => onAsk(t.askProjectQuestion(name))}>{t.askAboutProject}</Btn>
        </div>
      </div>
      <div className="project-meta">
        {p.year && <div className="project-year" dir="ltr">{p.year}</div>}
        {tx(p.role, lang) && <div dir="auto">{tx(p.role, lang)}</div>}
      </div>
    </article>
  );
}

export function ProjectsView({ t, lang, onAsk, onOpenChat, stacked }) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const list = projects || [];
  return (
    <div dir={dir} className="project-page">
      <PageHeader eyebrow={t.portfolio} title={t.projectsTitle} subtitle={list.length ? t.projectCount(list.length) : null} size={stacked ? 30 : 38} />
      {list.length === 0 ? (
        <Section>
          <EmptyState icon={Icons.projects} title={t.comingSoon} subtitle={t.comingSoonSub}
            action={<Btn icon={Icons.chat} onClick={onOpenChat}>{t.openChat}</Btn>} />
        </Section>
      ) : (
        <div className="project-index">
          {list.map((p, i) => <ProjectEntry key={p.id || i} p={p} t={t} lang={lang} onAsk={onAsk} index={i} />)}
        </div>
      )}
    </div>
  );
}
