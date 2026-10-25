import { useEffect, useState } from 'react';
import profile from '../../content/profile.js';
import { tx } from '../../shared/text.js';
import { strings } from '../i18n.js';
import { Icons, Eyebrow, SegTabs, Btn } from './ui.jsx';
import { Pet } from './Pet.jsx';
import { chatTitle } from '../lib/store.js';

/** The lock-up: the face in its badge, then the name. */
export function BrandMark({ lang, mark = 34, text = 19, onClick, style }) {
  const [first, ...rest] = tx(profile.name, lang).split(' ');
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, maxWidth: '100%', background: 'transparent', padding: 0, textAlign: 'start', ...style }}>
      <div style={{
        width: mark, height: mark, borderRadius: 11, flexShrink: 0, overflow: 'hidden',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}>
        <Pet crop="head" size={mark - 4} decorative />
      </div>
      {/* The global Hebrew rule makes every span its own bidi island, which
          leaves this line with no strong letter of its own: it falls back to
          left-to-right and reads "בסון אורי". The line takes the language's
          direction and the two parts stay in it. */}
      <div dir={lang === 'he' ? 'rtl' : 'ltr'} style={{ fontSize: text, fontWeight: 800, letterSpacing: '-0.03em', whiteSpace: 'nowrap', unicodeBidi: 'isolate', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ color: 'var(--text)', unicodeBidi: 'normal' }}>{first}</span>
        {rest.length > 0 && <>{' '}<span style={{ color: 'var(--text-muted)', unicodeBidi: 'normal' }}>{rest.join(' ')}</span></>}
      </div>
    </button>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined}
      className="nav-btn" data-on={active ? 'true' : 'false'}>
      <span className="nav-ico">{icon}</span>
      {label}
    </button>
  );
}

/** 053… is the Israeli number visitors read. The link dials it with the country code. */
function telHref(v) {
  const digits = String(v || '').replace(/[^\d]/g, '');
  if (!digits) return 'tel:';
  return `tel:${digits.startsWith('0') ? `+972${digits.slice(1)}` : `+${digits}`}`;
}

