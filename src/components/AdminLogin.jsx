import { useState } from 'react';
import profile from '../../content/profile.js';
import { tx } from '../../shared/text.js';
import { Pet } from './Pet.jsx';
import { LangToggle } from './Sidebar.jsx';

/* 8Legs' front door: the dark welcome panel on the left, the form on the right. */
const HERO_INK = '#f2f3f7';
const HERO_INK_DIM = 'rgba(242,243,247,0.66)';

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
        flex: 1, display: mobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0d10 0%, #0f1320 100%)', borderRight: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div dir={dir} style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Pet size={190} mode="idle" pulse={{ name: 'waving', n: 1 }} follow />
          <div dir={dir} style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 18, unicodeBidi: 'isolate' }}>
            <span style={{ color: HERO_INK, unicodeBidi: 'normal' }}>{first}</span>
            {rest.length > 0 && <>{' '}<span style={{ color: HERO_INK_DIM, unicodeBidi: 'normal' }}>{rest.join(' ')}</span></>}
          </div>
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: HERO_INK, letterSpacing: '-0.02em', marginBottom: 10, maxWidth: 380 }}>{L.heroTitle}</div>
            <div style={{ fontSize: 14, color: HERO_INK_DIM, maxWidth: 330, lineHeight: 1.7, margin: '0 auto' }}>{L.heroSub}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
            {L.pills.map((f) => (
              <span key={f} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: HERO_INK_DIM }}>{f}</span>
            ))}
          </div>
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
              <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: 13, marginTop: 12, padding: '10px 12px', background: 'var(--danger-dim)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(220,38,38,0.2)', lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={busy || !password}
              style={{ width: '100%', background: 'var(--primary)', color: 'var(--primary-ink)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: 14, marginTop: 16, boxShadow: '0 2px 12px var(--primary-glow)' }}>
              {busy ? L.busy : L.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
