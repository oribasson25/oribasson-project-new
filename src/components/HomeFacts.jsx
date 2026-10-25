import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/hooks.js';

/*
 * One line at a time, beside the figure. Each line is a short paraphrase of
 * something already published in content/ — never a new claim.
 *
 * 1. profile.headline "Production LLM agents"; resume.experience[0] Libra Insurance.
 * 2. projects claims-voice-agent: Hebrew claim intake and status, live CRM.
 * 3. resume.experience[1] claims call-center supervisor; that role's summary
 *    says the AI platform now automates the workflow he supervised.
 * 4. resume.experience[1] highlight: trained representatives and handled escalations.
 * 5. resume.summary and the Languages & Code skill group: TypeScript, Python, SQL.
 * 6. resume.experience[0] highlight "API Reverse-Engineering": undocumented CRM
 *    APIs from network traffic, written up as Postman collections.
 * 7. resume.summary and the roadmap highlight: HITL boundaries set before development.
 * 8. resume.experience[0] "Multi-Agent System Architecture": error recovery.
 * 9. resume.experience[0] "Production Incident Debugging": pilot to full live launch.
 * 10. projects hr-recruitment: each uploaded resume is scored against every open job.
 * 11. projects hr-recruitment highlight "Reads real resumes": PDF and Word, Hebrew and English.
 * 12. projects 8legs tagline and description: a plain description becomes a chatbot, no code.
 * 13. projects 8legs description: answers from the business's documents and website.
 * 14. resume.languages Hebrew native; skill "Voice & Chat agents (Hebrew)".
 * 15. resume.experience[2] IDF network administrator: Active Directory and Cisco.
 * 16. projects live-call-intelligence: writes a CRM event while the call is in progress.
 * 17. projects 8legs highlight "Privacy": card and Israeli ID numbers are masked
 *     before they reach the model.
 * 18. projects back-office-agent: incoming mail, documents filed on the claim.
 * 19. projects policy-documents: authenticates, then sends the policy in chat.
 * 20. resume.experience[0] highlight "Automated Eval & QA Pipelines": a judge
 *     model scores Hebrew transcripts.
 * 21. resume.education[0]: cybersecurity certificate at Kernelios.
 * 22. resume.languages English, professional working proficiency, beside native Hebrew.
 * 23. projects back-office-agent description: OCR, then the document is filed on the claim.
 * 24. projects live-call-intelligence description: escalation signals during the call.
 * 25. projects 8legs description: live as a website widget or on WhatsApp.
 * 26. projects hr-recruitment highlight: drag-and-drop Kanban.
 * 27. resume.experience[0] eval highlight: quality dashboards for the business.
 * 28. resume.experience[0] "Production Incident Debugging": WebSocket audio / ASR.
 * 29. resume.experience[0] roadmap highlight: volume, cost, and feasibility.
 * 30. resume.experience[1] highlight: claim lifecycle and regulatory constraints.
 * 31. resume.experience[0] "Multi-Agent System Architecture": cross-turn state.
 * 32. projects back-office-agent: structured tasks created in the core systems.
 * 33. projects hr-recruitment highlight "AI CV matching": a one-line explanation.
 * 34. projects hr-recruitment highlight "Everyday HR work": notes, reminders, Excel.
 * 35. projects 8legs highlight "Autopilot": questions about the business, then the chatbot.
 * 36. projects 8legs description: email sent from a real Gmail inbox.
 * 37. projects 8legs description: Claude, GPT, or a local model through Ollama.
 * 38. projects 8legs highlight "Knowledge (RAG)": a whole-site crawl, and a
 *     Hebrew–English keyword bridge.
 * 39. projects 8legs highlight "Chatbots as code": a private repo, and A/B tests
 *     on live traffic.
 * 40. resume.education[0] details: segmentation, endpoint hardening, log analysis.
 * 41. resume.experience[0] "Production Incident Debugging": the launch alongside
 *     engineering, IT, cybersecurity, SOC, and ops.
 */
