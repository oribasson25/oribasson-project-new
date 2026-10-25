import { useEffect, useRef } from 'react';
import { Icons, Eyebrow } from './ui.jsx';
import { BrandMark, ContactCard, ContactActions, LangSwitch, RecentList, ClearHistoryButton } from './Sidebar.jsx';

/* 8Legs' phone shell: a top bar, the screen, and four stops along the bottom. */

export function MobileTopBar({ t, lang, setLang, go, home }) {
  return (
    <div className="screen-only m-top" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <BrandMark lang={lang} mark={30} text={17} onClick={() => go('/')} style={{ minHeight: 44, minWidth: 44 }} />
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
 * The bottom bar as a floating capsule on the paper: an icon and a label
 * per stop, the current one on a soft grey pill.
 */
export function MobileBottomNav({ t, page, go, onMore, moreOpen }) {
  const items = [
    { id: 'chat', label: t.nav.chat, icon: Icons.chat, onClick: () => go('/') },
    { id: 'resume', label: t.nav.resume, icon: Icons.resume, onClick: () => go('/resume') },
    { id: 'projects', label: t.nav.projects, icon: Icons.projects, onClick: () => go('/projects') },
    { id: 'more', label: t.more, icon: Icons.more, onClick: onMore },
  ];
  return (
    <nav aria-label={t.mainNav} className="screen-only" style={{
      position: 'absolute', left: 14, right: 14, bottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 50,
      height: 70, padding: 6, borderRadius: 999, display: 'flex', gap: 4,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      boxShadow: '0 10px 28px rgba(13,15,20,0.10), 0 1px 2px rgba(13,15,20,0.04)',
    }}>
      {items.map((it) => {
        const on = it.id === 'more' ? moreOpen : page === it.id && !moreOpen;
        return (
          <button key={it.id} type="button" onClick={it.onClick} aria-label={it.label} title={it.label}
            aria-current={it.id !== 'more' && on ? 'page' : undefined}
            aria-expanded={it.id === 'more' ? moreOpen : undefined}
            aria-controls={it.id === 'more' ? 'more-sheet' : undefined}
            style={{
              flex: 1, borderRadius: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: on ? 'var(--bg-app)' : 'transparent', color: on ? 'var(--text)' : 'var(--text-2)',
              transition: 'background 0.18s var(--ease), color 0.18s var(--ease), box-shadow 0.18s var(--ease)',
            }}>
            <span style={{ display: 'flex', transform: 'scale(1.25)' }}>{it.icon}</span>
            <span style={{ fontSize: 10.5, fontWeight: on ? 750 : 600, lineHeight: 1, whiteSpace: 'nowrap' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function focusable(root) {
  return [...root.querySelectorAll('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
}

export function MobileSheet({ open, onClose, title, children, closeLabel = 'Close' }) {
  const dialogRef = useRef(null);
  const restoreRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = focusable(dialogRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const closeBtn = dialogRef.current?.querySelector('[data-sheet-close]');
    (closeBtn || dialogRef.current)?.focus();
    // The sheet covers the page, but the page's own scroller was still live:
    // a flick moved the welcome screen behind it. Freeze those, and let the
    // sheet keep the only one that scrolls.
    const locked = [];
    const root = dialogRef.current?.parentElement;
    if (root) {
      for (const el of root.querySelectorAll('main, main *')) {
        const oy = getComputedStyle(el).overflowY;
        if (oy !== 'auto' && oy !== 'scroll') continue;
        locked.push([el, el.style.overflowY, el.scrollTop]);
        el.style.overflowY = 'hidden';
      }
    }
    // overflow:hidden stops a finger. A script, or iOS, can still set
    // scrollTop, so the position is put back if it moves.
    const holdScroll = (e) => {
      const row = locked.find(([el]) => el === e.currentTarget);
      if (row && e.currentTarget.scrollTop !== row[2]) e.currentTarget.scrollTop = row[2];
    };
    locked.forEach(([el]) => el.addEventListener('scroll', holdScroll));
    const backdrop = root?.querySelector('[data-sheet-backdrop]');
    const stopScroll = (e) => e.preventDefault();
    backdrop?.addEventListener('touchmove', stopScroll, { passive: false });
    backdrop?.addEventListener('wheel', stopScroll, { passive: false });
    // The tab trap stops the keyboard. inert takes the rest of the page out of
    // the accessibility tree too, so a reader cannot wander behind the sheet.
    // Lift it before returning focus, or the button underneath cannot take it.
    const dialog = dialogRef.current;
    const silenced = [];
    if (root) {
      for (const child of root.children) {
        if (child === dialog || child.hasAttribute('data-sheet-backdrop')) continue;
        if (child.hasAttribute('inert')) continue;
        child.setAttribute('inert', '');
        silenced.push(child);
      }
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      locked.forEach(([el, prev]) => {
        el.removeEventListener('scroll', holdScroll);
        el.style.overflowY = prev;
      });
      backdrop?.removeEventListener('touchmove', stopScroll);
      backdrop?.removeEventListener('wheel', stopScroll);
      silenced.forEach((el) => el.removeAttribute('inert'));
      const back = restoreRef.current;
      if (back && typeof back.focus === 'function') back.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div data-sheet-backdrop="" className="screen-only" aria-hidden="true" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,15,20,0.35)', zIndex: 300 }} />
      <div ref={dialogRef} id="more-sheet" className="m-sheet fade-in screen-only" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 301, display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100dvh - 28px)', background: 'var(--bg-sidebar)', borderRadius: '22px 22px 0 0',
        borderTop: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 -12px 40px rgba(13,15,20,0.18)',
        outline: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--border)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>{title}</div>
          <button type="button" data-sheet-close onClick={onClose} aria-label={closeLabel} style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 18 }}>▾</button>
        </div>
        <div className="m-sheet-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</div>
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
    <MobileSheet open={open} onClose={onClose} title={t.recent} closeLabel={t.close}>
      <div style={{ padding: '14px 12px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          {row(Icons.plusCircle, t.newChat, onNewChat)}
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <RecentList t={t} recents={recents} activeChatId={activeChatId} onPickRecent={onPickRecent} />
          </div>
          {recents.length > 0 && (
            <ClearHistoryButton t={t} onClear={onClearHistory}
              style={{ padding: '8px 13px', minHeight: 44, background: 'transparent', fontSize: 12, fontWeight: 600, textAlign: 'start' }} />
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
