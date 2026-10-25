import profile from '../../content/profile.js';
import resume from '../../content/resume.js';
import { tx, tl, bullet } from '../../shared/text.js';
import { Icons, PageHeader, Btn, Chip, EmptyState, Section, Eyebrow } from './ui.jsx';

function yearTime(value) {
  const text = value == null || value === '' ? '' : String(value);
  if (!/^\d{4}$/.test(text)) return text;
  return <time dateTime={text}>{text}</time>;
}

/** Same letters as span(): "2023 – 2024", one year when both ends match, "2024 – Present". */
function Period({ start, end, present }) {
  if (!start && !end) return null;
  if (start && end && String(start) === String(end)) return yearTime(start);
  return <>{yearTime(start || '?')}{' – '}{end ? yearTime(end) : present}</>;
}

function Bullets({ items, size = 13 }) {
  return (
    // The list takes the page's direction, not its first word's: a Hebrew
    // bullet that opens with "Pipelines" must not flip to the left.
    <ul style={{ margin: '10px 0 0', paddingInlineStart: 18, fontSize: size, color: 'var(--text-2)', lineHeight: 1.65 }}>
      {items.map((item, i) => {
        const { title, text } = bullet(item);
        return <li key={i} style={{ marginBottom: 3, unicodeBidi: 'normal' }}>{title && <strong style={{ color: 'var(--text)', fontWeight: 650 }}>{title}: </strong>}{text}</li>;
      })}
    </ul>
  );
}

/** On paper the sidebar is gone, so the resume carries its own contact line. */
function PrintLine() {
  const c = profile.contact || {};
  const linkedin = c.linkedin ? c.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '';
  const bits = [c.email, c.phone, linkedin].filter(Boolean);
  if (!bits.length) return null;
  return <p className="print-line">{bits.join(' · ')}</p>;
}

function isEmpty() {
  return !tx(resume.summary, 'en') && !tx(resume.summary, 'he')
    && !(resume.experience || []).length && !(resume.education || []).length
    && !(resume.skills || []).length;
}

function Job({ job, t, lang, onAsk, hash }) {
  const role = tx(job.role, lang);
  const company = tx(job.company, lang);
  const highlights = tl(job.highlights, lang);
  return (
    <li id={job.id || undefined} className={`resume-job${job.id && hash === job.id ? ' is-linked' : ''}`} style={{ padding: '18px 22px 20px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 dir="auto" style={{ margin: 0, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{role}</h3>
          <div dir="auto" style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 5, fontWeight: 600 }}>
            {[company, tx(job.location, lang)].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div dir="ltr" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-muted)', paddingTop: 3 }}><Period start={job.start} end={job.end} present={t.present} /></div>
      </div>
      {tx(job.summary, lang) && (
        <div dir="auto" style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, marginTop: 12 }}>{tx(job.summary, lang)}</div>
      )}
      {highlights.length > 0 && <Bullets items={highlights} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
        {(job.tech || []).length > 0 && (
          <ul className="plain-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: 0, padding: 0, minWidth: 0 }}>
            {job.tech.map((x) => <li key={x}><Chip mono>{x}</Chip></li>)}
          </ul>
        )}
        <span className="print-hide" style={{ display: 'contents' }}>
          <Btn size="sm" icon={Icons.sparkle} name={t.askAboutRole(role, company)} onClick={() => onAsk(t.askJobQuestion(role, company))} style={{ marginInlineStart: 'auto' }}>
            {t.askAboutExperience}
          </Btn>
        </span>
      </div>
    </li>
  );
}

