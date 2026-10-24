import profile from '../../content/profile.js';
import resume from '../../content/resume.js';
import { tx, span } from '../../shared/text.js';
import { useReducedMotion } from '../lib/hooks.js';
import { PetStage } from './Pet.jsx';
import { IntroBubble } from './IntroBubble.jsx';
import { Composer, QuestionChips } from './Composer.jsx';

function splitHeadline(lang) {
  const headline = tx(profile.headline, lang);
  const bits = headline.split(' · ').map((s) => s.trim()).filter(Boolean);
  const place = tx(profile.location, lang);
  if (bits.length > 1) return { kicker: bits[0], lede: bits.slice(1).join(' · '), place };
  return { kicker: place, lede: headline, place: '' };
}

/**
 * A typeset poster. The name is the display face, the figure sits on a hard
 * ink plate, and the questions are a numbered index. Nothing here is a metric.
 */
export function Hero({
  t, lang, stacked, toolbar, input, onChange, onSend, disabled, notice,
  chips, voice, introText, petMode, pulse, busy,
}) {
  const reduced = useReducedMotion();
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const full = tx(profile.name, lang);
  const [first, ...rest] = full.split(' ');
  const last = rest.join(' ');
  const { kicker, lede, place } = splitHeadline(lang);
  const job = (resume.experience || [])[0];
  const role = job ? tx(job.role, lang) : '';
  const company = job ? tx(job.company, lang) : '';
  const when = job ? span(job.start, job.end, t.present) : '';
  const firstPerson = profile.voice === 'first-person';
  const sub = stacked ? t.helloSubShort(firstPerson) : t.helloSub(first, firstPerson);
  const replay = voice.heard && voice.state !== 'playing';
  const italicLast = lang !== 'he' && Boolean(last);

  return (
    <section
      className={`hero ${stacked ? 'hero-phone' : 'hero-desk'}`}
      dir={dir}
      aria-labelledby="hero-title"
    >
      <header className="hero-mast">
        {(kicker || place) && (
          <p className="hero-kicker">
            <span>{kicker}</span>
            {place && kicker !== place && <span className="hero-kicker-sep" aria-hidden="true">/</span>}
            {place && kicker !== place && <span>{place}</span>}
          </p>
        )}
        {!stacked && toolbar && <div className="hero-tools">{toolbar}</div>}
      </header>

      <div className="hero-body">
        <div className="hero-copy">
          <h1 id="hero-title" className={reduced ? 'hero-name' : 'hero-name hero-rise'} dir={dir}>
            <span className="hero-first">{first}</span>
            {last && <span className={italicLast ? 'hero-last is-italic' : 'hero-last'}>{last}</span>}
          </h1>
          {lede && <p className="hero-lede">{lede}</p>}
          {(role || company) && (
            <p className="hero-role">
              {role && <span className="hero-role-name">{role}</span>}
              <span className="hero-role-meta">
                {company && <span>{company}</span>}
                {when && <span className="hero-when" dir="ltr">{when}</span>}
              </span>
            </p>
          )}
          <p className="hero-sub">{sub}</p>
        </div>

        <div className="hero-figure">
          <div className="hero-plate" aria-hidden="true" />
          <PetStage size={stacked ? 112 : 220} mode={petMode} pulse={pulse} busy={busy} voice={voice} tone="flat">
            {replay && <IntroBubble t={t} voice={voice} stacked />}
          </PetStage>
        </div>

        {!replay && (
          <div className="hero-note">
            <IntroBubble t={t} voice={voice} transcript={introText} stacked />
          </div>
        )}
      </div>

      <div className="hero-ask">
        {notice}
        <Composer value={input} onChange={onChange} onSend={onSend} disabled={disabled} dir={dir}
          placeholder={stacked ? t.placeholderShort : t.placeholder} width={680} align="start" sendLabel={t.send} />
        <QuestionChips items={chips} onPick={onSend} disabled={disabled} dir={dir} variant="index"
          style={{ marginTop: stacked ? 10 : 14 }} />
        {!stacked && <p className="hero-foot">{t.foot(first)}</p>}
      </div>
    </section>
  );
}
