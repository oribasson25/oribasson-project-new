import { useState } from 'react';

/* The 8Legs.ai design primitives — eyebrow, page header, crumbs, two button
   weights, chips, segmented tabs — redrawn in graphite. */

const svg = (children, size = 18) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export const Icons = {
  chat: svg(<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />),
  resume: svg(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></>),
  projects: svg(<><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>),
  settings: svg(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  inbox: svg(<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>),
  shield: svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, 16),
  plusCircle: svg(<><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>, 16),
  logout: svg(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>, 16),
  mail: svg(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>, 15),
  phone: svg(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />, 15),
  globe: svg(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>, 15),
  linkedin: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
  ),
  github: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" /></svg>
  ),
  download: svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>, 15),
  external: svg(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>, 14),
  sparkle: svg(<><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9z" /></>, 14),
  trash: svg(<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>, 15),
  menu: svg(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>, 20),
  clock: svg(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  more: svg(<><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>),
};

export function isHebrew(s) {
  return /[֐-׿]/.test(String(s || ''));
}

/** The small label above a section: mono and letter-spaced in English, plain in Hebrew. */
export function Eyebrow({ children, style }) {
  const he = typeof children === 'string' && isHebrew(children);
  return (
    <div dir="auto" style={he
      ? { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', ...style }
      : {
          fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--text-muted)', ...style,
        }}>{children}</div>
  );
}

/** Portfolio / Resume — where you are, across the top of the content column. */
export function Crumbs({ trail, right }) {
  return (
    <div style={{
      height: 54, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 9,
      padding: '0 34px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-app)', position: 'relative', zIndex: 2,
    }}>
      {trail.filter(Boolean).map((part, i, all) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13, opacity: 0.6 }}>/</span>}
          <span dir="auto" style={{
            fontSize: 13, fontWeight: i === all.length - 1 ? 600 : 500,
            color: i === all.length - 1 ? 'var(--text)' : 'var(--text-2)',
            maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{part}</span>
        </span>
      ))}
      <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>{right}</div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions, size = 38 }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {eyebrow && <Eyebrow style={{ marginBottom: 10 }}>{eyebrow}</Eyebrow>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div dir="auto" style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.08, color: 'var(--text)' }}>{title}</div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
      {subtitle && <div dir="auto" style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 10, fontWeight: 500 }}>{subtitle}</div>}
    </div>
  );
}

/** Two weights, one shape: `primary` (graphite, at most one per screen) and `ghost`. */
export function Btn({ variant = 'ghost', icon, children, onClick, title, disabled, danger, style, size = 'md', href, type, download, sameTab }) {
  const [hot, setHot] = useState(false);
  const pad = size === 'sm' ? '7px 12px' : '10px 17px';
  const font = size === 'sm' ? 12.5 : 13;
  const primary = variant === 'primary';
  const look = primary
    ? { background: hot ? 'var(--primary-hover)' : 'var(--primary)', color: 'var(--primary-ink)', border: '1px solid transparent', boxShadow: hot ? '0 4px 18px var(--primary-glow)' : '0 2px 10px var(--primary-glow)' }
    : { background: hot ? 'var(--bg-hover)' : 'var(--bg-card)', color: danger ? 'var(--danger)' : (hot ? 'var(--text)' : 'var(--text-2)'), border: `1px solid ${hot && !danger ? 'var(--primary-soft)' : 'var(--border)'}` };
  const Tag = href ? 'a' : 'button';
  return (
    <Tag href={href} target={href && !download && !sameTab ? '_blank' : undefined} rel={href ? 'noopener noreferrer' : undefined}
      download={download} type={href ? undefined : type || 'button'}
      onClick={onClick} title={title} disabled={disabled}
      onMouseEnter={() => !disabled && setHot(true)} onMouseLeave={() => setHot(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: pad, borderRadius: 'var(--r-md)', fontSize: font, fontWeight: 600,
        whiteSpace: 'nowrap', cursor: disabled ? 'default' : 'pointer', textDecoration: 'none',
        opacity: disabled ? 0.45 : 1, transition: 'background 0.16s, color 0.16s, border-color 0.16s, box-shadow 0.16s',
        ...look, ...style,
      }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </Tag>
  );
}

export function IconBtn({ onClick, title, children, danger, style, disabled }) {
  const [hot, setHot] = useState(false);
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} disabled={disabled}
      onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hot ? 'var(--bg-hover)' : 'transparent',
        color: hot ? (danger ? 'var(--danger)' : 'var(--text)') : 'var(--text-muted)',
        ...style,
      }}>{children}</button>
  );
}

export function Chip({ children, mono, style, title }) {
  return (
    <span title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px',
      borderRadius: 999, fontSize: 11.5, fontWeight: 600, lineHeight: 1.5,
      background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)',
      fontFamily: mono ? 'var(--mono)' : 'inherit', whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

export function SegTabs({ items, value, onChange, style, small }) {
  return (
    <div style={{
      display: 'inline-flex', gap: 3, padding: 3, borderRadius: 'var(--r-md)',
      background: 'var(--bg-panel)', border: '1px solid var(--border)', ...style,
    }}>
      {items.map((it) => {
        const on = value === it.id;
        return (
          <button key={it.id} type="button" onClick={() => onChange(it.id)} title={it.title}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: small ? '4px 10px' : '6px 14px', borderRadius: 8, fontSize: small ? 12 : 12.5,
              fontWeight: on ? 700 : 600,
              background: on ? 'var(--sel)' : 'transparent',
              color: on ? 'var(--sel-ink)' : 'var(--text-2)',
              border: '1px solid transparent',
              transition: 'background 0.15s, color 0.15s',
            }}>{it.label}</button>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 48px' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'var(--bg-hover)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
      }}>{icon}</div>
      <div>
        <div dir="auto" style={{ color: 'var(--text)', fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{title}</div>
        {subtitle && <div dir="auto" style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatusDot({ on, size = 7 }) {
  return <span style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
    background: on ? 'var(--success)' : 'var(--text-muted)',
    boxShadow: on ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
  }} />;
}

/** A section card: the shape 8Legs' Settings is built from. */
export function Section({ id, title, children, right, pad = '14px 18px' }) {
  return (
    <div id={id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {title && (
        <div style={{
          padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)',
        }}>
          <div dir="auto" style={{ flex: 1, minWidth: 0 }}>{title}</div>
          {right}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}
