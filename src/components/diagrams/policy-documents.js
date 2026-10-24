// Phrases from the project description and tagline only.
export const id = 'policy-documents';

export const spec = {
  steps: [
    { nodes: [{ label: { en: 'Chat', he: 'צ׳אט' } }] },
    { nodes: [{ label: { en: 'Identity verification', he: 'אימות זהות' } }] },
    { nodes: [{ label: { en: 'Active policies', he: 'פוליסות פעילות' } }] },
    {
      nodes: [{
        label: { en: 'Requested documentation', he: 'המסמכים המבוקשים' },
        sub: { en: 'Sent in the chat', he: 'נשלחים בצ׳אט' },
      }],
    },
  ],
};
