import { useRef } from 'react';
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

function currentRole(lang, present) {
  const job = (resume.experience || [])[0];
  if (!job) return '';
  const company = tx(job.company, lang);
  const when = span(job.start, job.end, present);
  return [company, when].filter(Boolean).join(' · ');
}

/**
 * The first screen. Ori's name at poster scale, the real headline beside the
 * figure, and the chat still one tap away. Nothing here is a metric.
 */
export function Hero({
  t, lang, stacked, toolbar, input, onChange, onSend, disabled, notice,
  chips, voice, introText, petMode, pulse, busy,
}) {
  const reduced = useReducedMotion();
  const root = useRef(null);
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const full = tx(profile.name, lang);
  const [first, ...rest] = full.split(' ');
  const last = rest.join(' ');
  const { kicker, lede, place } = splitHeadline(lang);
  const role = currentRole(lang, t.present);
  const firstPerson = profile.voice === 'first-person';
  const sub = stacked ? t.helloSubShort(firstPerson) : t.helloSub(first, firstPerson);
  const replay = voice.heard && voice.state !== 'playing';

  function onMove(e) {
    if (stacked || reduced) return;
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - box.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - box.top}px`);
  }

  return (
    <section
      ref={root}
      className={`hero ${stacked ? 'hero-phone' : 'hero-desk'}`}
      dir={dir}
      aria-labelledby="hero-title"
      onMouseMove={onMove}
    >
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-aurora" />
        <div className="hero-grid" />
        <div className="hero-spot" />
      </div>

      {!stacked && toolbar && <div className="hero-tools">{toolbar}</div>}

      <div className="hero-body">
        <div className="hero-copy">
          {(kicker || place) && (
            <p className="hero-kicker hero-rise">
              <span>{kicker}</span>
              {place && kicker !== place && <span className="hero-kicker-sep" aria-hidden="true">·</span>}
              {place && kicker !== place && <span>{place}</span>}
            </p>
          )}
          <h1 id="hero-title" className="hero-name hero-rise" dir={dir} style={{ animationDelay: '0.06s' }}>
            <span>{first}</span>
            {last && <span className="hero-last">{last}</span>}
          </h1>
          {lede && <p className="hero-lede hero-rise" style={{ animationDelay: '0.14s' }}>{lede}</p>}
          <p className="hero-sub hero-rise" style={{ animationDelay: '0.2s' }}>{sub}</p>
          {role && <p className="hero-role hero-rise" style={{ animationDelay: '0.26s' }}>{role}</p>}
        </div>

        <div className="hero-figure hero-rise" style={{ animationDelay: '0.12s' }}>
          <div className={reduced ? 'hero-stage' : 'hero-stage hero-float-y'}>
            <div className="hero-ring" aria-hidden="true" />
            <PetStage size={stacked ? 148 : 248} mode={petMode} pulse={pulse} busy={busy} voice={voice} tone="dark">
              {replay && <IntroBubble t={t} voice={voice} stacked />}
            </PetStage>
          </div>
          {!replay && <IntroBubble t={t} voice={voice} transcript={introText} stacked />}
        </div>
      </div>

      <div className="hero-ask">
        {notice}
        <Composer value={input} onChange={onChange} onSend={onSend} disabled={disabled} dir={dir}
          placeholder={stacked ? t.placeholderShort : t.placeholder} width={820} />
        <QuestionChips items={chips} onPick={onSend} disabled={disabled} dir={dir} variant="glass" grid={stacked}
          style={{ marginTop: stacked ? 12 : 14, width: stacked ? '100%' : 'min(820px, 100%)', marginInline: 'auto' }} />
        {!stacked && <p className="hero-foot">{t.foot(first)}</p>}
      </div>
    </section>
  );
}
