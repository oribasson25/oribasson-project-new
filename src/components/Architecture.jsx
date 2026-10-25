import { useEffect, useRef, useState } from 'react';
import { tx } from '../../shared/text.js';
import { useReducedMotion } from '../lib/hooks.js';

/*
 * A small architecture figure. Nodes are HTML so Hebrew and English follow
 * the page direction; the connectors are SVG so the stroke can draw in.
 * Nothing here is interactive.
 */

function useDrawn(ref) {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = useState(reduced);
  useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setDrawn(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    // If the scroller never reports an intersection, still show the figure.
    const fallback = setTimeout(() => setDrawn(true), 1500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [reduced, ref]);
  return [reduced, drawn];
}

function Stem({ delay }) {
  return (
    <svg className="arch-stem" viewBox="0 0 12 16" width="12" height="16" aria-hidden="true" style={{ '--arch-d': `${delay}ms` }}>
      <path className="arch-line" d="M6 1 V11" pathLength="1" />
      <path className="arch-line" d="M2.5 9.5 L6 14 L9.5 9.5" pathLength="1" />
    </svg>
  );
}

function Rail({ delay }) {
  return (
    <svg className="arch-rail" viewBox="0 0 100 8" width="72%" height="8" preserveAspectRatio="none" aria-hidden="true" style={{ '--arch-d': `${delay}ms` }}>
      <path className="arch-line" d="M1 4 H99" pathLength="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** A Hebrew page would read "WhatsApp" and "Gmail" in a Hebrew voice. */
function latinLang(text, pageLang) {
  if (pageLang !== 'he' || !text) return undefined;
  return /[֐-׿]/.test(text) ? undefined : 'en';
}

/** Two short parts sit side by side. A long label or note needs the card's width. */
function needsRoom(nodes, lang) {
  if (nodes.length < 2) return false;
  return nodes.some((node) => {
    const label = tx(node.label, lang).length;
    const sub = node.sub ? tx(node.sub, lang).length : 0;
    return label > 34 || sub > 36;
  });
}

function Node({ node, lang, delay }) {
  const label = tx(node.label, lang);
  const sub = node.sub ? tx(node.sub, lang) : '';
  return (
    <div className="arch-node" dir="auto" style={{ animationDelay: `${delay}ms` }}>
      <span className="arch-label" lang={latinLang(label, lang)}>{label}</span>
      {sub && <span className="arch-sub" dir="auto" lang={latinLang(sub, lang)}>{sub}</span>}
    </div>
  );
}

export function Architecture({ spec, lang, label }) {
  const ref = useRef(null);
  const [reduced, drawn] = useDrawn(ref);
  const groups = spec.groups || [{ steps: spec.steps || [] }];
  let delay = 30;

  return (
    <figure ref={ref} className={`arch${reduced ? '' : ' arch-motion'}${drawn ? ' is-in' : ''}`}>
      <figcaption className="arch-cap" dir="auto">{label}</figcaption>
      {groups.map((group, gi) => (
        <div key={gi} className="arch-group">
          {group.title && <div className="arch-group-title" dir="auto" lang={latinLang(tx(group.title, lang), lang)}>{tx(group.title, lang)}</div>}
          {(group.steps || []).map((step, si) => {
            const at = delay;
            delay += 80;
            const nodes = step.nodes || [];
            const linked = si > 0 && step.join !== false;
            return (
              <div key={si} className={`arch-step${step.join === false ? ' arch-step-gap' : ''}`}>
                {linked && <Stem delay={at} />}
                {linked && nodes.length === 2 && <Rail delay={at} />}
                <div className={`arch-row${nodes.length > 2 || needsRoom(nodes, lang) ? ' arch-row-stack' : ''}`}>
                  {nodes.map((node, ni) => (
                    <Node key={ni} node={node} lang={lang} delay={at + (linked ? 50 : 0) + ni * 40} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </figure>
  );
}
