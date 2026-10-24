import projects from '../../content/projects.js';
import { tx } from '../../shared/text.js';
import { Eyebrow } from './ui.jsx';

/** Stay in the app for an ordinary click. A new tab still follows the href. */
function openInApp(href, event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** The project names, as quiet text, under the questions. No cards. */
export function HomeIndex({ t, lang }) {
  const items = (projects || []).filter((p) => p.id && tx(p.name, lang));
  if (!items.length) return null;
  return (
    <nav className="home-index hero-rise" dir={lang === 'he' ? 'rtl' : 'ltr'} aria-label={t.projectsTitle} style={{ animationDelay: '0.58s' }}>
      <Eyebrow style={{ textAlign: 'center' }}>{t.projectsTitle}</Eyebrow>
      <div className="home-index-list">
        {items.map((p) => {
          const href = `/projects#${p.id}`;
          return (
            <a key={p.id} href={href} onClick={(e) => openInApp(href, e)}>{tx(p.name, lang)}</a>
          );
        })}
      </div>
    </nav>
  );
}
