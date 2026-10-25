import { useEffect, useState } from 'react';
import { tx } from '../../shared/text.js';
import { useReducedMotion } from '../lib/hooks.js';
import { PageHeader, Eyebrow, Btn, StatusDot, Section } from './ui.jsx';

function EyeIcon({ off }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {off ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.1A10.8 10.8 0 0 1 12 5c5 0 9.3 3.1 11 7a11 11 0 0 1-2.2 3.2" />
          <path d="M6.1 6.1C4.2 7.3 2.6 9 1 12c1.7 3.9 6 7 11 7 1.3 0 2.5-.2 3.6-.6" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 999, padding: 2, flexShrink: 0,
        background: on ? 'var(--primary)' : 'var(--bg-hover)', border: '1px solid var(--border)',
        display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
      }}>
      <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

export function AdminSettings({ t, lang, onUnauthorized, onChanged, stacked }) {
  const S = t.settings;
  const reduced = useReducedMotion();
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const [settings, setSettings] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);   // { ok, text }
  const [section, setSection] = useState('set-model');

  async function load() {
    const resp = await fetch('/api/admin/settings');
    if (resp.status === 401) return onUnauthorized();
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) { setMessage({ ok: false, text: S[body.code] || S.server_error }); return; }
    setSettings(body);
    setModel(body.model);
  }
  useEffect(() => { load(); }, []);

  async function save(patch) {
    setBusy(true);
    setMessage(null);
    try {
      const resp = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (resp.status === 401) return onUnauthorized();
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) { setMessage({ ok: false, text: S[body.code] || S.server_error }); return; }
      setSettings(body);
      setModel(body.model);
      setApiKey('');
      setMessage({ ok: true, text: S.saved });
      onChanged();
    } catch {
      setMessage({ ok: false, text: t.login.network });
    } finally {
      setBusy(false);
    }
  }

  const SECTIONS = [
    { id: 'set-model', label: S.modelKey.replace(/^AI · /, '') },
    { id: 'set-chat', label: S.chat },
    { id: 'set-limits', label: S.limits },
  ];
  function jump(id) {
    setSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  const dirty = apiKey.trim() || (settings && model !== settings.model);
  const label = { fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' };

  return (
    <div dir={dir}>
      {!stacked && <PageHeader eyebrow={t.adminEyebrow} title={S.title} />}
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
        <div style={{ width: 186, flexShrink: 0, position: 'sticky', top: 0, display: stacked ? 'none' : 'block' }}>
          <Eyebrow style={{ padding: '0 12px', marginBottom: 10 }}>{S.sections}</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map((sx) => {
              const on = section === sx.id;
              return (
                <button key={sx.id} type="button" onClick={() => jump(sx.id)}
                  style={{
                    display: 'flex', alignItems: 'center', height: 38, padding: '0 12px',
                    borderRadius: 10, textAlign: 'start', fontSize: 13, fontWeight: on ? 700 : 500,
                    background: on ? 'var(--sel)' : 'transparent', color: on ? 'var(--sel-ink)' : 'var(--text-2)',
                  }}>{sx.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, maxWidth: stacked ? 'none' : 720, display: 'flex', flexDirection: 'column', gap: stacked ? 16 : 22 }}>
          <Section id="set-model" title={S.modelKey}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{S.modelKeyNote}</div>

              {settings && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, fontWeight: 600, color: settings.hasKey ? 'var(--text)' : 'var(--text-2)' }}>
                  <StatusDot on={settings.hasKey && settings.chatEnabled} />
                  <span dir="auto">
                    {settings.keyUnreadable ? S.keyUnreadable : settings.hasKey ? S.keySet(settings.keyHint) : S.keyNone}
                  </span>
                </div>
              )}

              <div>
                <label style={label} htmlFor="api-key">{S.key}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input id="api-key" type={showKey ? 'text' : 'password'} value={apiKey} dir="ltr"
                    onChange={(e) => { setApiKey(e.target.value); setMessage(null); }}
                    placeholder={settings && settings.hasKey ? S.replaceKey : S.keyPlaceholder}
                    autoComplete="off" spellCheck={false} style={{ flex: 1, fontFamily: apiKey ? 'var(--mono)' : 'inherit' }} />
                  <button type="button" onClick={() => setShowKey((v) => !v)}
                    title={showKey ? S.hideKey : S.showKey} aria-label={showKey ? S.hideKey : S.showKey}
                    aria-pressed={showKey}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-2)', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', display: 'flex' }}>
                    <EyeIcon off={showKey} />
                  </button>
                </div>
              </div>

              <div>
                <label style={label} htmlFor="model">{S.model}</label>
                <select id="model" value={model} onChange={(e) => { setModel(e.target.value); setMessage(null); }} dir="ltr">
                  {(settings ? settings.models : []).map((m) => (
                    <option key={m.id} value={m.id}>{m.label} — {tx(m.note, lang)}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Btn variant="primary" disabled={busy || !dirty} onClick={() => save({ apiKey: apiKey.trim() || undefined, model })}>
                  {busy ? S.saving : S.save}
                </Btn>
                {settings && settings.hasKey && (
                  <Btn danger disabled={busy} onClick={() => save({ removeKey: true })}>{S.removeKey}</Btn>
                )}
                {message && (
                  <span role="status" style={{ fontSize: 12.5, fontWeight: 600, color: message.ok ? 'var(--success-ink)' : 'var(--danger-ink)' }}>{message.text}</span>
                )}
              </div>
            </div>
          </Section>

          <Section id="set-chat" title={S.chat}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 650 }}>{S.chatOn}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.55 }}>{S.chatOnNote}</div>
              </div>
              {settings && (
                <Toggle on={settings.chatEnabled} label={S.chatOn} onChange={(on) => save({ chatEnabled: on })} />
              )}
            </div>
          </Section>

          <Section id="set-limits" title={S.limits}>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>{S.limitsNote}</div>
          </Section>
        </div>
      </div>
    </div>
  );
}
