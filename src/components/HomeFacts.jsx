import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/hooks.js';

/*
 * One line at a time, beside the figure. Each line is a short paraphrase of
 * something already published in content/ — never a new claim.
 *
 * 1. profile.headline "Production LLM agents"; resume.experience[0] Libra Insurance.
 * 2. projects claims-voice-agent: Hebrew claim intake and status, live CRM.
 * 3. resume.experience[1] is a claims shift supervisor, then the agents.
 * 4. resume.experience[1] highlight: trained representatives and handled escalations.
 * 5. resume.summary and the Languages & Code skill group: TypeScript, Python, SQL.
 * 6. resume.experience[0] highlight "API Reverse-Engineering": undocumented CRM
 *    APIs from network traffic, written up as Postman collections.
 * 7. resume.summary and the roadmap highlight: HITL boundaries, set before development.
 * 8. resume.experience[0] "Multi-Agent System Architecture": error recovery.
 * 9. resume.experience[0] "Production Incident Debugging": guided the pilot to a full live launch.
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
 * 39. projects 8legs highlight "Chatbots as code": a private repo per chatbot,
 *     and A/B tests on live traffic.
 * 40. resume.education[0] details: segmentation, endpoint hardening, log analysis.
 * 41. resume.experience[0] "Production Incident Debugging": the launch alongside
 *     engineering, IT, cybersecurity, SOC, and ops.
 * 42. projects claims-voice-agent: validation before the claim is written.
 * 43. resume.experience[0] "Multi-Agent System Architecture": system prompts
 *     and multi-step reasoning. Cross-turn state and recovery are already said.
 * 44. resume.experience[0] eval highlight: Hebrew tagging rubrics.
 * 45. projects live-call-intelligence: a context summary during the call.
 * 46. resume.experience[1]: working with the claims desk shortened requirements
 *     and eased adoption of the agents.
 * 47. projects hr-recruitment highlight "AI CV matching": color by fit, and a
 *     match history.
 * 48. projects hr-recruitment highlight "Everyday HR work": interview summaries
 *     and ratings. Notes, reminders, and Excel are already said.
 * 49. projects 8legs description: records data into tables, and calls an
 *     external system.
 * 50. projects 8legs description: a full English and Hebrew interface.
 * 51. projects 8legs highlight "Python tools": Python, edited in Monaco.
 * 52. resume.education[0] details: identity and access, and Group Policy.
 *     Segmentation, hardening, and logs are already said.
 * 53. resume.experience[0] "Custom Tooling & Function Calling": live CRM
 *     read/write and customer authentication. TypeScript and cross-turn
 *     state are already said.
 * 54. resume.experience[2] second highlight: telephony, meeting rooms, and
 *     workstations. Active Directory and Cisco are already said.
 * 55. resume.experience[0] roadmap highlight: success metrics, set before
 *     development. Volume, cost, feasibility, and HITL are already said.
 * 56. resume.experience[0] "Production Incident Debugging": reporting
 *     discrepancies. The audio wire and the launch are already said.
 * 57. projects hr-recruitment description: a batch of resumes, scored together.
 * 58. projects 8legs highlight "Chatbots as code": an npm CLI. The repo and
 *     the A/B tests are already said.
 * 59. projects policy-documents: locates the active policies. Authentication
 *     and sending are already said.
 * 60. projects back-office-agent: resolves a status question from the mail.
 * 61. projects 8legs highlight "Python tools": any pip package. Monaco is
 *     already said.
 * 62. projects 8legs role: a personal project, designed and built end to end.
 * 63. resume.experience[0] tech and the Integrations skill: MCP, beside the CRM.
 * 64. resume.experience[1] summary: the daily claims workflow is what the agents run.
 * 65. projects hr-recruitment highlight "Recruitment pipeline": from the resume,
 *     through interview and offer, to hired or out.
 * 66. projects 8legs highlight "Knowledge (RAG)": PDF and Word uploads, then
 *     full-text search. The crawl and the Hebrew–English bridge are already said.
 * 67. projects 8legs highlight "Chatbots as code": branches. The repo and the
 *     A/B tests are already said.
 * 68. resume.education[0] details: network security architecture and traffic
 *     filtering. Segmentation, hardening, logs, identity, and Group Policy
 *     are already said.
 * 69. resume.skills Infrastructure & Networking: Windows Server, beside the
 *     rest of that list. Active Directory and Cisco are already said.
 * 70. projects hr-recruitment description: a resume library, beside the board.
 * 71. projects 8legs highlight "Privacy": masked before the conversation
 *     history. The model is already said.
 * 72. projects 8legs highlight "Autopilot": the wizard writes the prompt,
 *     the knowledge, and the channel. Asking about the business is already said.
 * 73. projects hr-recruitment highlight "Recruitment pipeline": hired,
 *     rejected, ghosted, or withdrew. The path to an offer is already said.
 * 74. projects 8legs highlight "Chatbots as code": a private GitHub repo.
 *     The repo, the branches, the CLI, and the A/B tests are already said.
 * 75. projects hr-recruitment role: designed and built full-stack, at Libra.
 * 76. resume.experience[2] first highlight: user accounts and their
 *     permissions. Active Directory and Cisco are already said.
 * 77. projects back-office-agent tagline: a multi-modal model reads the mail.
 *     OCR and filing are already said.
 * 78. resume.summary: a feature is owned from the requirement through go-live.
 *     The pilot, the metrics, and the HITL line are already said.
 */
