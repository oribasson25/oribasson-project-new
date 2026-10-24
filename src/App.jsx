import { useEffect, useState } from 'react';
import { strings } from './i18n.js';
import { usePath, useIsMobile, useViewportHeight, useTyping } from './lib/hooks.js';
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
  const [path, go] = usePath();
  const mobile = useIsMobile();
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

  let page = PAGES[path.replace(/\/+$/, '') || '/'] || 'chat';
  if (page === 'login' && admin) page = 'settings';
  const needsLogin = page === 'login' || (ADMIN_PAGES.has(page) && admin === false);

  useSeo(page, lang);
  useEffect(() => {
    document.documentElement.classList.toggle('is-home', page === 'chat' && chat.messages.length === 0);
  }, [page, chat.messages.length]);

  // /admin, once signed in, is the settings screen — keep the address honest.
  useEffect(() => { if (path === '/admin' && admin) go('/admin/settings'); }, [path, admin]);
  useEffect(() => { setMoreOpen(false); }, [path]);

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
      <AdminLogin t={t} lang={lang} setLang={setLang} mobile={mobile}
        onSignedIn={() => { setAdmin(true); go(ADMIN_PAGES.has(page) ? path : '/admin/settings'); }}
        onBack={() => go('/')} />
    );
  }
  if (ADMIN_PAGES.has(page) && admin === null) return null;

  const view = (stacked) => {
    switch (page) {
      case 'resume': return <ResumeView t={t} lang={lang} onAsk={ask} onOpenChat={() => go('/')} stacked={stacked} />;
      case 'projects': return <ProjectsView t={t} lang={lang} onAsk={ask} onOpenChat={() => go('/')} stacked={stacked} />;
      case 'settings': return <AdminSettings t={t} lang={lang} onUnauthorized={onUnauthorized} onChanged={refreshStatus} stacked={stacked} />;
      case 'conversations': return <AdminConversations t={t} lang={lang} onUnauthorized={onUnauthorized} stacked={stacked} />;
      default: return null;
    }
  };
  const welcome = page === 'chat' && chat.messages.length === 0;
  const home = (stacked) => (
    <HomeChat t={t} lang={lang} chat={chat} status={status} stacked={stacked}
      seed={seed} onSeedUsed={() => setSeed(null)}
      toolbar={!stacked && (
        <>
          <ContactActions t={t} onDark />
          <LangToggle lang={lang} setLang={setLang} />
        </>
      )} />
  );

  if (mobile) {
    const title = page === 'chat' ? null : (t.nav[page] || '');
    // Room under the content for the floating bar — none while it is hidden for the keyboard.
    const navSpace = typing ? '0px' : NAV_SPACE;
    return (
      <div className="m-root m-app" style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: welcome ? '#07080d' : 'var(--bg-app)', overflow: 'hidden' }}>
        <a href="#main" className="skip-link">{t.skip}</a>
        <MobileTopBar t={t} lang={lang} setLang={setLang} go={go} home={page === 'chat'} onDark={welcome} />
        {page === 'chat' ? (
          <main id="main" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingBottom: navSpace, background: welcome ? '#07080d' : 'transparent' }}>{home(true)}</main>
        ) : (
          <main id="main" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: `18px 14px calc(28px + ${navSpace})` }}>
            {title && page !== 'projects' && page !== 'resume' && <div dir="auto" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>{title}</div>}
            {view(true)}
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
  return (
    <div style={{ display: 'flex', height: 'calc(100vh / var(--ui-zoom))', overflow: 'hidden', position: 'relative' }}>
      <a href="#main" className="skip-link">{t.skip}</a>
      <Sidebar t={t} lang={lang} page={page} go={go} recents={recents}
        activeChatId={chat.messages.length ? chat.chatId : null}
        onPickRecent={pickRecent} onNewChat={newChat} onClearHistory={clearHistory}
        admin={admin} onSignOut={signOut} />
      <main id="main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: welcome ? '#07080d' : 'var(--bg-app)' }}>
        {!welcome && <Crumbs trail={[section, t.nav[page]]} right={(
          <>
            {page === 'chat' && <ContactActions t={t} />}
            <LangToggle lang={lang} setLang={setLang} />
          </>
        )} />}
        {page === 'chat' ? home(false) : (
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
            <PetWatermark size={560} style={{ bottom: -70, right: -40 }} />
            <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%', padding: '30px 34px 80px', position: 'relative' }}>
              {view(false)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
