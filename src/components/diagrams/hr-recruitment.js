// Phrases from the project description and highlights only.
export const id = 'hr-recruitment';

export const spec = {
  steps: [
    {
      nodes: [{
        label: { en: 'Batch of resumes', he: 'כמה קורות חיים בבת אחת' },
        sub: { en: 'PDF and Word, Hebrew and English', he: 'PDF ו-Word, עברית ואנגלית' },
      }],
    },
    { nodes: [{ label: { en: 'Text extraction', he: 'חילוץ טקסט' } }] },
    {
      nodes: [{
        label: { en: 'Score vs every open job', he: 'ציון מול כל משרה פתוחה' },
        sub: { en: 'A short explanation of the score', he: 'הסבר קצר לציון' },
      }],
    },
    {
      nodes: [{
        label: { en: 'Match history', he: 'היסטוריית התאמות' },
        sub: { en: 'Color-coded by fit', he: 'צבע לפי רמת ההתאמה' },
      }],
    },
    {
      join: false,
      nodes: [
        { label: { en: 'Jobs and candidates', he: 'משרות ומועמדים' } },
        {
          label: { en: 'Drag-and-drop Kanban', he: 'Kanban עם גרירה' },
          sub: {
            en: 'CV received, interview, offer, hired, rejected, ghosted or withdrew',
            he: 'מקבלת קו״ח, דרך ראיון והצעה, עד גיוס, דחייה, היעלמות או חזרה',
          },
        },
      ],
    },
    {
      join: false,
      nodes: [
        { label: { en: 'Resume library', he: 'מאגר קורות חיים' } },
        {
          label: { en: 'Candidate notes, interview summaries and ratings', he: 'הערות, סיכומי ראיונות ודירוג' },
          sub: { en: 'Reminders and Excel export', he: 'תזכורות וייצוא לאקסל' },
        },
      ],
    },
  ],
};
