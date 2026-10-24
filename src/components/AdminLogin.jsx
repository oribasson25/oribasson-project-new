import { useState } from 'react';
import profile from '../../content/profile.js';
import { tx } from '../../shared/text.js';
import { Pet } from './Pet.jsx';
import { LangToggle } from './Sidebar.jsx';

/* The same paper as the rest of the site: name, plate, then the form. */
export function AdminLogin({ t, lang, setLang, onSignedIn, onBack, mobile }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const L = t.login;
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const [first, ...rest] = tx(profile.name, lang).split(' ');

  async function submit() {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (resp.ok) { onSignedIn(); return; }
      const body = await resp.json().catch(() => ({}));
      setError(L[body.code] || L.error);
    } catch {
      setError(L.network);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: mobile ? '100dvh' : 'calc(100vh / var(--ui-zoom))', background: 'var(--bg-app)', overflow: 'hidden' }}>
      <div style={{
        flex: 1, display: mobile ? 'none' : 'flex', alignItems: 'flex-end',
        background: 'var(--bg-sidebar)', borderInlineEnd: '1px solid var(--border)',
        padding: '48px 56px', overflow: 'hidden',
      }}>
        <div dir={dir} style={{ position: 'relative', maxWidth: 480 }}>
          <div style={{ position: 'relative', width: 210, height: 200, marginBottom: 12 }}>
            <div aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 8, bottom: 0, width: 128, height: 148, background: 'var(--text)' }} />
            <div style={{ position: 'relative' }}>
              <Pet size={180} mode="idle" pulse={{ name: 'waving', n: 1 }} follow />
            </div>
          </div>
          <div dir={dir} style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 64, lineHeight: 0.82, letterSpacing: '-0.03em', unicodeBidi: 'isolate' }}>
            <span style={{ display: 'block', unicodeBidi: 'normal' }}>{first}</span>
            {rest.length > 0 && <span style={{ display: 'block', fontStyle: lang === 'he' ? 'normal' : 'italic', unicodeBidi: 'normal' }}>{rest.join(' ')}</span>}
          </div>
          <div style={{ marginTop: 18, fontFamily: 'var(--display)', fontWeight: 500, fontSize: 22, lineHeight: 1.25, maxWidth: 420 }}>{L.heroTitle}</div>
          <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-2)', maxWidth: 420, lineHeight: 1.6 }}>{L.heroSub}</div>
          <ul style={{ listStyle: 'none', margin: '20px 0 0', padding: 0, borderTop: '1px solid var(--border)', maxWidth: 360 }}>
            {L.pills.map((f, i) => (
              <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ width: mobile ? '100%' : 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: mobile ? '32px 24px' : '40px 48px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 18, insetInlineEnd: 18 }}>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <div dir={dir} style={{ width: '100%', maxWidth: 340 }}>
          <button type="button" onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', background: 'none', padding: 0, marginBottom: 16 }}>
            {L.back}
          </button>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6 }}>{L.heading}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.6 }}>{L.sub}</div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={L.password} aria-label={L.password} autoFocus autoComplete="current-password" dir="ltr" />
            {error && (
              <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: 13, marginTop: 12, padding: '10px 12px', background: 'var(--danger-dim)', borderRadius: 0, borderInlineStart: '2px solid var(--danger)', lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={busy || !password}
              style={{ width: '100%', background: 'var(--primary)', color: 'var(--primary-ink)', padding: '12px 16px', borderRadius: 0, fontWeight: 650, fontSize: 14, marginTop: 16 }}>
              {busy ? L.busy : L.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