const CONTACT_ROWS = [
  { key: 'email', icon: Icons.mail, href: (v) => `mailto:${v}`, label: (v) => v },
  { key: 'linkedin', icon: Icons.linkedin, href: (v) => v, label: () => 'LinkedIn' },
  { key: 'github', icon: Icons.github, href: (v) => v, label: () => 'GitHub' },
  { key: 'phone', icon: Icons.phone, href: telHref, label: (v) => v },
  { key: 'website', icon: Icons.globe, href: (v) => v, label: (v) => v.replace(/^https?:\/\//, '').replace(/\/$/, '') },
];

/** Where 8Legs keeps its runtime card: how to reach Ori, always in view. */
export function ContactCard({ t }) {
  const c = profile.contact || {};
  const rows = CONTACT_ROWS.filter((r) => c[r.key]);
  return (
    <div style={{ padding: '13px 14px 12px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <Eyebrow style={{ fontSize: 9.5, marginBottom: 8 }}>{t.contact}</Eyebrow>
      {rows.length === 0 && !profile.cvPdf && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.contactEmpty}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map((r) => (
          <a key={r.key} href={r.href(c[r.key])} target={r.key === 'email' || r.key === 'phone' ? undefined : '_blank'} rel="noopener noreferrer"
            className="contact-row"
            title={r.key === 'email' || r.key === 'phone' ? r.label(c[r.key]) : c[r.key]}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', minWidth: 0 }}>
            <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-muted)' }}>{r.icon}</span>
            {/* The address is Latin. On a Hebrew page the voice for the row would otherwise read it. */}
            <span lang="en" dir="ltr" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label(c[r.key])}</span>
            {r.key !== 'email' && r.key !== 'phone' && <span className="sr-only">{t.newTab}</span>}
          </a>
        ))}
      </div>
      {profile.cvPdf && (
        <a href={profile.cvPdf} download
          style={{
            marginTop: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '7px 10px', borderRadius: 10, background: 'var(--primary)', color: 'var(--primary-ink)',
            fontSize: 12, fontWeight: 650, textDecoration: 'none',
          }}>{Icons.download}{t.downloadCv}</a>
      )}
    </div>
  );
}

/**
 * How to reach Ori, at the top right of the home screen where a recruiter
 * looks first. Desktop gets labelled buttons with the number written out;
 * a phone gets three solid round icons that fit beside the logo.
 */
export function ContactActions({ t, compact }) {
  const c = profile.contact || {};
  const items = [
    c.email && { key: 'email', href: `mailto:${c.email}`, icon: Icons.mail, label: t.contactEmail, title: c.email },
    c.phone && { key: 'phone', href: telHref(c.phone), icon: Icons.phone, label: c.phone, title: c.phone },
    c.linkedin && { key: 'linkedin', href: c.linkedin, icon: Icons.linkedin, label: 'LinkedIn', title: 'LinkedIn', external: true },
  ].filter(Boolean);
  if (!items.length) return null;

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {items.map((it) => (
          <a key={it.key} href={it.href} title={it.title}
            target={it.external ? '_blank' : undefined} rel={it.external ? 'noopener noreferrer' : undefined}
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary)', color: 'var(--primary-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px var(--primary-glow)',
            }}>
            <span className="sr-only" lang="en">{it.title}</span>
            {it.external && <span className="sr-only"> {t.newTab}</span>}
            {it.icon}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {items.map((it, i) => (
        <Btn key={it.key} size="sm" variant={i === 0 ? 'primary' : 'ghost'} icon={it.icon} href={it.href} title={it.title}
          sameTab={!it.external} note={it.external ? t.newTab : undefined}
          style={it.key === 'phone' ? { direction: 'ltr' } : undefined}>
          {it.key === 'phone' || it.key === 'linkedin' ? <span lang="en">{it.label}</span> : it.label}
          {it.key === 'email' && <span className="sr-only" lang="en">{`, ${c.email}`}</span>}
        </Btn>
      ))}
    </div>
  );
}

/** One button that flips the language — the phone top bar has no room for two. */
export function LangSwitch({ lang, setLang }) {
  const other = lang === 'he' ? 'en' : 'he';
  const name = other === 'he' ? 'עברית' : 'English';
  return (
    <button type="button" onClick={() => setLang(other)} title={name} aria-label={name} lang={other}
      aria-keyshortcuts="ArrowLeft ArrowRight"
      onKeyDown={(e) => {
        // The wide screen's pair moves with the arrows. This is the same
        // control on a phone, where there is only room for one of the two.
        // A repeat would flip it twice and land back where it started.
        if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.repeat) return;
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        setLang(other);
      }}
      style={{
        height: 44, minWidth: 44, padding: '0 11px', borderRadius: 10, flexShrink: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)',
        fontSize: 12.5, fontWeight: 700,
      }}>{other === 'he' ? 'עב' : 'EN'}</button>
  );
}

export function LangToggle({ lang, setLang, small = true }) {
  return (
    <SegTabs small={small} value={lang} onChange={setLang} label={strings(lang).language}
      items={[{ id: 'en', label: 'EN', title: 'English', lang: 'en' }, { id: 'he', label: 'עב', title: 'עברית', lang: 'he' }]} />
  );
}

/** The first click asks. The second, within a few seconds, clears. */
export function ClearHistoryButton({ t, onClear, style }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(timer);
  }, [armed]);
  return (
    <button type="button" onClick={() => {
      if (!armed) { setArmed(true); return; }
      setArmed(false);
      onClear();
    }}
      className={armed ? 'quiet is-armed' : 'quiet'}
      style={style}
    >
      <span aria-live="polite">{armed ? t.clearHistoryConfirm : t.clearHistory}</span>
    </button>
  );
}

