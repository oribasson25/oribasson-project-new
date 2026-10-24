/*
 * Your resume. The Resume page renders it, and the chatbot answers from it.
 * Text fields take a string or { en, he }; list fields take an array or
 * { en: [...], he: [...] }. A highlight is a string, or { title, text } for a
 * bold lead-in.
 */
export default {
  summary: {
    en: 'I build end-to-end production LLM agent architectures, tool/function calling integrations, CRM and API connections, and evaluation pipelines that ensure reliability under live traffic. Skilled in TypeScript, Python, and SQL for agent tooling and data grounding. I own features from business requirements to go-live with clear success metrics and Human-in-the-Loop (HITL) boundaries. Having previously supervised claims call center operations, I bring deep domain insight into workflows, risk boundaries, and critical decision points.',
    he: 'בנייה מקצה לקצה של ארכיטקטורות סוכני LLM בפרודקשן, אינטגרציות tool/function calling, חיבורי CRM ו-API, ו-pipelines של הערכה (evals) ששומרים על אמינות תחת תעבורה חיה. שליטה ב-TypeScript, ‏Python ו-SQL לבניית כלים לסוכנים ולעיגון בנתונים. הובלת פיצ׳רים מהדרישות העסקיות ועד העלייה לאוויר, עם מדדי הצלחה ברורים וגבולות Human-in-the-Loop ‏(HITL). ניסיון קודם בפיקוח על מוקד שירות תביעות מביא היכרות עמוקה עם תהליכי העבודה, גבולות הסיכון ונקודות ההחלטה הקריטיות.',
  },

  experience: [
    {
      company: { en: 'Libra Insurance', he: 'ליברה ביטוח' },
      role: { en: 'AI Solutions Engineering + AI Project Management', he: 'הנדסת פתרונות AI וניהול פרויקטי AI' },
      start: '2024',
      end: '',
      highlights: {
        en: [
          { title: 'Production Hebrew Voice & Chat Agents', text: 'Engineered agents integrated directly into core insurance systems and live customer traffic.' },
          { title: 'Multi-Agent System Architecture', text: 'Designed system prompts, multi-step reasoning, cross-turn state management, and robust error recovery in production environments.' },
          { title: 'Custom Tooling & Function Calling', text: 'Developed agent tools in TypeScript with function calling, live CRM read/write actions, customer authentication, and state persistence.' },
          { title: 'Automated Eval & QA Pipelines', text: 'Built LLM-as-judge classifiers, Hebrew tagging rubrics, transcript scoring, and quality dashboards for business stakeholders.' },
          { title: 'API Reverse-Engineering', text: 'Reverse-engineered undocumented CRM APIs from network traffic into structured specs and Postman collections, unblocking integrations.' },
          { title: 'Roadmap & Requirement Ownership', text: 'Mapped workflow candidates by volume/cost/feasibility, defined success metrics, and established HITL boundaries prior to development.' },
          { title: 'Production Incident Debugging', text: 'Resolved cross-stack issues (WebSocket audio/ASR, reporting discrepancies) and guided agents from pilot to full live launch with engineering, IT, cybersecurity, SOC, and ops teams.' },
        ],
        he: [
          { title: 'סוכני קול וצ׳אט בעברית בפרודקשן', text: 'פיתוח סוכנים שמשולבים ישירות במערכות הליבה של הביטוח ובתעבורת לקוחות חיה.' },
          { title: 'ארכיטקטורת Multi-Agent', text: 'תכנון system prompts, חשיבה רב-שלבית, ניהול state בין תורות בשיחה ושחזור עמיד משגיאות בסביבות פרודקשן.' },
          { title: 'כלים ייעודיים ו-Function Calling', text: 'פיתוח כלים לסוכנים ב-TypeScript עם function calling, פעולות קריאה וכתיבה חיות ב-CRM, אימות לקוחות ושמירת state.' },
          { title: 'תהליכי Eval ו-QA אוטומטיים', text: 'בניית מסווגי LLM-as-judge, רובריקות תיוג בעברית, ניקוד תמלולים ודשבורדים של איכות לבעלי העניין העסקיים.' },
          { title: 'הנדסה לאחור של APIs', text: 'פענוח APIs לא מתועדים של ה-CRM מתוך תעבורת הרשת לכדי מפרטים מסודרים ו-Postman collections, שפתחו חסמי אינטגרציה.' },
          { title: 'בעלות על ה-Roadmap והדרישות', text: 'מיפוי תהליכים מועמדים לפי נפח, עלות והיתכנות, הגדרת מדדי הצלחה וקביעת גבולות HITL לפני תחילת הפיתוח.' },
          { title: 'דיבאג תקלות פרודקשן', text: 'פתרון תקלות חוצות-stack (אודיו ב-WebSocket ו-ASR, פערי דיווח) וליווי סוכנים מפיילוט ועד עלייה מלאה לאוויר, יחד עם צוותי פיתוח, IT, סייבר, SOC ותפעול.' },
        ],
      },
      tech: ['TypeScript', 'Python', 'SQL', 'Function calling', 'CRM', 'MCP', 'Postman'],
    },
    {
      company: { en: 'Libra Insurance', he: 'ליברה ביטוח' },
      role: { en: 'Claims Call Center Shift Supervisor', he: 'ניהול משמרת במוקד שירות תביעות' },
      start: '2023',
      end: '2024',
      summary: {
        en: 'The operational foundation behind every agent above. Supervised the daily workflow that the AI platform now automates.',
        he: 'הבסיס התפעולי שמאחורי כל הסוכנים שלמעלה: פיקוח על תהליך העבודה היומי שפלטפורמת ה-AI מבצעת היום אוטומטית.',
      },
      highlights: {
        en: [
          'Ran daily claims call center operations, trained representatives, and handled escalated customer cases.',
          'Learned the claim lifecycle, regulatory constraints, and real failure points from inside the process to ensure built agents fit actual business operations.',
          'Maintained direct working relationships across operations and claims teams, shortening requirement gathering and easing internal agent adoption.',
        ],
        he: [
          'ניהול התפעול היומי של מוקד התביעות, הכשרת נציגים וטיפול בפניות לקוחות שהוסלמו.',
          'היכרות מבפנים עם מחזור החיים של תביעה, המגבלות הרגולטוריות ונקודות הכשל האמיתיות — כדי שהסוכנים ייבנו לפי התפעול העסקי בפועל.',
          'קשרי עבודה ישירים עם צוותי התפעול והתביעות, שקיצרו את איסוף הדרישות והקלו על אימוץ הסוכנים בארגון.',
        ],
      },
    },
    {
      company: { en: 'Military Service (IDF)', he: 'שירות צבאי (צה״ל)' },
      role: { en: 'Network Administrator', he: 'ניהול רשתות' },
      start: '2023',
      end: '2023',
      highlights: {
        en: [
          'Active Directory administration, user provisioning, and permission management.',
          'Installation and configuration of Cisco network equipment, telephony systems, meeting rooms, and end-user workstations.',
        ],
        he: [
          'ניהול Active Directory, הקמת משתמשים וניהול הרשאות.',
          'התקנה והגדרה של ציוד רשת Cisco, מערכות טלפוניה, חדרי ישיבות ועמדות קצה.',
        ],
      },
    },
  ],

  education: [
    {
      degree: { en: 'Cybersecurity Implementation, Professional Certification', he: 'הסמכה מקצועית ביישום סייבר' },
      school: { en: 'Kernelios College', he: 'מכללת Kernelios' },
      location: { en: 'Israel', he: 'ישראל' },
      details: {
        en: 'Network security architecture, segmentation and traffic filtering, endpoint hardening, log analysis, and identity and access management (IAM) including Active Directory security policy and GPO hardening.',
        he: 'ארכיטקטורת אבטחת רשתות, סגמנטציה וסינון תעבורה, הקשחת עמדות קצה, ניתוח לוגים וניהול זהויות והרשאות (IAM), כולל מדיניות אבטחה ב-Active Directory והקשחת GPO.',
      },
    },
  ],

  skills: [
    { group: { en: 'Agents & LLMs', he: 'סוכנים ו-LLMs' }, items: ['Voice & Chat agents (Hebrew)', 'Tool / Function Calling', 'System Prompts', 'Multi-Agent Systems'] },
    { group: { en: 'Languages & Code', he: 'שפות וקוד' }, items: ['TypeScript', 'Python', 'SQL'] },
    { group: { en: 'Integrations & Protocols', he: 'אינטגרציות ופרוטוקולים' }, items: ['CRM Integrations', 'Reverse-Engineering APIs', 'Model Context Protocol (MCP)', 'Postman'] },
    { group: { en: 'Eval & QA Pipelines', he: 'Eval ו-QA' }, items: ['LLM-as-judge Classifiers', 'Hebrew Tagging Rubrics', 'Transcript Scoring', 'Quality Dashboards'] },
    { group: { en: 'Infrastructure & Networking', he: 'תשתיות ורשתות' }, items: ['Active Directory', 'Windows Server', 'Cisco Networking', 'Telephony Fundamentals'] },
    { group: { en: 'Cybersecurity', he: 'סייבר' }, items: ['Endpoint Hardening', 'IAM', 'GPO Security Policies', 'Log Analysis'] },
  ],

  languages: [
    { name: { en: 'Hebrew', he: 'עברית' }, level: { en: 'Native', he: 'שפת אם' } },
    { name: { en: 'English', he: 'אנגלית' }, level: { en: 'Professional working proficiency', he: 'רמה מקצועית' } },
  ],

  // { name, issuer, year, url }
  certifications: [],
};