const FACTS = [
  { en: 'Live LLM agents at Libra Insurance.', he: 'סוכני LLM בפרודקשן, בליברה ביטוח.' },
  { en: 'A Hebrew voice agent opens the claim and checks the status.', he: 'סוכן קולי בעברית פותח תביעה ובודק סטטוס.' },
  { en: 'Supervised a claims shift. Then built the agents for it.', he: 'פיקח על משמרת במוקד. אחר כך בנה לה את הסוכנים.' },
  { en: 'Trained the reps, and took the calls they escalated.', he: 'הכשיר את הנציגים, וטיפל בשיחות שהוסלמו.' },
  { en: 'The agent tools are TypeScript, Python, and SQL.', he: 'הכלים לסוכן: TypeScript, ‏Python ו-SQL.' },
  { en: 'Undocumented CRM APIs, read off the wire, filed in Postman.', he: 'API לא מתועד של ה-CRM, מהרשת אל Postman.' },
  { en: 'Where a person stays in the loop is set before the build.', he: 'לפני הפיתוח נקבע איפה אדם נשאר בתהליך.' },
  { en: 'If a step fails, the agent recovers and carries on.', he: 'אם שלב נכשל, הסוכן מתאושש וממשיך את השיחה.' },
  { en: 'Guided the agents from a pilot to a full live launch.', he: 'ליווה את הסוכנים מפיילוט עד עלייה מלאה לאוויר.' },
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
  { en: 'Claude or GPT, or a local model through Ollama.', he: 'Claude או GPT, או מודל מקומי דרך Ollama.' },
  { en: 'A whole site is crawled, and Hebrew search finds the English.', he: 'אתר שלם נסרק, וחיפוש בעברית מוצא את האנגלית.' },
  { en: 'Each 8Legs chatbot has its own repo, and A/B tests on live traffic.', he: 'לכל צ׳טבוט ב-8Legs יש ריפו משלו, וניסויי A/B על תנועה אמיתית.' },
  { en: 'The certificate covered segmentation, hardening, and reading logs.', he: 'ההסמכה כללה סגמנטציה, הקשחת עמדות וניתוח לוגים.' },
  { en: 'The launch ran with engineering, IT, cyber, the SOC, and ops.', he: 'ההשקה רצה עם פיתוח, IT, סייבר, ה-SOC ותפעול.' },
  { en: 'The voice agent checks the details before it writes the claim.', he: 'הסוכן הקולי בודק את הפרטים לפני שהוא כותב את התביעה.' },
  { en: 'The prompts and the reasoning steps are written for live traffic.', he: 'הפרומפטים ושלבי החשיבה נכתבים לתעבורה חיה.' },
  { en: 'Hebrew transcripts are scored against a written tagging rubric.', he: 'תמלולים בעברית מקבלים ציון לפי רובריקת תיוג כתובה.' },
  { en: 'The live-call agent writes a short summary while the rep is still talking.', he: 'סוכן השיחה כותב סיכום קצר עוד בזמן שהנציג מדבר.' },
  { en: 'Working beside the claims desk shortened the requirements and the path to adoption.', he: 'העבודה מול מוקד התביעות קיצרה את הדרישות ואת הדרך לאימוץ.' },
  { en: 'A match is colored by fit, and the earlier scores stay on record.', he: 'ההתאמה נצבעת לפי הרמה, והציונים הקודמים נשמרים.' },
  { en: 'Each candidate keeps an interview summary and a rating.', he: 'לכל מועמד יש סיכום ראיון ודירוג.' },
  { en: '8Legs writes data into tables, and connects to an outside system.', he: '8Legs רושם נתונים לטבלאות, ומתחבר למערכת חיצונית.' },
  { en: 'The 8Legs interface itself is in Hebrew and in English.', he: 'הממשק של 8Legs עצמו בעברית ובאנגלית.' },
  { en: 'A custom 8Legs tool is Python, edited in Monaco on the page.', he: 'כלי מותאם ב-8Legs נכתב ב-Python, בעורך Monaco שבדף.' },
  { en: 'The cybersecurity certificate covered identity, access, and Group Policy.', he: 'הסמכת הסייבר כללה זהויות, הרשאות ו-Group Policy.' },
  { en: 'Function calls read and write the CRM, and check the customer.', he: 'קריאות הפונקציה קוראות וכותבות ב-CRM, ובודקות מי הלקוח.' },
  { en: 'The IDF post also covered telephony, meeting rooms, and the desks.', he: 'בצה״ל גם טלפוניה, חדרי ישיבות ועמדות קצה.' },
  { en: 'Success is defined as a metric before the build starts.', he: 'מדד ההצלחה נקבע לפני שמתחילים לבנות.' },
  { en: 'A reporting gap in production, traced and closed.', he: 'פער בדיווח בפרודקשן, שאותר ונסגר.' },
  { en: 'A batch of resumes is scored in one upload.', he: 'מקבץ קורות חיים מקבל ציון בהעלאה אחת.' },
  { en: 'An npm CLI can drive an 8Legs chatbot.', he: 'CLI של npm יכול להפעיל צ׳טבוט ב-8Legs.' },
  { en: 'The chat finds the policies that are still active.', he: 'הצ׳אט מאתר את הפוליסות שעדיין פעילות.' },
  { en: 'A status question that arrived by mail gets an answer.', he: 'בירור סטטוס שהגיע במייל מקבל תשובה.' },
  { en: 'A Python tool on 8Legs can pull in any pip package.', he: 'כלי Python ב-8Legs יכול להשתמש בכל חבילת pip.' },
  { en: '8Legs is a personal project, designed and built end to end.', he: '8Legs הוא פרויקט אישי, שעוצב ונבנה מקצה לקצה.' },
  { en: 'The agent tools speak MCP, beside the CRM.', he: 'הכלים לסוכן מדברים גם MCP, לצד ה-CRM.' },
  { en: 'The daily claims work is what the agents run now.', he: 'העבודה היומית במוקד היא מה שהסוכנים מריצים היום.' },
  { en: 'A candidate moves from the resume to an interview, an offer, or out.', he: 'מועמד עובר מקו״ח לראיון, להצעה, או החוצה.' },
  { en: '8Legs reads uploaded PDF and Word, then searches the text.', he: '8Legs קורא PDF ו-Word שהועלו, ואז מחפש בטקסט.' },
  { en: 'Each 8Legs chatbot keeps its own branches.', he: 'לכל צ׳טבוט ב-8Legs יש ענפים משלו.' },
  { en: 'The certificate covered network security and how traffic is filtered.', he: 'ההסמכה כללה אבטחת רשת ואיך מסננים תעבורה.' },
  { en: 'Windows Server sits with the rest of the networking.', he: 'Windows Server יושב עם שאר עבודת הרשת.' },
  { en: 'The hiring system keeps a resume library.', he: 'מערכת הגיוס שומרת מאגר קורות חיים.' },
  { en: 'On 8Legs, card and ID numbers stay out of the chat history.', he: 'ב-8Legs, כרטיס ותעודת זהות לא נכנסים להיסטוריית השיחה.' },
  { en: 'The 8Legs wizard writes the prompt, the knowledge, and the channel.', he: 'האשף של 8Legs כותב פרומפט, ידע וערוץ.' },
  { en: 'The board\'s last stages: hired, rejected, ghosted, or withdrew.', he: 'בלוח, השלבים האחרונים הם גיוס, דחייה, היעלמות או חזרה.' },
  { en: 'Each 8Legs chatbot gets a private GitHub repo.', he: 'לכל צ׳טבוט ב-8Legs יש ריפו GitHub פרטי.' },
  { en: 'The hiring system was designed and built full-stack at Libra.', he: 'מערכת הגיוס עוצבה ונבנתה ב-full-stack, בליברה.' },
  { en: 'The IDF post opened user accounts and set their permissions.', he: 'בצה״ל נפתחו משתמשים ונקבעו ההרשאות שלהם.' },
  { en: 'The back office reads the mail with a multi-modal model.', he: 'הבק-אופיס קורא את המייל במודל מולטי-מודאלי.' },
  { en: 'A feature is owned from the requirement through go-live.', he: 'פיצ׳ר מובל מהדרישה ועד העלייה לאוויר.' },
];