const FACTS = [
  { en: 'Live LLM agents at Libra Insurance.', he: 'סוכני LLM בפרודקשן, בליברה ביטוח.' },
  { en: 'A Hebrew voice agent opens the claim and checks the status.', he: 'סוכן קולי בעברית פותח תביעה ובודק סטטוס.' },
  { en: 'Ran the claims desk. Then built the agents for it.', he: 'ניהל את מוקד התביעות. אחר כך בנה לו את הסוכנים.' },
  { en: 'Trained the reps, and took the calls they escalated.', he: 'הכשיר את הנציגים, וטיפל בשיחות שהוסלמו.' },
  { en: 'The agent tools are TypeScript, Python, and SQL.', he: 'הכלים לסוכן: TypeScript, ‏Python ו-SQL.' },
  { en: 'Undocumented CRM APIs, read off the wire, filed in Postman.', he: 'API לא מתועד של ה-CRM, מהרשת אל Postman.' },
  { en: 'A person still has to say yes before it ships.', he: 'לפני שזה עולה, מישהו עדיין צריך לאשר.' },
  { en: 'If a step fails, the agent recovers and carries on.', he: 'אם שלב נכשל, הסוכן מתאושש וממשיך את השיחה.' },
  { en: 'Took the agents from a pilot to a full live launch.', he: 'ליווה את הסוכנים מפיילוט עד עלייה מלאה לאוויר.' },
  { en: 'One resume, a score for each open job.', he: 'קו״ח אחד, ציון לכל משרה פתוחה.' },
  { en: 'PDF and Word resumes, read in Hebrew and in English.', he: 'קורות חיים ב-PDF וב-Word, בעברית ובאנגלית.' },
  { en: '8Legs turns a plain description into a chatbot. No code.', he: '8Legs הופך תיאור פשוט לצ׳טבוט. בלי קוד.' },
  { en: '8Legs answers from the company\'s documents and site.', he: '8Legs עונה מתוך המסמכים והאתר של העסק.' },
  { en: 'Native Hebrew. The voice agents speak it too.', he: 'עברית שפת אם. גם הסוכנים הקוליים מדברים אותה.' },
  { en: 'IDF network admin — Active Directory and Cisco.', he: 'ניהול רשת בצה״ל — Active Directory ו-Cisco.' },
  { en: 'The live-call agent writes the CRM event mid-call.', he: 'סוכן השיחה כותב ל-CRM עוד בזמן השיחה.' },
  { en: 'On 8Legs, card and ID numbers never reach the model.', he: 'ב-8Legs, כרטיס ותעודת זהות לא מגיעים למודל.' },
  { en: 'The back office reads the mail and files it on the claim.', he: 'הבק-אופיס קורא את המייל ומתייק אותו בתיק התביעה.' },
  { en: 'The chat checks who is asking, then sends the policy.', he: 'הצ׳אט בודק מי פונה, ואז שולח את הפוליסה.' },
  { en: 'A judge model scores the Hebrew call transcripts.', he: 'מודל שופט נותן ציון לתמלולי השיחות בעברית.' },
  { en: 'A cybersecurity certificate from Kernelios.', he: 'הסמכת סייבר ממכללת Kernelios.' },
  { en: 'English as well, at a working professional level.', he: 'גם אנגלית, ברמה של עבודה.' },
  { en: 'OCR reads the document from the mail, then files it on the claim.', he: 'OCR קורא את המסמך מהמייל, ומתייק אותו בתביעה.' },
  { en: 'It catches an escalation while the rep is still on the line.', he: 'סוכן השיחה קולט הסלמה עוד במהלך השיחה.' },
  { en: '8Legs can sit on the site itself, or inside WhatsApp.', he: '8Legs יושב באתר עצמו, או בתוך WhatsApp.' },
  { en: 'Candidates are moved by hand across a Kanban board.', he: 'את המועמדים מזיזים ביד על לוח Kanban.' },
  { en: 'The call scores land on a dashboard the business reads.', he: 'ציוני השיחות עולים לדשבורד שהעסק קורא.' },
  { en: 'A voice fault in production, traced along the audio wire.', he: 'תקלת קול בפרודקשן, דרך האודיו על הקו.' },
  { en: 'The next workflow is chosen by volume, cost, and feasibility.', he: 'מה לבנות אחר כך נקבע לפי נפח, עלות, והאם זה ישים.' },
  { en: 'Claim rules, learned on the desk, decide what an agent is allowed to do.', he: 'כללי התביעה, מהמוקד, קובעים מה מותר לסוכן.' },
  { en: 'The conversation carries from one turn to the next.', he: 'השיחה נשמרת מתור לתור.' },
  { en: 'The back office opens a task in the core system.', he: 'הבק-אופיס פותח משימה במערכת הליבה.' },
  { en: 'Every match score comes with one line on why.', he: 'כל ציון התאמה מגיע עם שורה שמסבירה למה.' },
  { en: 'Notes, reminders, and an Excel export sit beside the board.', he: 'הערות, תזכורות וייצוא לאקסל יושבים ליד הלוח.' },
  { en: '8Legs asks about the business, then builds the chatbot.', he: '8Legs שואל על העסק, ואז בונה את הצ׳טבוט.' },
  { en: 'The mail leaves from a real Gmail inbox.', he: 'המייל יוצא מתיבת Gmail אמיתית.' },
  { en: 'The running model can be Claude, GPT, or Ollama.', he: 'המודל שרץ יכול להיות Claude, ‏GPT או Ollama.' },
  { en: 'A whole site is crawled, and Hebrew search finds the English.', he: 'אתר שלם נסרק, וחיפוש בעברית מוצא את האנגלית.' },
  { en: 'Each 8Legs chatbot has its own repo, and a live A/B test.', he: 'לכל צ׳טבוט ב-8Legs יש ריפו משלו, וניסוי A/B חי.' },
  { en: 'The certificate covered segmentation, hardening, and reading logs.', he: 'ההסמכה כללה סגמנטציה, הקשחת עמדות וניתוח לוגים.' },
  { en: 'The launch ran with engineering, IT, cyber, the SOC, and ops.', he: 'ההשקה רצה עם פיתוח, IT, סייבר, ה-SOC ותפעול.' },
];

