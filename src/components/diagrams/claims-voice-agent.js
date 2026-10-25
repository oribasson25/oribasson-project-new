// Phrases from the project description and tagline only.
export const id = 'claims-voice-agent';

export const spec = {
  steps: [
    { nodes: [{ label: { en: 'Inbound voice', he: 'שיחות נכנסות' } }] },
    {
      nodes: [{
        label: { en: 'Claim intake and status inquiry', he: 'פתיחת תביעות ובירור סטטוס' },
        sub: { en: 'In Hebrew', he: 'בעברית' },
      }],
    },
    {
      nodes: [
        { label: { en: 'Validation', he: 'ולידציה' } },
        { label: { en: 'Live CRM read/write', he: 'קריאה וכתיבה חיות ב-CRM' } },
        { label: { en: 'Error recovery', he: 'שחזור משגיאות' } },
      ],
    },
  ],
};
