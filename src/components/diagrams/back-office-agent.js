// Phrases from the project description and tagline only.
export const id = 'back-office-agent';

export const spec = {
  steps: [
    { nodes: [{ label: { en: 'Incoming emails', he: 'מיילים נכנסים' } }] },
    { nodes: [{ label: { en: 'Multi-modal LLM + OCR', he: 'LLM מולטי-מודאלי + OCR' } }] },
    {
      nodes: [
        {
          label: { en: 'Claim folders', he: 'תיקי התביעה' },
          sub: { en: 'Documents extracted and filed', he: 'מסמכים מחולצים ומתויקים' },
        },
        { label: { en: 'Status queries', he: 'בירורי סטטוס' } },
        {
          label: { en: 'Structured tasks', he: 'משימות מובנות' },
          sub: { en: 'Core systems', he: 'מערכות הליבה' },
        },
      ],
    },
  ],
};
