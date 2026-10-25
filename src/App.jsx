import { useEffect, useRef, useState } from 'react';
import { strings } from './i18n.js';
import { usePath, useIsMobile, useViewportHeight, useTyping, useReducedMotion } from './lib/hooks.js';
import { useSeo } from './lib/seo.js';
import { savedLang, saveLang, loadChats, clearChats } from './lib/store.js';
import { useChat } from './lib/useChat.js';
import { Crumbs } from './components/ui.jsx';
import { Sidebar, LangToggle, ContactActions } from './components/Sidebar.jsx';
import { HomeChat } from './components/HomeChat.jsx';
import { ResumeView } from './components/ResumeView.jsx';
import { ProjectsView } from './components/ProjectsView.jsx';
import { AdminLogin } from './components/AdminLogin.jsx';
import { AdminSettings } from './components/AdminSettings.jsx';
import { AdminConversations } from './components/AdminConversations.jsx';
import { PetWatermark } from './components/Pet.jsx';
import { MobileTopBar, MobileBottomNav, MobileMore, NAV_SPACE } from './components/Mobile.jsx';
import { NotFound } from './components/NotFound.jsx';

/** Said once, after a change. The first paint already has a language. */
function LangLive({ lang }) {
  const ready = useRef(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!ready.current) { ready.current = true; return; }
    setMsg(lang === 'he' ? 'עברית' : 'English');
  }, [lang]);
  return <div className="sr-only" aria-live="polite" lang={lang === 'he' ? 'he' : 'en'}>{msg}</div>;
}

const PAGES = {
  '/': 'chat',
  '/resume': 'resume',
  '/projects': 'projects',
  '/admin': 'login',
  '/admin/settings': 'settings',
  '/admin/conversations': 'conversations',
};
const ADMIN_PAGES = new Set(['settings', 'conversations']);

