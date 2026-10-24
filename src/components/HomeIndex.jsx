import projects from '../../content/projects.js';
import resume from '../../content/resume.js';
import { tx } from '../../shared/text.js';
import { Eyebrow } from './ui.jsx';

/** Stay in the app for an ordinary click. A new tab still follows the href. */
function openInApp(href, event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * The two groups the resume leads with. The labels are published in English
 * for both languages, the same way the resume prints them.
 */
function leadTools() {
  return (resume.skills || []).slice(0, 2).flatMap((g) => g.items || []).filter(Boolean);
}

/** The project names, as quiet text, under the questions. No cards. */
export function HomeIndex({ t, lang }) {
  const items = (projects || []).filter((p) => p.id && tx(p.name, lang));
  const tools = leadTools();
  if (!items.length && !tools.length) return null;
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  return (
    <div className="home-index hero-rise" dir={dir} style={{ animationDelay: '0.58s' }}>
      {items.length > 0 && (
        <nav aria-label={t.projectsTitle}>
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
      )}
      {tools.length > 0 && (
        <div className="home-tools">
          <Eyebrow style={{ textAlign: 'center' }}>{t.skills}</Eyebrow>
          <a dir="ltr" href="/resume#skills" onClick={(e) => openInApp('/resume#skills', e)}>{tools.join(' · ')}</a>
        </div>
      )}
    </div>
  );
}