/* A Latin name inside a Hebrew line. The span is the language change;
   the sentence keeps its own direction. */
const LATIN = /(?:[A-Za-z][A-Za-z0-9+.#&'’/-]*|\d+[A-Za-z][A-Za-z0-9+.#&'’/-]*)/g;

function FactWords({ text, lang }) {
  if (lang !== 'he' || !text) return text;
  const parts = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(LATIN)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(<span key={key} lang="en">{match[0]}</span>);
    key += 1;
    last = at + match[0].length;
  }
  if (!parts.length) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

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
 * next or the previous one. A finger does the same with a sideways swipe,
 * and the page still scrolls up and down. Reaching the line while it is
 * leaving brings that same line back. Keyboard focus holds it too, until
 * Enter or Escape asks the lines to move again — focus alone would have
 * kept a line the key had just released. Scrolling it off the screen holds
 * it, and so does a text field, so the words stay put while a question is
 * typed. Reduced motion swaps the words in place, with no slide, and leaves
 * each line up a little longer.
 *
 * `hold` freezes the cycle while the recorded hello is playing, and while
 * the pointer rests on the figure, so a line is not swapped out from under
 * that look. An open sheet covers the line, and the cycle waits for that
 * too — the line is still on screen geometrically, so being in view is not
 * enough to know it can be read. `avoidRight`
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
  // Focus holds the line so it is not swapped out from under a reader.
  // Releasing it on purpose (Enter, or Escape) wins over that hold.
  const [keyHold, setKeyHold] = useState(true);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [seen, setSeen] = useState(true);
  const [composing, setComposing] = useState(false);
  const [covered, setCovered] = useState(false);
  const [side, setSide] = useState('left');
  const slotRef = useRef(null);
  const lineRef = useRef(null);
  const fromKeyboard = useRef(false);
  const swipe = useRef(null);
  const suppressClick = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;
  useEffect(() => () => { if (swipe.current) swipe.current.drop(); }, []);
  const avoidRef = useRef(avoidRight);
  avoidRef.current = avoidRight;
  const fact = FACTS[index];
  const text = fact[lang] || fact.en;
  const paused = hover || pinned || (keyFocus && keyHold) || hidden || hold || !seen || composing || covered;

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
    // The more sheet covers the welcome screen. The line is still inside the
    // viewport, so merely being in view would keep rotating it unseen.
    let coveredNow = false;
    const syncCovered = () => {
      const next = !!document.querySelector('[role="dialog"][aria-modal="true"]');
      if (next === coveredNow) return;
      coveredNow = next;
      setCovered(next);
    };
    const coverObs = new MutationObserver(syncCovered);
    coverObs.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('focusin', onFocus);
      coverObs.disconnect();
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

  function step(dir) {
    const next = (indexRef.current + dir + FACTS.length) % FACTS.length;
    indexRef.current = next;
    setPhase('in');
    setSide(avoidRef.current || next % 2 === 0 ? 'left' : 'right');
    setIndex(next);
  }

  function togglePin() {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setKeyHold(!pinned);
    setPinned((v) => !v);
  }

  function release() {
    setKeyHold(false);
    setPinned(false);
  }

  // A sideways swipe moves one line. A vertical drag is the page scrolling,
  // so it is left alone. The click that follows a drag must not also pin.
  function onPointerDown(e) {
    if (e.pointerType === 'mouse') return;
    const start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    const drop = () => {
      swipe.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', drop);
    };
    const ignoreClick = () => {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 400);
    };
    const move = (ev) => {
      if (ev.pointerId !== start.id || !swipe.current) return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) drop();
    };
    const up = (ev) => {
      if (ev.pointerId !== start.id || !swipe.current) return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      drop();
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      ignoreClick();
      // Left shows the next line in English, right in Hebrew — the way a
      // row of cards moves. The arrow keys point the other way, on purpose.
      step(lang === 'he' ? (dx > 0 ? 1 : -1) : (dx < 0 ? 1 : -1));
    };
    swipe.current = { id: start.id, drop };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', drop);
  }

  return (
    <div ref={slotRef} className="home-fact-slot" role="group" aria-label={t.factsLabel} data-side={side} data-pinned={pinned ? 'true' : 'false'} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {/* The hint stays off the live region. A new line is the words. */}
      {/* The words are the button. A live region would speak every line as it
          rotates, over a reader who is somewhere else on the page. Focusing
          the line reads the one that is up; arrows change it under that focus. */}
      <div className="home-fact-live">
        <button
          type="button"
          className="home-fact-btn"
          aria-pressed={pinned}
          aria-setsize={FACTS.length}
          aria-posinset={index + 1}
          aria-describedby={keyFocus ? 'home-fact-hint' : undefined}
          onClick={togglePin}
          onPointerDown={onPointerDown}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              if (!pinned) return;
              e.preventDefault();
              e.stopPropagation();
              release();
              return;
            }
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
          onFocus={() => { if (fromKeyboard.current) { setKeyFocus(true); setKeyHold(true); } }}
          onBlur={() => { setKeyFocus(false); setKeyHold(true); }}
        >
          <span ref={lineRef} className={`home-fact is-${phase} from-${motion}`}><FactWords text={text} lang={lang} /></span>
        </button>
      </div>
      <span id="home-fact-hint" className="sr-only">{pinned ? t.factsResume : t.factsPause}</span>
    </div>
  );
}
