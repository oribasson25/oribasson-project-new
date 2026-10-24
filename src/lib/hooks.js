import { useEffect, useState } from 'react';

/*
 * Pages have real addresses — /resume, /projects, /admin — so a recruiter can
 * be sent straight to one. Vercel rewrites every path to index.html.
 */
export function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const go = (next) => {
    if (next === window.location.pathname) return;
    window.history.pushState({}, '', next);
    setPath(next);
  };
  return [path, go];
}

const PHONE = '(max-width: 768px)';

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/*
 * The phone's real height. With the keyboard open, iOS keeps 100dvh at the
 * full screen and scrolls the page to show the field instead — the top bar
 * slides away and the shell looks stretched. visualViewport is the only
 * number that tells the truth, so it goes into --app-h and the page is put
 * back at the top whenever Safari scrolls it.
 */
export function useViewportHeight(active) {
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    if (!active || !vv) return undefined;
    const apply = () => {
      root.style.setProperty('--app-h', `${Math.round(vv.height)}px`);
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      root.style.removeProperty('--app-h');
    };
  }, [active]);
}

/** True while a text field has focus — on a phone, while the keyboard is up. */
export function useTyping(active) {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!active) { setTyping(false); return undefined; }
    const isField = (el) => !!el && (el.tagName === 'TEXTAREA'
      || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes(el.type)));
    const onIn = (e) => { if (isField(e.target)) setTyping(true); };
    // Focus may be moving to another field; look once it has landed.
    const onOut = () => setTimeout(() => setTyping(isField(document.activeElement)), 60);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, [active]);
  return typing;
}
