import { useEffect, useState } from 'react';
import { timeAgo } from '../i18n.js';
import { renderMarkdown } from '../lib/markdown.js';
import { Icons, PageHeader, Btn, Chip, EmptyState, Section } from './ui.jsx';

function place(c) {
  return [c.city, c.country].filter(Boolean).join(', ');
}

function device(ua) {
  const s = String(ua || '');
  const os = /iPhone|iPad/.test(s) ? 'iOS' : /Android/.test(s) ? 'Android' : /Mac OS X/.test(s) ? 'macOS' : /Windows/.test(s) ? 'Windows' : /Linux/.test(s) ? 'Linux' : '';
  const browser = /Edg\//.test(s) ? 'Edge' : /Chrome\//.test(s) ? 'Chrome' : /Firefox\//.test(s) ? 'Firefox' : /Safari\//.test(s) ? 'Safari' : '';
  return [browser, os].filter(Boolean).join(' · ') || '—';
}

function Thread({ id, t, lang, onBack, onDeleted, onUnauthorized }) {
  const C = t.convos;
  const [convo, setConvo] = useState(null);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/conversations?id=${encodeURIComponent(id)}`)
      .then((r) => { if (r.status === 401) { onUnauthorized(); return null; } return r.ok ? r.json() : Promise.reject(); })
      .then((body) => body && setConvo(body))
      .catch(() => setFailed(true));
  }, [id]);

  // Two clicks, the second on a button that says what it will do.
  async function remove() {
    if (!confirming) { setConfirming(true); return; }
    const r = await fetch(`/api/admin/conversations?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (r.ok) onDeleted(id);
  }

  return (
    <div>
      <button type="button" onClick={onBack}
        style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', background: 'none', padding: 0, marginBottom: 16 }}>{C.back}</button>
      {failed && <Section><EmptyState icon={Icons.inbox} title={t.errors.error} /></Section>}
      {convo && (
        <>
          <PageHeader eyebrow={C.title} title={convo.title || '…'} size={28}
            actions={(
              <>
                {confirming && <Btn onClick={() => setConfirming(false)}>✕</Btn>}
                <Btn danger icon={Icons.trash} onClick={remove}
                  style={confirming ? { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' } : undefined}>
                  {confirming ? C.confirmDel : C.del}
                </Btn>
              </>
            )} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: -10, marginBottom: 20 }}>
            <Chip>{C.started}: {new Date(convo.created_at).toLocaleString(lang === 'he' ? 'he-IL' : 'en-GB')}</Chip>
            {place(convo) && <Chip>{C.from}: {place(convo)}</Chip>}
            <Chip>{C.device}: {device(convo.user_agent)}</Chip>
            <Chip mono>{C.visitor} {String(convo.visitor_id).slice(0, 8)}</Chip>
          </div>
          <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(convo.messages || []).map((m, i) => (m.role === 'user' ? (
              <div key={i} dir="auto" style={{
                alignSelf: 'flex-end', maxWidth: '85%', background: 'var(--primary)', color: 'var(--primary-ink)',
                padding: '10px 14px', borderRadius: '16px 16px 4px 16px', fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{m.content}</div>
            ) : (
              <div key={i} dir="auto" style={{
                alignSelf: 'stretch', background: 'var(--bg-card)', border: '1px solid var(--border)',
                padding: '12px 15px', borderRadius: '16px 16px 16px 4px', fontSize: 13.5,
              }}>
                <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
              </div>
            )))}
          </div>
        </>
      )}
    </div>
  );
}

export function AdminConversations({ t, lang, onUnauthorized, stacked }) {
  const C = t.convos;
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  async function load(before) {
    const r = await fetch(`/api/admin/conversations${before ? `?before=${encodeURIComponent(before)}` : ''}`);
    if (r.status === 401) { onUnauthorized(); return null; }
    if (!r.ok) throw new Error('load failed');
    return r.json();
  }

  useEffect(() => { load().then((d) => d && setData(d)).catch(() => setData({ conversations: [], total: 0, visitors: 0, failed: true })); }, []);

  async function more() {
    const list = data.conversations;
    setLoadingMore(true);
    try {
      const d = await load(list[list.length - 1].updated_at);
      if (d) setData({ ...d, conversations: [...list, ...d.conversations] });
    } finally {
      setLoadingMore(false);
    }
  }

  if (open) {
    return (
      <div dir={dir}>
        <Thread id={open} t={t} lang={lang} onBack={() => setOpen(null)} onUnauthorized={onUnauthorized}
          onDeleted={(id) => {
            setOpen(null);
            setData((d) => ({ ...d, total: d.total - 1, conversations: d.conversations.filter((c) => c.id !== id) }));
          }} />
      </div>
    );
  }

  const list = data ? data.conversations : [];
  return (
    <div dir={dir}>
      {!stacked && <PageHeader eyebrow={t.adminEyebrow} title={C.title} subtitle={data && data.total ? C.sub(data.total, data.visitors) : null} />}
      {data && list.length === 0 ? (
        <Section><EmptyState icon={Icons.inbox} title={data.failed ? t.errors.error : C.empty} subtitle={data.failed ? null : C.emptySub} /></Section>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {list.map((c, i) => (
            <button key={c.id} type="button" onClick={() => setOpen(c.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', textAlign: 'start',
                background: 'transparent', borderTop: i ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-panel)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div dir="auto" style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || '…'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 11.5, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>{C.messages(c.message_count)}</span>
                  {place(c) && <><span style={{ opacity: 0.5 }}>·</span><span>{place(c)}</span></>}
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{String(c.visitor_id).slice(0, 8)}</span>
                </div>
              </div>
              <Chip mono style={{ fontSize: 10.5 }}>{(c.lang || 'en').toUpperCase()}</Chip>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', minWidth: 70, textAlign: 'end', flexShrink: 0 }}>{timeAgo(c.updated_at, lang)}</div>
            </button>
          ))}
        </div>
      )}
      {data && list.length < data.total && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Btn onClick={more} disabled={loadingMore}>{C.more}</Btn>
        </div>
      )}
    </div>
  );
}