const EXIT = 420;
const ENTER = 420;

/** Long enough to read this line, and no longer. A short one moves on. */
function readTime(text) {
  const chars = Array.from(text || '').length;
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  const ms = Math.max(1800 + chars * 55, 2200 + words * 320);
  return Math.round(Math.min(7600, Math.max(4000, ms)));
}

/**
 * Cycles the facts. On a wide screen each one slides in from the left, then
 * the right. When the column is too narrow to hold a line beside the figure,
 * it sits under him and still arrives from the side, by a few pixels, so it
 * cannot leave the screen. A mouse hover holds the current line; a click, or
 * Enter, keeps it there. Arrow keys, while the line is focused, show the
 * next or the previous one. Reaching the line while it is leaving brings
 * that same line back. Keyboard focus holds it too, and so does scrolling it
 * off the screen. A text field holds it as well, so the words stay put
 * while a question is typed. Reduced motion swaps the words in place, with
 * no slide, and leaves each line up a little longer.
 *
 * `hold` freezes the cycle while the recorded hello is playing. `avoidRight`
 * keeps every line on the left while the hello bubble occupies that side.
 * The line already on screen does not jump across when the bubble goes away.
 * A new line is already on its side in the first paint, including when motion
 * is reduced and there is no slide to hide a late move.
 */
