import profile from '../../content/profile.js';
import resume from '../../content/resume.js';
import { tx, tl, bullet } from '../../shared/text.js';
import { Icons, PageHeader, Btn, Chip, EmptyState, Section, Eyebrow, PrintContact, bidiParts, bidiProps, flowDir } from './ui.jsx';

function yearTime(value) {
  const text = value == null || value === '' ? '' : String(value);
  if (!/^\d{4}$/.test(text)) return text;
  return <time dateTime={text}>{text}</time>;
}

/**
 * Same letters as the page: "2023 – 2024", one year when both ends match,
 * "2024 – Present". The Hebrew word for now is a strong right-to-left run.
 * Left in the line, it pulls the dash over and the year swaps sides. The
 * word stays its own unit, so the year stays on the start side.
 */
function Period({ start, end, present }) {
  if (!start && !end) return null;
  if (start && end && String(start) === String(end)) return yearTime(start);
  const tail = end ? yearTime(end) : <bdi>{present}</bdi>;
  return <>{yearTime(start || '?')}{' – '}{tail}</>;
}

function Bullets({ items, size = 13, lang }) {
  const flow = flowDir(lang);
  return (
    // The list takes the page's direction, not its first word's: a Hebrew
    // bullet that opens with "Autopilot" or "Pipelines" must not flip.
    <ul dir={flow.dir} style={{ margin: '10px 0 0', paddingInlineStart: 18, fontSize: size, color: 'var(--text-2)', lineHeight: 1.65, ...flow.style }}>
      {items.map((item, i) => {
        const { title, text } = bullet(item);
        return (
          <li key={i} style={{ marginBottom: 3, unicodeBidi: 'normal' }}>
            {title && <strong style={{ color: 'var(--text)', fontWeight: 650, unicodeBidi: 'normal' }}>{bidiParts(`${title}: `, lang)}</strong>}
            {bidiParts(text, lang)}
          </li>
        );
      })}
    </ul>
  );
}

function isEmpty() {
  return !tx(resume.summary, 'en') && !tx(resume.summary, 'he')
    && !(resume.experience || []).length && !(resume.education || []).length
    && !(resume.skills || []).length;
}

function Prose({ text, lang, style }) {
  if (!text) return null;
  const bidi = bidiProps(text, lang);
  return <div dir={bidi.dir} lang={bidi.lang} style={{ ...bidi.style, ...style }}>{bidiParts(text, lang)}</div>;
}

function Job({ job, t, lang, onAsk, hash }) {
  const role = tx(job.role, lang);
  const company = tx(job.company, lang);
  const highlights = tl(job.highlights, lang);
  const flow = flowDir(lang);
  const roleBidi = bidiProps(role, lang);
  const where = [company, tx(job.location, lang)].filter(Boolean).join(' · ');
  const whereBidi = bidiProps(where, lang);
  return (
    <li id={job.id || undefined} className={`resume-job${job.id && hash === job.id ? ' is-linked' : ''}`} style={{ padding: '18px 22px 20px', borderTop: '1px solid var(--border)' }}>
      <div dir={flow.dir} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', ...flow.style }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 dir={roleBidi.dir} lang={roleBidi.lang} style={{ margin: 0, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.3, ...roleBidi.style }}>{bidiParts(role, lang)}</h3>
          <div dir={whereBidi.dir} lang={whereBidi.lang} style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 5, fontWeight: 600, ...whereBidi.style }}>
            {bidiParts(where, lang)}
          </div>
        </div>
        <div dir="ltr" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-muted)', paddingTop: 3 }}><Period start={job.start} end={job.end} present={t.present} /></div>
      </div>
      <Prose text={tx(job.summary, lang)} lang={lang} style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, marginTop: 12 }} />
      {highlights.length > 0 && <Bullets items={highlights} lang={lang} />}
      <div dir={flow.dir} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 14, ...flow.style }}>
        {(job.tech || []).length > 0 && (
          <ul className="plain-list" dir={flow.dir} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: 0, padding: 0, minWidth: 0, ...flow.style }}>
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

  const leadBidi = bidiProps(sub, lang);
  const lead = sub ? <p className="page-lead" dir={leadBidi.dir} lang={leadBidi.lang} style={leadBidi.style}>{bidiParts(sub, lang)}</p> : null;

  if (isEmpty()) {
    return (
      <div dir={dir}>
        {!stacked && <PageHeader eyebrow={t.portfolio} title={t.resumeTitle} subtitle={sub || name} actions={actions} />}
        {stacked && <p className="print-name">{name}</p>}
        {stacked && lead}
        <PrintContact />
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

  const flow = flowDir(lang);
  return (
    <div dir={flow.dir} style={flow.style}>
      {!stacked && <PageHeader eyebrow={t.resumeTitle} title={name} subtitle={sub} actions={actions} />}
      {stacked && <p className="print-name">{name}</p>}
      {stacked && lead}
      <PrintContact />
      <div className="resume-wrap">
      <div className={`resume-layout${side && !stacked ? ' has-side' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0 }}>
          {tx(resume.summary, lang) && (
            <Section title={t.summary}>
              <Prose text={tx(resume.summary, lang)} lang={lang} style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }} />
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
                {education.map((e, i) => {
                  const degree = tx(e.degree, lang);
                  const degreeBidi = bidiProps(degree, lang);
                  const school = [tx(e.school, lang), tx(e.location, lang)].filter(Boolean).join(' · ');
                  const schoolBidi = bidiProps(school, lang);
                  return (
                  <li key={i} id={e.id || undefined} className={`resume-edu${e.id && hash === e.id ? ' is-linked' : ''}`} dir={flow.dir} style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap', ...flow.style }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h3 dir={degreeBidi.dir} lang={degreeBidi.lang} style={{ margin: 0, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.3, ...degreeBidi.style }}>{bidiParts(degree, lang)}</h3>
                      <div dir={schoolBidi.dir} lang={schoolBidi.lang} style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 3, fontWeight: 600, ...schoolBidi.style }}>
                        {bidiParts(school, lang)}
                      </div>
                      <Prose text={tx(e.details, lang)} lang={lang} style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }} />
                      {(tx(e.degree, lang) || tx(e.school, lang)) && (
                        <span className="print-hide" style={{ display: 'inline-flex', marginTop: 12 }}>
                          <Btn size="sm" icon={Icons.sparkle} name={t.askAboutStudy(tx(e.degree, lang), tx(e.school, lang))} onClick={() => onAsk(t.askStudyQuestion(tx(e.degree, lang), tx(e.school, lang)))}>
                            {t.askAboutExperience}
                          </Btn>
                        </span>
                      )}
                    </div>
                    <div dir="ltr" style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-muted)', paddingTop: 3 }}><Period start={e.start} end={e.end} present={t.present} /></div>
                  </li>
                  );
                })}
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
                      <ul className="plain-list" dir={flow.dir} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: 0, padding: 0, ...flow.style }}>
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
