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

export function renderMarkdown(text) {
  return md.render(text || '');
}
