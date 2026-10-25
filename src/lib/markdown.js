import MarkdownIt from 'markdown-it';

/*
 * Answers are light Markdown. Raw HTML is off, so whatever the model writes is
 * escaped rather than run; markdown-it also refuses javascript: links. Links
 * open in a new tab so a recruiter never loses the conversation.
 */
const md = new MarkdownIt({ html: false, linkify: true, breaks: true, typographer: false });

const defaultLink = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return defaultLink(tokens, idx, options, env, self);
};

const defaultClose = md.renderer.rules.link_close || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

function escapeText(value) {
  return String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

// The visible link text stays as the model wrote it. The note is only for
// someone who cannot see that the link leaves the conversation.
md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
  const note = env && env.newTab ? String(env.newTab).trim() : '';
  const extra = note ? `<span class="sr-only"> ${escapeText(note)}</span>` : '';
  return extra + defaultClose(tokens, idx, options, env, self);
};

const HEBREW = /[\u0590-\u05FF]/;

/** The words between an open token and its close. */
function blockText(tokens, from, until) {
  let text = '';
  for (let i = from; i < until; i++) {
    const token = tokens[i];
    if (token.children) {
      for (const child of token.children) text += child.content || '';
    } else text += token.content || '';
  }
  return text;
}

/**
 * A Hebrew answer often opens with a project name. Plaintext would call that
 * paragraph English, and the Hebrew after the name would run backwards.
 */
function stampBlock(token, text) {
  if (HEBREW.test(text)) {
    token.attrSet('dir', 'rtl');
    token.attrSet('lang', 'he');
  } else if (/[A-Za-z]/.test(text)) {
    token.attrSet('dir', 'ltr');
    token.attrSet('lang', 'en');
  } else return;
  token.attrJoin('style', 'unicode-bidi:isolate');
}

md.core.ruler.push('block_dir', (state) => {
  const pairs = [
    ['paragraph_open', 'paragraph_close'],
    ['bullet_list_open', 'bullet_list_close'],
    ['ordered_list_open', 'ordered_list_close'],
    ['list_item_open', 'list_item_close'],
    ['heading_open', 'heading_close'],
    ['blockquote_open', 'blockquote_close'],
  ];
  const tokens = state.tokens;
  for (const [open, close] of pairs) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== open) continue;
      let depth = 1;
      let j = i + 1;
      for (; j < tokens.length; j++) {
        if (tokens[j].type === open) depth += 1;
        else if (tokens[j].type === close) {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      stampBlock(tokens[i], blockText(tokens, i + 1, j));
    }
  }
});

export function renderMarkdown(text, env) {
  return md.render(text || '', env || {});
}
