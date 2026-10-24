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

/** A safe stand-in for the moment before the formatter arrives. */
export function plainHtml(text) {
  const safe = String(text || '').replace(/[&<>"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  }[ch]));
  return `<p>${safe.replace(/\n/g, '<br>')}</p>`;
}
