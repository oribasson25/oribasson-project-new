import { useEffect, useState } from 'react';
import { useReducedMotion } from '../lib/hooks.js';

/*
 * One line at a time, beside the figure. Each line is a short paraphrase of
 * something already published in content/ — never a new claim.
 *
 * 1. profile.headline "Production LLM agents"; resume.experience[0] Libra Insurance.
 * 2. projects claims-voice-agent: Hebrew claim intake and status, live CRM.
 * 3. resume.experience[1] claims call-center supervisor; that role's summary
 *    says the AI platform now automates the workflow he supervised.
 * 4. resume.summary and the Languages & Code skill group: TypeScript, Python, SQL.
 * 5. resume.experience[0] highlight "API Reverse-Engineering": undocumented CRM
 *    APIs from network traffic, written up as Postman collections.
 * 6. resume.summary and the roadmap highlight: HITL boundaries set before development.
 * 7. projects hr-recruitment: each uploaded resume is scored against every open job.
 * 8. projects 8legs tagline and description: a plain description becomes a chatbot, no code.
 * 9. resume.languages Hebrew native; skill "Voice & Chat agents (Hebrew)".
 * 10. resume.experience[2] IDF network administrator: Active Directory and Cisco.
 * 11. projects live-call-intelligence: writes a CRM event while the call is in progress.
 * 12. projects 8legs highlight "Privacy": card and Israeli ID numbers are masked
 *     before they reach the model.
 */
const FACTS = [
  { en: 'Live LLM agents at Libra Insurance.', he: 'סוכני LLM בפרודקשן, בליברה ביטוח.' },
  { en: 'A Hebrew voice agent opens the claim and checks the status.', he: 'סוכן קולי בעברית פותח תביעה ובודק סטטוס.' },
  { en: 'Ran the claims desk. Then built the agents for it.', he: 'ניהל את מוקד התביעות. אחר כך בנה לו את הסוכנים.' },
  { en: 'The agent tools are TypeScript, Python, and SQL.', he: 'הכלים לסוכן: TypeScript, ‏Python ו-SQL.' },
  { en: 'Undocumented CRM APIs, read off the wire, filed in Postman.', he: 'API לא מתועד של ה-CRM, מהרשת אל Postman.' },
  { en: 'A person still has to say yes before it ships.', he: 'לפני שזה עולה, מישהו עדיין צריך לאשר.' },
  { en: 'Each resume is scored against every open job.', he: 'כל קו״ח מקבל ציון מול כל משרה פתוחה.' },
  { en: '8Legs turns a plain description into a chatbot. No code.', he: '8Legs הופך תיאור פשוט לצ׳טבוט. בלי קוד.' },
  { en: 'Native Hebrew. The voice agents speak it too.', he: 'עברית שפת אם. גם הסוכנים הקוליים מדברים אותה.' },
  { en: 'IDF network admin — Active Directory and Cisco.', he: 'ניהול רשת בצה״ל — Active Directory ו-Cisco.' },
  { en: 'The live-call agent writes the CRM event mid-call.', he: 'סוכן השיחה כותב ל-CRM עוד בזמן השיחה.' },
  { en: 'On 8Legs, card and ID numbers never reach the model.', he: 'ב-8Legs, כרטיס ותעודת זהות לא מגיעים למודל.' },
];

const HOLD = 3400;
const EXIT = 380;

/**
 * Cycles the facts. On a wide screen each one slides in from the left, then
 * the right. On a phone it sits under the figure and only fades, so it cannot
 * cover the figure or run off the screen. Hover holds the current line.
 * Reduced motion swaps the words in place.
 */
export function HomeFacts({ lang, stacked }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in');
  const [paused, setPaused] = useState(false);
  const fact = FACTS[index];
  const text = fact[lang] || fact.en;
  const side = index % 2 === 0 ? 'left' : 'right';

  useEffect(() => {
    if (paused) return undefined;
    const wait = reduced ? 4200 : (phase === 'in' ? HOLD : EXIT);
    const timer = setTimeout(() => {
      if (reduced || phase === 'out') {
        setIndex((n) => (n + 1) % FACTS.length);
        setPhase('in');
      } else {
        setPhase('out');
      }
    }, wait);
    return () => clearTimeout(timer);
  }, [paused, phase, index, reduced]);

  const motion = reduced ? 'still' : (stacked ? 'fade' : side);
  const place = stacked ? {
    position: 'relative',
    width: 'min(280px, 100%)',
    marginTop: 12,
    textAlign: 'center',
  } : {
    position: 'absolute',
    top: '58%',
    width: 200,
    margin: 0,
    textAlign: side === 'left' ? 'right' : 'left',
    ...(side === 'left' ? { right: 'calc(50% + 160px)' } : { left: 'calc(50% + 160px)' }),
  };

  return (
    <div
      className="home-fact-slot"
      data-fact={index}
      data-side={stacked ? 'under' : side}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={place}
    >
      <p key={`${index}-${phase}`} className={`home-fact is-${phase} from-${motion}`} style={{ margin: 0 }}>
        {text}
      </p>
    </div>
  );
}
