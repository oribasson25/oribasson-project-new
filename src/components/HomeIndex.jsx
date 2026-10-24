import resume from '../../content/resume.js';
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

/** The lead skills, one quiet line, under the questions. */
export function HomeIndex({ t, lang }) {
  const tools = leadTools();
  if (!tools.length) return null;
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  return (
    <div className="home-index hero-rise" dir={dir} style={{ animationDelay: '0.58s' }}>
      {tools.length > 0 && (
        <div className="home-tools">
          <Eyebrow style={{ textAlign: 'center' }}>{t.skills}</Eyebrow>
          <a lang="en" dir="ltr" href="/resume#skills" onClick={(e) => openInApp('/resume#skills', e)}>{tools.join(' · ')}</a>
        </div>
      )}
    </div>
  );
}
