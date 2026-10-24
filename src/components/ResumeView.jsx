import profile from '../../content/profile.js';
import resume from '../../content/resume.js';
import { tx, tl, bullet, span } from '../../shared/text.js';
import { Icons, PageHeader, Btn, Chip, EmptyState, Section, Eyebrow } from './ui.jsx';

function period(start, end, t) {
  return span(start, end, t.present);
}

function Bullets({ items, size = 13 }) {
  return (
    // The list takes the page's direction, not its first word's: a Hebrew
    // bullet that opens with "Pipelines" must not flip to the left.
    <ul style={{ margin: '8px 0 0', paddingInlineStart: 18, fontSize: size, color: 'var(--text-2)', lineHeight: 1.7 }}>
      {items.map((item, i) => {
        const { title, text } = bullet(item);
        return <li key={i} style={{ marginBottom: 3, unicodeBidi: 'normal' }}>{title && <strong style={{ color: 'var(--text)', fontWeight: 650 }}>{title}: </strong>}{text}</li>;
      })}
    </ul>
  );
}

function isEmpty() {
  return !tx(resume.summary, 'en') && !tx(resume.summary, 'he')
    && !(resume.experience || []).length && !(resume.education || []).length
    && !(resume.skills || []).length;
}

function Job({ job, t, lang, onAsk }) {
  const role = tx(job.role, lang);
  const company = tx(job.company, lang);
  const highlights = tl(job.highlights, lang);
  return (
    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div dir="auto" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{role}</div>
          <div dir="auto" style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 4, fontWeight: 600 }}>
            {[company, tx(job.location, lang)].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div dir="ltr" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-muted)', paddingTop: 3 }}>{period(job.start, job.end, t)}</div>
      </div>
      {tx(job.summary, lang) && (
        <div dir="auto" style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginTop: 10 }}>{tx(job.summary, lang)}</div>
      )}
      {highlights.length > 0 && <Bullets items={highlights} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {(job.tech || []).map((x) => <Chip key={x} mono>{x}</Chip>)}
        <Btn size="sm" icon={Icons.sparkle} onClick={() => onAsk(t.askJobQuestion(role, company))} style={{ marginInlineStart: 'auto' }}>
          {t.askAboutExperience}
        </Btn>
      </div>
    </div>
  );
}

export function ResumeView({ t, lang, onAsk, onOpenChat, stacked }) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const name = tx(profile.name, lang);
  const sub = [tx(profile.headline, lang), tx(profile.location, lang)].filter(Boolean).join(' · ');
  const actions = profile.cvPdf
    ? <Btn variant="primary" icon={Icons.download} href={profile.cvPdf} download>{t.downloadCv}</Btn>
    : null;

  if (isEmpty()) {
    return (
      <div dir={dir}>
        {!stacked && <PageHeader eyebrow={t.portfolio} title={t.resumeTitle} subtitle={sub || name} actions={actions} />}
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
      <div style={{ display: 'grid', gridTemplateColumns: side && !stacked ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
          {tx(resume.summary, lang) && (
            <Section title={t.summary}>
              <div dir="auto" style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{tx(resume.summary, lang)}</div>
            </Section>
          )}
          {(resume.experience || []).length > 0 && (
            <Section title={t.experience} pad="0">
              <div style={{ marginTop: -1 }}>
                {resume.experience.map((job, i) => <Job key={i} job={job} t={t} lang={lang} onAsk={onAsk} />)}
              </div>
            </Section>
          )}
          {education.length > 0 && (
            <Section title={t.education} pad="0">
              <div style={{ marginTop: -1 }}>
                {education.map((e, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div dir="auto" style={{ fontWeight: 700, fontSize: 14 }}>{tx(e.degree, lang)}</div>
                      <div dir="auto" style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 3, fontWeight: 600 }}>
                        {[tx(e.school, lang), tx(e.location, lang)].filter(Boolean).join(' · ')}
                      </div>
                      {tx(e.details, lang) && <div dir="auto" style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>{tx(e.details, lang)}</div>}
                    </div>
                    <div dir="ltr" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-muted)', paddingTop: 3 }}>{period(e.start, e.end, t)}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {side ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {skills.length > 0 && (
              <Section title={t.skills}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {skills.map((g, i) => (
                    <div key={i}>
                      {tx(g.group, lang) && <Eyebrow style={{ marginBottom: 8 }}>{tx(g.group, lang)}</Eyebrow>}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(g.items || []).map((x) => <Chip key={x}>{x}</Chip>)}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {languages.length > 0 && (
              <Section title={t.languages}>
                {languages.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, padding: '4px 0' }}>
                    <span dir="auto" style={{ fontWeight: 600 }}>{tx(l.name, lang)}</span>
                    <span dir="auto" style={{ color: 'var(--text-muted)' }}>{tx(l.level, lang)}</span>
                  </div>
                ))}
              </Section>
            )}
            {certs.length > 0 && (
              <Section title={t.certifications}>
                {certs.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, padding: '5px 0' }}>
                    <div dir="auto" style={{ fontWeight: 600 }}>
                      {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer">{tx(c.name, lang)}</a> : tx(c.name, lang)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{[c.issuer, c.year].filter(Boolean).join(' · ')}</div>
                  </div>
                ))}
              </Section>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
