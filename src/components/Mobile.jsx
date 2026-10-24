import { useEffect } from 'react';
import { Icons, Eyebrow } from './ui.jsx';
import { BrandMark, ContactCard, ContactActions, LangSwitch, RecentList } from './Sidebar.jsx';

/* 8Legs' phone shell: a top bar, the screen, and four stops along the bottom. */

export function MobileTopBar({ t, lang, setLang, go, home }) {
  return (
    <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <BrandMark lang={lang} mark={30} text={17} onClick={() => go('/')} />
      </div>
      {home && <ContactActions t={t} compact />}
      <LangSwitch lang={lang} setLang={setLang} />
    </div>
  );
}

/* The space the floating bar takes at the bottom of the screen, so content
   can end above it. */
export const NAV_SPACE = 'calc(92px + env(safe-area-inset-bottom))';

/**
 * The bottom bar as a floating capsule: frosted white over the page, an icon
 * and a label per stop, the current one on a soft grey pill. Content scrolls
 * underneath it.
 */
export function MobileBottomNav({ t, page, go, onMore, moreOpen }) {
  const items = [
    { id: 'chat', label: t.nav.chat, icon: Icons.chat, onClick: () => go('/') },
    { id: 'resume', label: t.nav.resume, icon: Icons.resume, onClick: () => go('/resume') },
    { id: 'projects', label: t.nav.projects, icon: Icons.projects, onClick: () => go('/projects') },
    { id: 'more', label: t.more, icon: Icons.more, onClick: onMore },
  ];
  return (
    <nav aria-label="Main" style={{
      position: 'absolute', left: 14, right: 14, bottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 50,
      height: 70, padding: 6, borderRadius: 999, display: 'flex', gap: 4,
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(20px) saturate(1.6)', WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
      border: '1px solid rgba(13,15,20,0.06)',
      boxShadow: '0 10px 30px rgba(13,15,20,0.14), 0 1px 3px rgba(13,15,20,0.06)',
    }}>
      {items.map((it) => {
        const on = it.id === 'more' ? moreOpen : page === it.id && !moreOpen;
        return (
          <button key={it.id} type="button" onClick={it.onClick} aria-label={it.label} title={it.label}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1, borderRadius: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: on ? 'rgba(13,15,20,0.07)' : 'transparent', color: on ? 'var(--text)' : 'var(--text-2)',
              transition: 'background 0.18s',
            }}>
            <span style={{ display: 'flex', transform: 'scale(1.25)' }}>{it.icon}</span>
            <span style={{ fontSize: 10.5, fontWeight: on ? 750 : 600, lineHeight: 1, whiteSpace: 'nowrap' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,15,20,0.35)', zIndex: 300 }} />
      <div className="m-sheet fade-in" role="dialog" aria-label={title} style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 301, display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100dvh - 28px)', background: 'var(--bg-sidebar)', borderRadius: '22px 22px 0 0',
        borderTop: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 -12px 40px rgba(13,15,20,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--border)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 18 }}>▾</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</div>
      </div>
    </>
  );
}

/** Everything the desktop sidebar holds beyond the three pages. */
export function MobileMore({ t, open, onClose, recents, activeChatId, onPickRecent, onNewChat, onClearHistory, admin, go, onSignOut }) {
  const row = (icon, label, onClick, danger) => (
    <button type="button" onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: danger ? 'var(--danger)' : 'var(--text)', textAlign: 'start' }}>
      <span style={{ display: 'flex', color: danger ? 'var(--danger)' : 'var(--text-muted)' }}>{icon}</span>{label}
    </button>
  );
  return (
    <MobileSheet open={open} onClose={onClose} title={t.recent}>
      <div style={{ padding: '14px 12px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          {row(Icons.plusCircle, t.newChat, onNewChat)}
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <RecentList t={t} recents={recents} activeChatId={activeChatId} onPickRecent={onPickRecent} />
          </div>
          {recents.length > 0 && (
            <button type="button" onClick={onClearHistory} style={{ padding: '8px 13px', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{t.clearHistory}</button>
          )}
        </div>
        <ContactCard t={t} />
        {admin ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Eyebrow style={{ padding: '0 4px' }}>{t.adminEyebrow}</Eyebrow>
            {row(Icons.settings, t.nav.settings, () => go('/admin/settings'))}
            {row(Icons.inbox, t.nav.conversations, () => go('/admin/conversations'))}
            {row(Icons.logout, t.signOut, onSignOut, true)}
          </div>
        ) : (
          row(Icons.shield, t.adminSignIn, () => go('/admin'))
        )}
      </div>
    </MobileSheet>
  );
}
