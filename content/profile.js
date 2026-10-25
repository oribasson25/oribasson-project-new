/*
 * Who you are. Everything on the site, and everything the chatbot knows,
 * comes from the files in this folder — edit them, push, and Vercel deploys.
 *
 * Any text field can be a plain string (shown in both languages) or
 * { en: '...', he: '...' } when the two differ.
 */
export default {
  name: { en: 'Ori Basson', he: 'אורי בסון' },

  // One line under your name.
  headline: {
    en: 'AI Solutions Engineer · Production LLM agents',
    he: 'הנדסת פתרונות AI · סוכני LLM בפרודקשן',
  },

  location: { en: 'Israel', he: 'ישראל' },

  // How the chatbot refers to you, e.g. 'he/him'. Left empty, it uses your
  // name and avoids pronouns — but Hebrew grammar still needs a gender, so
  // fill this in.
  pronouns: '',

  // 'third-person' — the chatbot is your assistant and talks about you.
  // 'first-person' — the chatbot answers as you ("I worked at…").
  voice: 'third-person',

  // Shown in the sidebar card. Leave a field empty to hide it.
  contact: {
    email: 'oribasson25@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ori-basson-616179356',
    github: '',     // full URL
    phone: '053-4281121',
    website: '',
  },

  // A PDF of your resume, placed in /public (e.g. '/cv.pdf'). Empty hides the button.
  cvPdf: '',

  // A short recorded hello, offered once to each new visitor in a bubble next
  // to Ori (browsers do not allow sound before the first tap). The files live
  // in /public; an empty `audio` hides the whole feature.
  // `transcript` is shown as captions while it plays: timed cues
  // [{ at: seconds, text }] as below, or plain text timed by sentence length.
  intro: {
    audio: { en: '/intro-en.mp3', he: '/intro-he.mp3' },
    transcript: {
      en: [
        { at: 0, text: 'Hi, my name is Ori Basson.' },
        { at: 2.84, text: 'Thanks for stopping by my profile.' },
        { at: 5.16, text: 'If you\'re looking for a creative, hard-working' },
        { at: 7.6, text: 'and results-driven individual to join your team,' },
        { at: 10.44, text: 'you\'ve come to the right place.' },
        { at: 12.34, text: 'I\'d love for you to take a look at my resume' },
        { at: 14.28, text: 'and featured projects to see what I can bring to the table.' },
        { at: 17.48, text: 'Feel free to reach out — I\'d love to connect.' },
      ],
      he: [
        { at: 0, text: 'היי, קוראים לי אורי בסון.' },
        { at: 1.9, text: 'תודה שקפצתם לבקר בפרופיל שלי.' },
        { at: 4.04, text: 'אם אתם מחפשים אדם יצירתי, חרוץ ומוכוון תוצאות' },
        { at: 7.26, text: 'להצטרפות לצוות שלכם,' },
        { at: 8.9, text: 'הגעתם למקום הנכון.' },
        { at: 10.34, text: 'אשמח שתציצו בקורות החיים שלי ובפרויקטים הבולטים שלי' },
        { at: 13.58, text: 'כדי לראות מה אני מביא למקום עבודה שאני מגיע אליו.' },
        { at: 16.58, text: 'מוזמנים ליצור איתי קשר.' },
      ],
    },
  },

  // Anything else the chatbot should know that does not fit the resume:
  // what you are looking for, availability, notice period, salary range you
  // are comfortable sharing, work style, hobbies… Plain text, any length.
  about: { en: '', he: '' },
};