export default function App() {
  const [lang, setLangState] = useState(savedLang);
  const t = strings(lang);
  const [path, go, hash] = usePath();
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  useViewportHeight(mobile);
  const typing = useTyping(mobile);
  const [admin, setAdmin] = useState(null);           // null until the server has answered
  const [status, setStatus] = useState({ chat: 'unknown', model: null });
  const [recents, setRecents] = useState(loadChats);
  const [seed, setSeed] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const chat = useChat({ lang, onSaved: setRecents });

  const setLang = (next) => { setLangState(next); saveLang(next); };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-ui-lang', lang);
  }, [lang]);

  function refreshStatus() {
    fetch('/api/status').then((r) => r.json()).then(setStatus).catch(() => setStatus({ chat: 'unavailable', model: null }));
  }
  useEffect(() => {
    refreshStatus();
    fetch('/api/admin/me').then((r) => r.json()).then((b) => setAdmin(!!b.admin)).catch(() => setAdmin(false));
  }, []);

  let page = PAGES[path.replace(/\/+$/, '') || '/'] || 'missing';
  if (page === 'login' && admin) page = 'settings';
  const needsLogin = page === 'login' || (ADMIN_PAGES.has(page) && admin === false);

  useSeo(page, lang);
  // /admin, once signed in, is the settings screen — keep the address honest.
  useEffect(() => { if (path === '/admin' && admin) go('/admin/settings'); }, [path, admin]);
  useEffect(() => { setMoreOpen(false); }, [path]);
  // A new page starts at the top. The shell keeps one scroller, so the previous page's position would otherwise stick.
  // After a button opened the page, the keyboard follows it. A text field keeps focus, so "ask about this" still lands in the composer.
  const firstPage = useRef(true);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;
    const target = hash ? main.querySelector(`[id="${CSS.escape(hash)}"]`) : null;
    // No reset first: on a phone the same scroller carries the previous page,
    // and jumping to the top before the glide made the link feel like two moves.
    if (target) target.scrollIntoView({ block: 'start', behavior: reducedRef.current ? 'auto' : 'smooth' });
    else {
      main.scrollTop = 0;
      main.querySelector('[data-scroller]')?.scrollTo(0, 0);
    }
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    const el = document.activeElement;
    const field = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
    if (field) return;
    if (target) {
      const heading = target.querySelector('h1, h2, h3') || target;
      if (heading.tabIndex < 0) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      return;
    }
    if (el && el.tagName === 'BUTTON') main.focus({ preventScroll: true });
  }, [page, hash]);

  function ask(text) {
    go('/');
    setSeed((s) => ({ text, n: (s ? s.n : 0) + 1 }));
  }
  function newChat() { chat.reset(); go('/'); setMoreOpen(false); }
  function pickRecent(c) { chat.open(c); go('/'); setMoreOpen(false); }
  function clearHistory() { setRecents(clearChats()); chat.reset(); }
  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setAdmin(false);
    go('/');
  }
  const onUnauthorized = () => { setAdmin(false); go('/admin'); };

  if (needsLogin) {
    if (admin === null) return null;   // a moment while the session is checked
    return (
      <>
        <LangLive lang={lang} />
        <AdminLogin t={t} lang={lang} setLang={setLang} mobile={mobile}
          onSignedIn={() => { setAdmin(true); go(ADMIN_PAGES.has(page) ? path : '/admin/settings'); }}
          onBack={() => go('/')} />
      </>
    );
  }
  if (ADMIN_PAGES.has(page) && admin === null) return null;

  const view = (stacked) => {
    switch (page) {
      case 'resume': return <ResumeView t={t} lang={lang} onAsk={ask} onOpenChat={() => go('/')} stacked={stacked} />;
      case 'projects': return <ProjectsView t={t} lang={lang} onAsk={ask} onOpenChat={() => go('/')} stacked={stacked} hash={hash} />;
      case 'settings': return <AdminSettings t={t} lang={lang} onUnauthorized={onUnauthorized} onChanged={refreshStatus} stacked={stacked} />;
      case 'conversations': return <AdminConversations t={t} lang={lang} onUnauthorized={onUnauthorized} stacked={stacked} />;
      case 'missing': return <NotFound t={t} lang={lang} stacked={stacked} onOpenChat={() => go('/')} />;
      default: return null;
    }
  };
  const home = (stacked) => (
    <HomeChat t={t} lang={lang} chat={chat} status={status} stacked={stacked}
      seed={seed} onSeedUsed={() => setSeed(null)} />
  );

  if (mobile) {
    const title = page === 'chat' ? null : page === 'missing' ? t.notFoundTitle : (t.nav[page] || '');
    // Room under the content for the floating bar — none while it is hidden for the keyboard.
    const navSpace = typing ? '0px' : NAV_SPACE;
    return (
      <div className="m-root m-app" style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)', overflow: 'hidden' }}>
        <LangLive lang={lang} />
        <a href="#main" className="skip-link">{t.skip}</a>
        <MobileTopBar t={t} lang={lang} setLang={setLang} go={go} home={page === 'chat'} />
        {page === 'chat' ? (
          <main id="main" tabIndex={-1} style={{ flex: 1, minHeight: 0, display: 'flex', paddingBottom: navSpace }}>{home(true)}</main>
        ) : (
          <main id="main" tabIndex={-1} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: `18px 14px calc(28px + ${navSpace})` }}>
            {title && <h1 className="page-title" dir="auto">{title}</h1>}
            <div key={page} className="page-in">{view(true)}</div>
          </main>
        )}
        {/* While the keyboard is up the bottom bar would only take room from the conversation. */}
        {!typing && <MobileBottomNav t={t} page={page} go={go} onMore={() => setMoreOpen(true)} moreOpen={moreOpen} />}
        <MobileMore t={t} open={moreOpen} onClose={() => setMoreOpen(false)} recents={recents}
          activeChatId={chat.messages.length ? chat.chatId : null} onPickRecent={pickRecent}
          onNewChat={newChat} onClearHistory={clearHistory} admin={admin} go={go} onSignOut={signOut} />
      </div>
    );
  }

  const section = ADMIN_PAGES.has(page) ? t.adminEyebrow : t.portfolio;
  const crumb = page === 'missing' ? t.notFoundTitle : t.nav[page];
  return (
    <div style={{ display: 'flex', height: 'calc(100vh / var(--ui-zoom))', overflow: 'hidden', position: 'relative' }}>
      <LangLive lang={lang} />
      <a href="#main" className="skip-link">{t.skip}</a>
      <Sidebar t={t} lang={lang} page={page} go={go} recents={recents}
        activeChatId={chat.messages.length ? chat.chatId : null}
        onPickRecent={pickRecent} onNewChat={newChat} onClearHistory={clearHistory}
        admin={admin} onSignOut={signOut} />
      <main id="main" tabIndex={-1} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <Crumbs trail={[section, crumb]} right={(
          <>
            {page === 'chat' && <ContactActions t={t} />}
            <LangToggle lang={lang} setLang={setLang} />
          </>
        )} />
        {page === 'chat' ? home(false) : (
          <div data-scroller style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
            <PetWatermark size={560} style={{ bottom: -70, right: -40 }} />
            <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%', padding: '30px 34px 80px', position: 'relative' }}>
              <div key={page} className="page-in">{view(false)}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
