import { useEffect, useRef, useState } from 'react';
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
  { en: 'One resume, a score for each open job.', he: 'קו״ח אחד, ציון לכל משרה פתוחה.' },
  { en: '8Legs turns a plain description into a chatbot. No code.', he: '8Legs הופך תיאור פשוט לצ׳טבוט. בלי קוד.' },
  { en: 'Native Hebrew. The voice agents speak it too.', he: 'עברית שפת אם. גם הסוכנים הקוליים מדברים אותה.' },
  { en: 'IDF network admin — Active Directory and Cisco.', he: 'ניהול רשת בצה״ל — Active Directory ו-Cisco.' },
  { en: 'The live-call agent writes the CRM event mid-call.', he: 'סוכן השיחה כותב ל-CRM עוד בזמן השיחה.' },
  { en: 'On 8Legs, card and ID numbers never reach the model.', he: 'ב-8Legs, כרטיס ותעודת זהות לא מגיעים למודל.' },
];

const HOLD = 4600;
const EXIT = 420;

/**
 * Cycles the facts. On a wide screen each one slides in from the left, then
 * the right. When the column is too narrow to hold a line beside the figure,
 * it sits under him and still arrives from the side, by a few pixels, so it
 * cannot leave the screen. A mouse hover holds the current line; a click, or
 * Enter, keeps it there. Reaching the line while it is leaving brings that
 * same line back. Keyboard focus holds it too. Reduced motion swaps the
 * words in place, with no slide.
 *
 * `hold` freezes the cycle while the recorded hello is playing. `avoidRight`
 * keeps every line on the left while the hello bubble occupies that side.
 * The line already on screen does not jump across when the bubble goes away.
 */
export function HomeFacts({ lang, t, hold = false, avoidRight = false }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in');
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [keyFocus, setKeyFocus] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [side, setSide] = useState('left');
  const fromKeyboard = useRef(false);
  const fact = FACTS[index];
  const text = fact[lang] || fact.en;
  const paused = hover || pinned || keyFocus || hidden || hold;

  // A new line picks a side. While the hello bubble is on the right, every
  // line stays on the left. Clearing the bubble does not move the line that
  // is already up — the next one takes its own side.
  useEffect(() => {
    setSide(avoidRight || index % 2 === 0 ? 'left' : 'right');
  }, [index]);
  useEffect(() => {
    if (avoidRight) setSide('left');
  }, [avoidRight]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Tab') fromKeyboard.current = true; };
    const onPointer = () => { fromKeyboard.current = false; };
    const onVis = () => setHidden(document.hidden);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    // Caught on the way out: bring the same line back, instead of finishing
    // the exit and holding the next one.
    if (paused && phase === 'out') {
      setPhase('in');
      return undefined;
    }
    if (paused && phase === 'in') return undefined;
    const wait = reduced ? 5600 : (phase === 'in' ? HOLD : EXIT);
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

  const motion = reduced ? 'still' : side;
  const fineHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  function togglePin() {
    setPinned((v) => !v);
  }

  return (
    <div className="home-fact-slot" data-side={side} data-pinned={pinned ? 'true' : 'false'} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <button
        type="button"
        className="home-fact-btn"
        aria-pressed={pinned}
        aria-describedby="home-fact-hint"
        onClick={togglePin}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          togglePin();
        }}
        onMouseEnter={() => { if (fineHover) setHover(true); }}
        onMouseLeave={() => setHover(false)}
        onFocus={() => { if (fromKeyboard.current) setKeyFocus(true); }}
        onBlur={() => setKeyFocus(false)}
      >
        <span key={`${index}-${phase}`} className={`home-fact is-${phase} from-${motion}`}>{text}</span>
      </button>
      <span id="home-fact-hint" className="sr-only">{pinned ? t.factsResume : t.factsPause}</span>
    </div>
  );
}
