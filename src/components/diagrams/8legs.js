// Phrases from the project description and highlights only.
export const id = '8legs';

export const spec = {
  groups: [
    {
      title: { en: 'Autopilot', he: 'Autopilot' },
      steps: [
        { nodes: [{ label: { en: 'Business, in plain words', he: 'עסק, במילים' } }] },
        {
          nodes: [{
            label: { en: 'Autopilot', he: 'Autopilot' },
            sub: {
              en: 'Prompt, knowledge, tables, email and channel',
              he: 'פרומפט, ידע, טבלאות, מייל וערוץ',
            },
          }],
        },
        { nodes: [{ label: { en: 'Chatbot', he: 'צ׳טבוט' } }] },
        {
          nodes: [
            { label: { en: 'Website widget', he: 'ווידג׳ט באתר' } },
            { label: { en: 'WhatsApp Business', he: 'WhatsApp Business' } },
            { label: { en: 'Tables', he: 'טבלאות' } },
            { label: { en: 'Gmail', he: 'Gmail' } },
            { label: { en: 'External systems', he: 'מערכות חיצוניות' } },
          ],
        },
      ],
    },
    {
      title: { en: 'Knowledge (RAG)', he: 'ידע (RAG)' },
      steps: [
        {
          join: false,
          nodes: [
            { label: { en: 'PDF and Word', he: 'PDF ו-Word' } },
            { label: { en: 'Whole-domain website crawl', he: 'סריקת אתר שלם' } },
          ],
        },
        {
          join: false,
          nodes: [
            { label: { en: 'Full-text search', he: 'חיפוש טקסט מלא' } },
            { label: { en: 'Hebrew–English keyword bridge', he: 'גשר מילות מפתח עברית–אנגלית' } },
          ],
        },
      ],
    },
    {
      title: { en: 'Privacy', he: 'פרטיות' },
      steps: [
        {
          nodes: [{
            label: { en: 'Card and Israeli ID numbers', he: 'כרטיס אשראי ותעודת זהות' },
            sub: { en: 'Masked before the model and the history', he: 'מוסתרים לפני המודל וההיסטוריה' },
          }],
        },
        {
          nodes: [{
            label: { en: 'Claude, GPT, or a local model through Ollama', he: 'Claude, GPT או מודל מקומי דרך Ollama' },
          }],
        },
      ],
    },
    {
      title: { en: 'Chatbots as code', he: 'צ׳טבוט כקוד' },
      steps: [
        {
          join: false,
          nodes: [
            { label: { en: 'npm CLI', he: 'CLI ב-npm' } },
            { label: { en: 'Private GitHub repo', he: 'ריפו GitHub פרטי' } },
            {
              label: { en: 'Branches and A/B tests', he: 'ענפים וניסויי A/B' },
              sub: { en: 'On live traffic', he: 'על תנועה אמיתית' },
            },
          ],
        },
      ],
    },
    {
      title: { en: 'Python tools', he: 'כלים ב-Python' },
      steps: [
        {
          join: false,
          nodes: [
            {
              label: { en: 'Python tools', he: 'כלים ב-Python' },
              sub: { en: 'Any pip package', he: 'כל חבילת pip' },
            },
            { label: { en: 'Monaco editor', he: 'עורך Monaco' } },
          ],
        },
      ],
    },
  ],
};