export function ResumeView({ t, lang, onAsk, onOpenChat, stacked, hash }) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const name = tx(profile.name, lang);
  const sub = [tx(profile.headline, lang), tx(profile.location, lang)].filter(Boolean).join(' · ');
  const actions = profile.cvPdf
    ? <Btn variant="primary" icon={Icons.download} href={profile.cvPdf} download>{t.downloadCv}</Btn>
    : null;

  const lead = sub ? <p className="page-lead" dir="auto">{sub}</p> : null;

  if (isEmpty()) {
    return (
      <div dir={dir}>
        {!stacked && <PageHeader eyebrow={t.portfolio} title={t.resumeTitle} subtitle={sub || name} actions={actions} />}
        {stacked && <p className="print-name">{name}</p>}
        {stacked && lead}
        <PrintLine />
        <Section>
          <EmptyState icon={Icons.resume} title={t.comingSoon} subtitle={t.comingSoonSub}
            action={<Btn icon={Icons.chat} onClick={onOpenChat}>{t.openChat}</Btn>} />
        </Section>
      </div>
    );
  }

  const education = resume.education || [];
  const skills = resume.skills || [];
  const languages = resume.languages || [];
  const certs = resume.certifications || [];
  const side = skills.length || languages.length || certs.length;

  return (
    <div dir={dir}>
      {!stacked && <PageHeader eyebrow={t.resumeTitle} title={name} subtitle={sub} actions={actions} />}
      {stacked && <p className="print-name">{name}</p>}
      {stacked && lead}
      <PrintLine />
      <div className="resume-wrap">
      <div className={`resume-layout${side && !stacked ? ' has-side' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0 }}>
          {tx(resume.summary, lang) && (
            <Section title={t.summary}>
              <div dir="auto" style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{tx(resume.summary, lang)}</div>
            </Section>
          )}
          {(resume.experience || []).length > 0 && (
            <Section id="experience" title={t.experience} pad="0">
              <ul className="plain-list" style={{ marginTop: -1 }}>
                {resume.experience.map((job, i) => <Job key={job.id || i} job={job} t={t} lang={lang} onAsk={onAsk} hash={hash} />)}
              </ul>
            </Section>
          )}
          {education.length > 0 && (
            <Section title={t.education} pad="0">
              <ul className="plain-list" style={{ marginTop: -1 }}>
                {education.map((e, i) => (
                  <li key={i} id={e.id || undefined} className={`resume-edu${e.id && hash === e.id ? ' is-linked' : ''}`} style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 dir="auto" style={{ margin: 0, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{tx(e.degree, lang)}</h3>
                      <div dir="auto" style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 3, fontWeight: 600 }}>
                        {[tx(e.school, lang), tx(e.location, lang)].filter(Boolean).join(' · ')}
                      </div>
                      {tx(e.details, lang) && <div dir="auto" style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>{tx(e.details, lang)}</div>}
                    </div>
                    <div dir="ltr" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-muted)', paddingTop: 3 }}><Period start={e.start} end={e.end} present={t.present} /></div>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {side ? (
          <div className="resume-side" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {skills.length > 0 && (
              <Section id="skills" title={t.skills}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {skills.map((g, i) => (
                    <div key={i}>
                      {tx(g.group, lang) && <Eyebrow style={{ marginBottom: 8 }}>{tx(g.group, lang)}</Eyebrow>}
                      <ul className="plain-list" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: 0, padding: 0 }}>
                        {(g.items || []).map((x) => <li key={x}><Chip>{x}</Chip></li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {languages.length > 0 && (
              <Section title={t.languages}>
                <ul className="plain-list">
                  {languages.map((l, i) => (
                    <li key={i} className="resume-lang" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '2px 12px', fontSize: 13.5, padding: '9px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                      <span dir="auto" style={{ fontWeight: 600 }}>{tx(l.name, lang)}</span>
                      <span dir="auto" style={{ color: 'var(--text-2)', marginInlineStart: 'auto', maxWidth: '100%', textAlign: 'end' }}>{tx(l.level, lang)}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {certs.length > 0 && (
              <Section title={t.certifications}>
                {certs.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, padding: '5px 0' }}>
                    <div dir="auto" style={{ fontWeight: 600 }}>
                      {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ position: 'relative' }}>{tx(c.name, lang)}<span className="sr-only">{t.newTab}</span></a> : tx(c.name, lang)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                      {[c.issuer, c.year].filter(Boolean).map((part, i) => (
                        <span key={i}>{i > 0 && ' · '}{part === c.year ? yearTime(part) : part}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
