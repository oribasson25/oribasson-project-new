import { useEffect, useRef, useState } from 'react';

export function Composer({ value, onChange, onSend, disabled, placeholder, dir, width = 720, fieldRef, autoFocus, sendLabel = 'Send' }) {
  const [focus, setFocus] = useState(false);
  const own = useRef(null);
  const ref = fieldRef || own;

  // Grows with the text, up to a limit, like 8Legs' composer.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [value]);

  const empty = !value.trim();
  return (
    <div dir={dir} style={{
      width: `min(${width}px, 100%)`, margin: '0 auto',
      background: 'var(--bg-card)', border: `1px solid ${focus ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 26, boxShadow: focus ? '0 0 0 4px var(--primary-dim), var(--shadow)' : 'var(--shadow)',
      padding: '5px 6px', display: 'flex', alignItems: 'flex-end', gap: 8,
      transition: 'border-color 0.18s, box-shadow 0.18s',
    }}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); onSend(); } }}
        dir="auto"
        rows={1}
        maxLength={2000}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          flex: 1, resize: 'none', border: 'none', background: 'transparent', outline: 'none',
          boxShadow: 'none', fontSize: 14.5, lineHeight: 1.6, padding: '13px 12px', maxHeight: 150,
        }}
      />
      <button type="button" onClick={onSend} disabled={disabled || empty} title={sendLabel} aria-label={sendLabel}
        style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, marginBottom: 4,
          background: 'var(--primary)', color: 'var(--primary-ink)', fontSize: 17, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: disabled || empty ? 0.35 : 1,
        }}>↑</button>
    </div>
  );
}

/* On a phone every question stays in view, as a two-column grid of small
   cards: six pills wrapped one per line filled half the screen. */
export function QuestionChips({ items, onPick, disabled, dir, style, grid, className, variant = 'solid' }) {
  return (
    <div dir={dir} className={className} style={{
      ...(grid
        ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
        : { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }),
      ...style,
    }}>
      {items.map((text) => {
        const glass = variant === 'glass';
        return (
          <button key={text} type="button" onClick={() => onPick(text)} disabled={disabled}
            className={glass ? 'hero-chip' : undefined}
            style={{
              background: glass ? 'rgba(255,255,255,0.06)' : 'var(--bg-card)',
              border: `1px solid ${glass ? 'rgba(255,255,255,0.16)' : 'var(--border)'}`,
              color: glass ? '#eef3fa' : 'var(--text-2)',
              fontWeight: 600,
              ...(grid
                ? { borderRadius: 14, padding: '9px 12px', fontSize: 12.5, lineHeight: 1.35, minHeight: 50, textAlign: 'start', display: 'flex', alignItems: 'center' }
                : { borderRadius: 999, padding: '8px 15px', fontSize: 12.5 }),
            }}
            onMouseEnter={glass ? undefined : (e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={glass ? undefined : (e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          >{text}</button>
        );
      })}
    </div>
  );
}
