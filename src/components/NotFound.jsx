import { Icons, PageHeader, Btn } from './ui.jsx';

/**
 * An address that is not a page. The sidebar and the phone bar still navigate;
 * this is the same quiet empty state the resume uses when it has nothing to show.
 */
export function NotFound({ t, lang, stacked, onOpenChat }) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const address = typeof window !== 'undefined' ? window.location.pathname : '';
  const action = <Btn variant="primary" icon={Icons.chat} onClick={onOpenChat}>{t.openChat}</Btn>;
  return (
    <div dir={dir}>
      {!stacked && <PageHeader eyebrow={t.portfolio} title={t.notFoundTitle} subtitle={t.notFoundSub} actions={action} />}
      {stacked && (
        <p dir="auto" style={{ margin: '-4px 0 0', maxWidth: 420, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{t.notFoundSub}</p>
      )}
      {address && address !== '/' && (
        <p dir="ltr" style={{
          margin: stacked ? '12px 0 0' : '-8px 0 0',
          maxWidth: 420,
          fontFamily: 'var(--mono)',
          fontSize: 12,
          lineHeight: 1.5,
          color: 'var(--text-muted)',
          overflowWrap: 'anywhere',
        }}>{address}</p>
      )}
      {stacked && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}
