import { useEffect } from 'react';
import profile from '../../content/profile.js';
import resume from '../../content/resume.js';
import projects from '../../content/projects.js';
import { tx } from '../../shared/text.js';
import { strings } from '../i18n.js';

export const ORIGIN = 'https://oribasson.com';

const DESC = {
  en: {
    home: 'Ori Basson — AI Solutions Engineer. Production LLM agents, a resume, projects, and an AI chat that answers from the published work.',
    resume: 'Resume of Ori Basson, AI Solutions Engineer — production LLM agents, tooling, evaluation, and claims operations.',
    projects: 'Projects by Ori Basson: production AI agents at Libra Insurance, an HR recruitment system, and 8Legs.ai.',
  },
  he: {
    home: 'אורי בסון — הנדסת פתרונות AI. סוכני LLM בפרודקשן, קורות חיים, פרויקטים, וצ׳אט AI שעונה מתוך החומר שפורסם.',
    resume: 'קורות החיים של אורי בסון — הנדסת פתרונות AI, סוכני LLM בפרודקשן, כלים והערכה.',
    projects: 'הפרויקטים של אורי בסון: סוכני AI בליברה ביטוח, מערכת גיוס, ו-8Legs.ai.',
  },
};

const PATHS = {
  chat: '/',
  resume: '/resume',
  projects: '/projects',
  login: '/admin',
  settings: '/admin/settings',
  conversations: '/admin/conversations',
};

const KNOWN_PATHS = new Set(Object.values(PATHS));

function knownPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return KNOWN_PATHS.has(path);
}

function abs(path) {
  return ORIGIN + (path === '/' ? '/' : path);
}

/** Schema.org wants a telephone with a country code. 053… is the same Israeli number. */
function schemaPhone(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) return `+972${digits.slice(1)}`;
  return raw.startsWith('+') ? `+${digits}` : raw;
}

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function personNode() {
  const job = (resume.experience || [])[0];
  const company = job ? tx(job.company, 'en') : '';
  const role = job ? tx(job.role, 'en') : '';
  const schools = (resume.education || []).map((e) => tx(e.school, 'en')).filter(Boolean);
  const headline = tx(profile.headline, 'en');
  const sameAs = [profile.contact?.linkedin, profile.contact?.github, profile.contact?.website].filter(Boolean);
  const knowsAbout = (resume.skills || []).flatMap((g) => g.items || []).filter(Boolean);
  return {
    '@type': 'Person',
    '@id': `${ORIGIN}/#person`,
    name: tx(profile.name, 'en'),
    alternateName: tx(profile.name, 'he'),
    url: `${ORIGIN}/`,
    image: `${ORIGIN}/og.png`,
    jobTitle: headline.split(' · ')[0] || headline,
    email: profile.contact?.email ? `mailto:${profile.contact.email}` : undefined,
    telephone: schemaPhone(profile.contact?.phone),
    address: tx(profile.location, 'en')
      ? { '@type': 'PostalAddress', addressCountry: 'IL' }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    worksFor: company ? { '@type': 'Organization', name: company } : undefined,
    hasOccupation: role ? { '@type': 'Occupation', name: role } : undefined,
    alumniOf: schools.length === 1
      ? { '@type': 'EducationalOrganization', name: schools[0] }
      : (schools.length ? schools.map((name) => ({ '@type': 'EducationalOrganization', name })) : undefined),
    knowsLanguage: (resume.languages || []).map((l) => tx(l.name, 'en')).filter(Boolean),
    knowsAbout: knowsAbout.length ? knowsAbout : undefined,
    description: tx(resume.summary, 'en'),
  };
}

function crumbs(page) {
  const en = strings('en');
  const name = tx(profile.name, 'en');
  const here = page === 'resume' ? en.resumeTitle : en.projectsTitle;
  const path = PATHS[page];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name, item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: here, item: abs(path) },
    ],
  };
}

export function jsonLd(page) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      url: `${ORIGIN}/`,
      name: tx(profile.name, 'en'),
      inLanguage: ['en', 'he'],
      description: DESC.en.home,
      publisher: { '@id': `${ORIGIN}/#person` },
    },
    personNode(),
  ];
  if (page === 'resume' || page === 'projects') graph.push(crumbs(page));
  if (page === 'projects') {
    graph.push({
      '@type': 'ItemList',
      name: DESC.en.projects,
      itemListElement: (projects || []).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: tx(p.name, 'en'),
        description: tx(p.description, 'en'),
        url: p.links?.live || (p.id ? `${ORIGIN}/projects#${p.id}` : undefined),
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function pageTitle(page) {
  const en = strings('en');
  const name = tx(profile.name, 'en');
  const label = page === 'chat' ? null : page === 'login' ? en.adminSignIn : (en.nav[page] || null);
  return label ? `${label} · ${name}` : name;
}

/** Keeps the tab, share cards, canonical URL, and structured data in step with the route. */
export function useSeo(page, lang) {
  useEffect(() => {
    const path = PATHS[page] || '/';
    const copy = DESC[lang === 'he' ? 'he' : 'en'];
    const desc = copy[page] || copy.home;
    const title = pageTitle(page);
    const admin = page === 'login' || page === 'settings' || page === 'conversations';
    document.title = title;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', abs(path));
    setMeta('property', 'og:site_name', tx(profile.name, 'en'));
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:url', abs(path));
    setMeta('name', 'twitter:image:alt', `${tx(profile.name, 'en')} — AI Solutions Engineer`);
    setMeta('property', 'og:image:type', 'image/png');
    setMeta('property', 'og:locale', lang === 'he' ? 'he_IL' : 'en_US');
    setMeta('name', 'robots', admin || !knownPath() ? 'noindex, nofollow' : 'index, follow');
    setMeta('name', 'theme-color', '#f2f4f8');
    setMeta('name', 'color-scheme', 'light');
    setLink('canonical', abs(path));
    if (profile.contact?.linkedin) setLink('me', profile.contact.linkedin);
    const ld = document.getElementById('site-jsonld');
    if (ld) ld.textContent = JSON.stringify(jsonLd(admin ? 'chat' : page));
  }, [page, lang]);
}
