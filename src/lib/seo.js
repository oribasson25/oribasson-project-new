import { useEffect } from 'react';
import profile from '../../content/profile.js';
import resume from '../../content/resume.js';
import projects from '../../content/projects.js';
import { tx, tl, bullet } from '../../shared/text.js';
import { strings } from '../i18n.js';

export const ORIGIN = 'https://oribasson.com';

const DESC = {
  en: {
    home: 'Ori Basson — AI Solutions Engineer. Production LLM agents, a resume, projects, and an AI chat that answers from the published work.',
    resume: 'Resume of Ori Basson, AI Solutions Engineer — production LLM agents, tooling, evaluation, and claims operations.',
    projects: 'Projects by Ori Basson: production AI agents at Libra Insurance, an HR recruitment system, and 8Legs.ai.',
    missing: 'That address does not match a page on Ori Basson\'s site.',
  },
  he: {
    home: 'אורי בסון — הנדסת פתרונות AI. סוכני LLM בפרודקשן, קורות חיים, פרויקטים, וצ׳אט AI שעונה מתוך החומר שפורסם.',
    resume: 'קורות החיים של אורי בסון — הנדסת פתרונות AI, סוכני LLM בפרודקשן, כלים והערכה.',
    projects: 'הפרויקטים של אורי בסון: סוכני AI בליברה ביטוח, מערכת גיוס, ו-8Legs.ai.',
    missing: 'הכתובת הזו לא מתאימה לעמוד באתר של אורי בסון.',
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

/** A share card stays one or two lines. The cut is on a word, from real copy. */
function clipShare(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  const max = 180;
  if (value.length <= max) return value;
  const head = value.slice(0, max);
  const stop = head.lastIndexOf('. ');
  if (stop >= 80) return head.slice(0, stop + 1);
  const space = head.lastIndexOf(' ');
  return `${head.slice(0, space > 80 ? space : max).trim()}…`;
}

/** The line a shared role or project should carry. The page line is the fallback. */
function shareDescription(page, hash, lang) {
  const language = lang === 'he' ? 'he' : 'en';
  const copy = DESC[language];
  if (page === 'projects' && hash) {
    const project = (projects || []).find((p) => p.id === hash);
    const line = project && (tx(project.tagline, language) || tx(project.description, language));
    if (line) return clipShare(line);
  }
  if (page === 'resume' && hash) {
    const job = (resume.experience || []).find((item) => item.id === hash);
    if (job) {
      const summary = tx(job.summary, language);
      if (summary) return clipShare(summary);
      const first = tl(job.highlights, language)[0];
      if (first) {
        const { title, text } = bullet(first);
        return clipShare(title ? `${title}. ${text}` : text);
      }
    }
    const school = (resume.education || []).find((item) => item.id === hash);
    const details = school && tx(school.details, language);
    if (details) return clipShare(details);
  }
  return copy[page] || copy.home;
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

function removeLink(rel) {
  document.head.querySelector(`link[rel="${rel}"]`)?.remove();
}

/** The lines the resume actually shows, so a crawler does not stop at the job title. */
function jobDescription(job, { tech = true } = {}) {
  const summary = tx(job.summary, 'en');
  const highlights = tl(job.highlights, 'en').map((item) => {
    const { title, text } = bullet(item);
    return title ? `${title}: ${text}` : text;
  }).filter(Boolean);
  const parts = [summary, ...highlights].filter(Boolean);
  if (tech && (job.tech || []).length) parts.push(`Tech: ${job.tech.join(', ')}.`);
  return parts.length ? parts.join(' ') : undefined;
}

function personNode() {
  const job = (resume.experience || [])[0];
  const company = job ? tx(job.company, 'en') : '';
  const occupations = (resume.experience || []).map((item) => {
    const name = tx(item.role, 'en');
    if (!name) return null;
    const employer = tx(item.company, 'en');
    const when = item.start && item.end && String(item.start) === String(item.end)
      ? String(item.start)
      : item.start
        ? `${item.start}–${item.end || 'present'}`
        : (item.end || '');
    const where = [employer, when].filter(Boolean).join(', ');
    const body = jobDescription(item, { tech: false });
    const description = [where, body].filter(Boolean).join('. ') || undefined;
    const skills = (item.tech || []).filter(Boolean).join(', ') || undefined;
    return {
      '@type': 'Occupation',
      name,
      description,
      skills,
    };
  }).filter(Boolean);
  const schools = (resume.education || []).map((e) => tx(e.school, 'en')).filter(Boolean);
  const credentials = (resume.education || []).map((e) => {
    const name = tx(e.degree, 'en');
    const org = tx(e.school, 'en');
    if (!name) return null;
    const details = tx(e.details, 'en');
    return {
      '@type': 'EducationalOccupationalCredential',
      name,
      description: details || undefined,
      url: e.id ? `${ORIGIN}/resume#${e.id}` : undefined,
      recognizedBy: org ? { '@type': 'EducationalOrganization', name: org } : undefined,
    };
  }).filter(Boolean);
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
    hasOccupation: occupations.length > 1 ? occupations : (occupations[0] || undefined),
    alumniOf: schools.length === 1
      ? { '@type': 'EducationalOrganization', name: schools[0] }
      : (schools.length ? schools.map((name) => ({ '@type': 'EducationalOrganization', name })) : undefined),
    hasCredential: credentials.length === 1 ? credentials[0] : (credentials.length ? credentials : undefined),
    knowsLanguage: (resume.languages || []).map((l) => tx(l.name, 'en')).filter(Boolean),
    knowsAbout: knowsAbout.length ? knowsAbout : undefined,
    description: tx(resume.summary, 'en'),
  };
}

function projectList() {
  const items = (projects || []).filter((p) => p.id && tx(p.name, 'en'));
  if (!items.length) return null;
  return {
    '@type': 'ItemList',
    '@id': `${ORIGIN}/projects#list`,
    name: DESC.en.projects,
    itemListElement: items.map((p, i) => {
      const name = tx(p.name, 'en');
      const description = tx(p.description, 'en') || undefined;
      const url = `${ORIGIN}/projects#${p.id}`;
      const keywords = (p.tech || []).filter(Boolean).join(', ');
      const sameAs = [p.links?.live, p.links?.repo].filter(Boolean);
      return {
        '@type': 'ListItem',
        position: i + 1,
        name,
        description,
        url,
        item: {
          '@type': 'CreativeWork',
          name,
          description,
          url,
          sameAs: sameAs.length ? sameAs : undefined,
          creator: { '@id': `${ORIGIN}/#person` },
          dateCreated: p.year || undefined,
          keywords: keywords || undefined,
        },
      };
    }),
  };
}

function experienceList() {
  const jobs = (resume.experience || []).map((job, i) => {
    const role = tx(job.role, 'en');
    const company = tx(job.company, 'en');
    if (!role) return null;
    return {
      '@type': 'ListItem',
      position: i + 1,
      name: company ? `${role}, ${company}` : role,
      url: job.id ? `${ORIGIN}/resume#${job.id}` : undefined,
      item: {
        '@type': 'OrganizationRole',
        roleName: role,
        startDate: job.start || undefined,
        endDate: job.end || undefined,
        description: jobDescription(job),
        url: job.id ? `${ORIGIN}/resume#${job.id}` : undefined,
      },
    };
  }).filter(Boolean);
  if (!jobs.length) return null;
  return {
    '@type': 'ItemList',
    '@id': `${ORIGIN}/resume#experience`,
    name: strings('en').experience,
    itemListElement: jobs,
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

function pageNode(page, mainEntity) {
  const path = PATHS[page] || '/';
  const home = page === 'chat';
  return {
    '@type': home ? 'ProfilePage' : 'WebPage',
    '@id': home ? `${ORIGIN}/#profile` : `${abs(path)}#page`,
    url: abs(path),
    name: pageTitle(page),
    description: DESC.en[page] || DESC.en.home,
    inLanguage: ['en', 'he'],
    isPartOf: { '@id': `${ORIGIN}/#website` },
    about: { '@id': `${ORIGIN}/#person` },
    mainEntity: home ? { '@id': `${ORIGIN}/#person` } : mainEntity,
  };
}

export function jsonLd(page) {
  const list = page === 'chat' || page === 'resume' || page === 'projects' ? projectList() : null;
  const roles = page === 'resume' ? experienceList() : null;
  const main = page === 'projects' && list ? { '@id': list['@id'] }
    : page === 'resume' && roles ? { '@id': roles['@id'] }
      : undefined;
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
    pageNode(page, main),
  ];
  if (roles) graph.push(roles);
  if (list) graph.push(list);
  if (page === 'resume' || page === 'projects') graph.push(crumbs(page));
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** English head for a crawler that does not run the script. The tab stays English either way. */
export function staticHead(page) {
  const path = PATHS[page] || '/';
  return {
    title: pageTitle(page),
    description: DESC.en[page] || DESC.en.home,
    url: abs(path),
    jsonLd: jsonLd(page),
  };
}

export function pageTitle(page) {
  const en = strings('en');
  const name = tx(profile.name, 'en');
  const label = page === 'chat' ? null
    : page === 'missing' ? en.notFoundTitle
      : page === 'login' ? en.adminSignIn
        : (en.nav[page] || null);
  return label ? `${label} · ${name}` : name;
}

/** The tab stays in English. A project or a role address names that one. */
export function titleFor(page, hash) {
  const person = tx(profile.name, 'en');
  if (page === 'projects' && hash) {
    const project = (projects || []).find((p) => p.id === hash);
    const name = project && tx(project.name, 'en');
    if (name) return `${name} · ${person}`;
  }
  if (page === 'resume' && hash) {
    const job = (resume.experience || []).find((item) => item.id === hash);
    const role = job && tx(job.role, 'en');
    const company = job && tx(job.company, 'en');
    if (role) return `${company ? `${role}, ${company}` : role} · ${person}`;
    const school = (resume.education || []).find((item) => item.id === hash);
    const degree = school && tx(school.degree, 'en');
    if (degree) return `${degree} · ${person}`;
  }
  return pageTitle(page);
}

/** Keeps the tab, share cards, canonical URL, and structured data in step with the route. */
export function useSeo(page, lang, hash) {
  useEffect(() => {
    function apply() {
      const path = PATHS[page] || '/';
      // The address bar is the source of truth: opening a card updates the
      // hash without a navigation, and the tab should follow it.
      const liveHash = page === 'projects' || page === 'resume'
        ? window.location.hash.replace(/^#/, '')
        : '';
      const desc = shareDescription(page, liveHash, lang);
      const title = titleFor(page, liveHash);
      const admin = page === 'login' || page === 'settings' || page === 'conversations';
      const missing = page === 'missing' || !knownPath();
      const here = missing ? (window.location.pathname.replace(/\/+$/, '') || '/') : path;
      document.title = title;
      setMeta('name', 'description', desc);
      setMeta('property', 'og:title', title);
      setMeta('property', 'og:description', desc);
      setMeta('property', 'og:url', abs(here));
      setMeta('property', 'og:site_name', tx(profile.name, 'en'));
      setMeta('name', 'twitter:title', title);
      setMeta('name', 'twitter:description', desc);
      setMeta('name', 'twitter:url', abs(here));
      const imageAlt = `${tx(profile.name, 'en')} — AI Solutions Engineer`;
      setMeta('property', 'og:image:alt', imageAlt);
      setMeta('name', 'twitter:image:alt', imageAlt);
      setMeta('property', 'og:image:type', 'image/png');
      setMeta('property', 'og:locale', lang === 'he' ? 'he_IL' : 'en_US');
      setMeta('name', 'robots', admin || missing ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
      setMeta('name', 'theme-color', '#f2f4f8');
      setMeta('name', 'color-scheme', 'light');
      // A missing address is not the homepage. A canonical pointing there would
      // ask a crawler to treat the typo as the front page.
      if (missing) removeLink('canonical');
      else setLink('canonical', abs(path));
      if (profile.contact?.linkedin) setLink('me', profile.contact.linkedin);
      const ld = document.getElementById('site-jsonld');
      if (ld) {
        const data = missing
          ? {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: strings('en').notFoundTitle,
              isPartOf: { '@id': `${ORIGIN}/#website` },
            }
          : jsonLd(admin ? 'chat' : page);
        // The graph stays in English, like the rest of the structured data.
        if (!missing && data['@graph'] && liveHash) {
          const node = data['@graph'].find((item) => item['@type'] === 'WebPage');
          const line = shareDescription(page, liveHash, 'en');
          if (node && line) node.description = line;
        }
        ld.textContent = JSON.stringify(data);
      }
    }
    apply();
    // Opening or closing a card writes the address without a navigation.
    window.addEventListener('ob-address', apply);
    return () => window.removeEventListener('ob-address', apply);
  }, [page, lang, hash]);
}