export function RecentList({ t, recents, activeChatId, onPickRecent }) {
  if (!recents.length) {
    return <div style={{ padding: '2px 13px', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t.recentEmpty}</div>;
  }
  return recents.map((c) => {
    const on = c.id === activeChatId;
    const title = chatTitle(c.messages) || '…';
    return (
      <button key={c.id} type="button" onClick={() => onPickRecent(c)} title={title} aria-current={on ? 'true' : undefined}
        className="recent-row"
        data-on={on ? 'true' : 'false'}
        style={{
          display: 'flex', alignItems: 'center', flexShrink: 0, width: '100%', textAlign: 'start', padding: '7px 13px', borderRadius: 9,
          fontSize: 12.5, lineHeight: 1.45, fontWeight: on ? 650 : 500,
        }}
      >
        <span dir="auto" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', wordBreak: 'break-word', minWidth: 0 }}>{title}</span>
      </button>
    );
  });
}

export function Sidebar({ t, lang, page, go, recents, activeChatId, onPickRecent, onNewChat, onClearHistory, admin, onSignOut }) {
  const items = [
    { id: 'chat', path: '/', icon: Icons.chat },
    { id: 'resume', path: '/resume', icon: Icons.resume },
    { id: 'projects', path: '/projects', icon: Icons.projects },
  ];
  const adminItems = [
    { id: 'settings', path: '/admin/settings', icon: Icons.settings },
    { id: 'conversations', path: '/admin/conversations', icon: Icons.inbox },
  ];

  return (
    <div className="screen-only" style={{
      width: 238, flexShrink: 0, background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      height: 'calc(100vh / var(--ui-zoom))',
    }}>
      <div style={{ padding: '17px 20px 0' }}>
        <BrandMark lang={lang} onClick={() => go('/')} />
      </div>

      <div style={{ padding: '26px 20px 10px' }}>
        <Eyebrow>{t.portfolio}</Eyebrow>
      </div>
      <nav aria-label={t.mainNav} style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
        {items.map((it) => (
          <NavButton key={it.id} active={page === it.id} icon={it.icon} label={t.nav[it.id]} onClick={() => go(it.path)} />
        ))}
      </nav>

      {admin && (
        <>
          <div style={{ padding: '20px 20px 10px' }}>
            <Eyebrow>{t.adminEyebrow}</Eyebrow>
          </div>
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
            {adminItems.map((it) => (
              <NavButton key={it.id} active={page === it.id} icon={it.icon} label={t.nav[it.id]} onClick={() => go(it.path)} />
            ))}
          </div>
        </>
      )}

      {/* The chat is one conversation at a time; the ones before it live here. */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', marginTop: 18 }}>
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eyebrow style={{ flex: 1 }}>{t.recent}</Eyebrow>
          <button type="button" onClick={onNewChat} title={t.newChat} aria-label={t.newChat}
            className="quiet hit"
            style={{ display: 'flex', alignItems: 'center', background: 'transparent', padding: 2, borderRadius: 7 }}
          >{Icons.plusCircle}</button>
        </div>
        <div style={{ flex: '0 1 auto', minHeight: 0, overflowY: 'auto', padding: '0 12px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <RecentList t={t} recents={recents} activeChatId={activeChatId} onPickRecent={onPickRecent} />
        </div>
        {recents.length > 0 && (
          <ClearHistoryButton t={t} onClear={onClearHistory}
            style={{ textAlign: 'start', padding: '8px 25px 4px', background: 'transparent', fontSize: 11.5, fontWeight: 600 }} />
        )}
      </div>

      <div style={{ padding: '12px 12px 6px' }}>
        <ContactCard t={t} />
      </div>

      <div style={{ padding: '6px 12px 14px' }}>
        {admin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 9px', borderRadius: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary)', color: 'var(--primary-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icons.shield}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>{t.adminSignIn}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>{t.administrator}</div>
            </div>
            <button type="button" onClick={onSignOut} title={t.signOut} aria-label={t.signOut}
              className="quiet is-danger hit"
              style={{ display: 'flex', alignItems: 'center', background: 'transparent', padding: 5, borderRadius: 8 }}
            >{Icons.logout}</button>
          </div>
        ) : (
          <button type="button" onClick={() => go('/admin')}
            className="quiet"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px', background: 'transparent', fontSize: 11.5, fontWeight: 600, borderRadius: 8 }}
          >{Icons.shield}{t.adminSignIn}</button>
        )}
      </div>
    </div>
  );
}
