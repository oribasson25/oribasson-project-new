/*
 * The formatter is only needed once an answer is on screen. The welcome
 * screen does not load it. Call loadMarkdown when a question starts, or when
 * a saved conversation opens.
 */
let render = null;
let pending = null;

export function loadMarkdown() {
  if (render) return Promise.resolve(render);
  if (!pending) {
    pending = import('./markdown.js').then((m) => {
      render = m.renderMarkdown;
      return render;
    });
  }
  return pending;
}

export function renderMarkdownSync() {
  return render;
}

const HEBREW = /[\u0590-\u05FF]/;

/**
 * A safe stand-in for the moment before the formatter arrives.
 * The paragraph takes the answer's language. A Hebrew reply that opens
 * with a name would otherwise be read as English until the formatter lands.
 */
export function plainHtml(text) {
  const raw = String(text || '');
  const safe = raw.replace(/[&<>"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  }[ch]));
  const he = HEBREW.test(raw);
  const en = /[A-Za-z]/.test(raw);
  const attrs = he
    ? ' dir="rtl" lang="he" style="unicode-bidi:isolate"'
    : en
      ? ' dir="ltr" lang="en" style="unicode-bidi:isolate"'
      : '';
  return `<p${attrs}>${safe.replace(/\n/g, '<br>')}</p>`;
}
