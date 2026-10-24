import { useEffect, useRef, useState } from 'react';

export function Composer({ value, onChange, onSend, disabled, placeholder, dir, width = 720, fieldRef, autoFocus, sendLabel = 'Send', align = 'center' }) {
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
      width: `min(${width}px, 100%)`, margin: align === 'start' ? 0 : '0 auto',
      background: 'transparent', borderBottom: `1px solid ${focus ? 'var(--text)' : 'var(--border)'}`,
      borderRadius: 0, padding: '0', display: 'flex', alignItems: 'flex-end', gap: 8,
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
          width: 36, height: 36, borderRadius: 0, flexShrink: 0, marginBottom: 6,
          background: 'var(--primary)', color: 'var(--primary-ink)', fontSize: 16, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: disabled || empty ? 0.35 : 1,
        }}>↑</button>
    </div>
  );
}

/* Follow-ups sit in a row of rules. The hero uses a numbered index instead. */
export function QuestionChips({ items, onPick, disabled, dir, style, className, variant = 'solid' }) {
  if (variant === 'index') {
    return (
      <ol dir={dir} className={`hero-index${className ? ` ${className}` : ''}`} style={style}>
        {items.map((text, i) => (
          <li key={text}>
            <button type="button" onClick={() => onPick(text)} disabled={disabled}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span>{text}</span>
            </button>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <div dir={dir} className={className} style={{
      display: 'flex', flexWrap: 'wrap', gap: '2px 16px', justifyContent: 'flex-start',
      ...style,
    }}>
      {items.map((text) => (
        <button key={text} type="button" onClick={() => onPick(text)} disabled={disabled}
          style={{
            background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)',
            borderRadius: 0, color: 'var(--text-2)', fontWeight: 500, padding: '6px 0', fontSize: 13,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderBottomColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderBottomColor = 'var(--border)'; }}
        >{text}</button>
      ))}
    </div>
  );
}