export function HomeFacts({ lang, t, hold = false, avoidRight = false }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in');
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [keyFocus, setKeyFocus] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [seen, setSeen] = useState(true);
  const [composing, setComposing] = useState(false);
  const [side, setSide] = useState('left');
  const slotRef = useRef(null);
  const lineRef = useRef(null);
  const fromKeyboard = useRef(false);
  const avoidRef = useRef(avoidRight);
  avoidRef.current = avoidRight;
  const fact = FACTS[index];
  const text = fact[lang] || fact.en;
  const paused = hover || pinned || keyFocus || hidden || hold || !seen || composing;

  // While the hello bubble is on the right, the line already up moves to the
  // left before paint. Clearing the bubble does not send it back — the next
  // line picks its own side, in the same render as the new words.
  if (avoidRight && side !== 'left') setSide('left');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Tab') fromKeyboard.current = true; };
    const onPointer = () => { fromKeyboard.current = false; };
    const onVis = () => setHidden(document.hidden);
    // A question being typed should not lose the line it was read against.
    const isField = (el) => !!el && (el.tagName === 'TEXTAREA'
      || (el.tagName === 'INPUT' && !['button', 'submit', 'checkbox', 'radio', 'file'].includes(el.type)));
    const onFocus = (e) => setComposing(isField(e.target));
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('focusin', onFocus);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('focusin', onFocus);
    };
  }, []);

  // A line scrolled under the fold on a phone should not change unseen.
  useEffect(() => {
    const el = slotRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setSeen(entry.isIntersecting);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Caught on the way out: bring the same line back, instead of finishing
    // the exit and holding the next one.
    if (paused && phase === 'out') {
      setPhase('in');
      return undefined;
    }
    if (paused && phase === 'in') return undefined;
    // The entrance is not reading time. Reduced motion has no entrance.
    const reading = readTime(text) + (reduced ? 1800 : 0);
    const wait = phase === 'in' ? reading + (reduced ? 0 : ENTER) : EXIT;
    const timer = setTimeout(() => {
      if (reduced || phase === 'out') {
        const next = (index + 1) % FACTS.length;
        setSide(avoidRef.current || next % 2 === 0 ? 'left' : 'right');
        setIndex(next);
        setPhase('in');
      } else {
        setPhase('out');
      }
    }, wait);
    return () => clearTimeout(timer);
  }, [paused, phase, index, reduced, text]);

  const motion = reduced ? 'still' : side;
  const fineHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  // The words stay one node. Replacing them to replay the slide made a reader
  // hear the same line again as it left. Clearing the animation before paint
  // starts it over, and the text only changes when the line does.
  useLayoutEffect(() => {
    const el = lineRef.current;
    if (!el || reduced) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }, [index, phase, side, reduced]);

  function togglePin() {
    setPinned((v) => !v);
  }

  function step(dir) {
    const next = (index + dir + FACTS.length) % FACTS.length;
    setPhase('in');
    setSide(avoidRight || next % 2 === 0 ? 'left' : 'right');
    setIndex(next);
  }

  return (
    <div ref={slotRef} className="home-fact-slot" role="group" aria-label={t.factsLabel} data-side={side} data-pinned={pinned ? 'true' : 'false'} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {/* The hint stays off the live region. A new line is the words. */}
      <div className="home-fact-live" aria-live={hold ? 'off' : 'polite'} aria-atomic="true">
        <button
          type="button"
          className="home-fact-btn"
          aria-pressed={pinned}
          aria-setsize={FACTS.length}
          aria-posinset={index + 1}
          aria-describedby={keyFocus ? 'home-fact-hint' : undefined}
          onClick={togglePin}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePin();
              return;
            }
            if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
            const forward = lang === 'he' ? 'ArrowLeft' : 'ArrowRight';
            const back = lang === 'he' ? 'ArrowRight' : 'ArrowLeft';
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== forward && e.key !== back) return;
            e.preventDefault();
            step(e.key === 'ArrowDown' || e.key === forward ? 1 : -1);
          }}
          onMouseEnter={() => { if (fineHover) setHover(true); }}
          onMouseLeave={() => setHover(false)}
          onFocus={() => { if (fromKeyboard.current) setKeyFocus(true); }}
          onBlur={() => setKeyFocus(false)}
        >
          <span ref={lineRef} className={`home-fact is-${phase} from-${motion}`}>{text}</span>
        </button>
      </div>
      <span id="home-fact-hint" className="sr-only">{pinned ? t.factsResume : t.factsPause}</span>
    </div>
  );
}
