import projects from '../../content/projects.js';
import { tx } from '../../shared/text.js';

/*
 * Which architecture, if any, belongs under a chat answer.
 *
 * The question has to name exactly one project, in English or Hebrew.
 * The model may confirm it with [[project:id]] on its own line. A marker
 * for a different project, or two names in the question, draws nothing —
 * a wrong diagram is worse than none. The marker itself is never shown.
 */

const MARKER = /\[\[project:([a-z0-9-]+)\]\]/g;
const DANGLING = /[ \t]*\[\[project(?::[a-z0-9-]*)?\]?\]?\s*$/i;

/** Phrases taken from the published names. A phrase used by two projects is dropped. */
const EXTRA = {
  'claims-voice-agent': ['unified hebrew voice', 'voice and status agent', 'סוכן קולי', 'בירור סטטוס'],
  'back-office-agent': ['back-office', 'back office', 'email and document processing', 'עיבוד מיילים'],
  'live-call-intelligence': ['live call intelligence', 'call intelligence', 'מודיעין שיחות'],
  'policy-documents': ['policy document', 'מסמכי פוליסה'],
  'hr-recruitment': ['hr recruitment', 'cv matching', 'התאמת קורות חיים', 'מערכת גיוס'],
  '8legs': ['8legs'],
};

export function stripProjectMarkers(text) {
  return String(text || '')
    .replace(/\n?[ \t]*\[\[project:[a-z0-9-]+\]\][ \t]*/g, '')
    .replace(DANGLING, '')
    .replace(/\n{3,}/g, '\n\n');
}

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function phrases() {
  const list = [];
  for (const project of projects || []) {
    if (!project.id) continue;
    for (const lang of ['en', 'he']) {
      const phrase = norm(tx(project.name, lang));
      if (phrase) list.push({ id: project.id, phrase });
    }
    for (const extra of EXTRA[project.id] || []) {
      const phrase = norm(extra);
      if (phrase) list.push({ id: project.id, phrase });
    }
  }
  const owners = new Map();
  for (const item of list) {
    const set = owners.get(item.phrase) || new Set();
    set.add(item.id);
    owners.set(item.phrase, set);
  }
  return list.filter((item) => item.phrase.length >= 4 && owners.get(item.phrase).size === 1);
}

let cached = null;
function allPhrases() {
  if (!cached) cached = phrases();
  return cached;
}

export function namedProjectIds(text) {
  const hay = norm(text);
  if (!hay) return [];
  const hits = new Set();
  for (const { id, phrase } of allPhrases()) {
    if (hay.includes(phrase)) hits.add(id);
  }
  return [...hits];
}

export function markedProjectIds(text) {
  const known = new Set((projects || []).map((project) => project.id).filter(Boolean));
  const hits = new Set();
  const re = new RegExp(MARKER.source, 'g');
  let match;
  const raw = String(text || '');
  while ((match = re.exec(raw))) {
    if (known.has(match[1])) hits.add(match[1]);
  }
  return [...hits];
}

/** The one project id this answer may illustrate, or null. */
export function diagramProjectId(question, answer) {
  const named = namedProjectIds(question);
  if (named.length !== 1) return null;
  const marked = markedProjectIds(answer);
  if (marked.length > 1) return null;
  if (marked.length === 1 && marked[0] !== named[0]) return null;
  return named[0];
}
