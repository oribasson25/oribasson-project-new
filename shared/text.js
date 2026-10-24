/*
 * Content fields are either one value for both languages or { en, he }.
 * These pick the right one, falling back to whichever language is filled in.
 */
export function tx(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value[lang] || value.en || value.he || '';
}

/** A bullet is a string, or { title, text } for a bold lead-in ("Eval pipelines: built…"). */
export function bullet(item) {
  if (item && typeof item === 'object') return { title: item.title || '', text: item.text || '' };
  return { title: '', text: String(item || '') };
}

/** "2023 – 2024", "2023" when both ends are the same year, "2024 – present". */
export function span(start, end, present) {
  if (!start && !end) return '';
  if (start && end && start === end) return String(start);
  return `${start || '?'} – ${end || present}`;
}

export function tl(value, lang) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const own = value[lang];
  if (Array.isArray(own) && own.length) return own;
  return value.en || value.he || [];
}
