import { sql } from './db.js';

/*
 * Every visitor conversation, kept so the admin can see what recruiters ask.
 * A conversation belongs to the visitor id that started it: a later write with
 * the same conversation id but another visitor id is ignored, so guessing an
 * id does not let anyone overwrite someone else's thread.
 */

function titleOf(messages) {
  const first = messages.find((m) => m.role === 'user');
  const text = first ? first.content.replace(/\s+/g, ' ').trim() : '';
  return text.length > 90 ? `${text.slice(0, 87)}…` : text;
}

export async function saveConversation({ id, visitorId, lang, messages, ipHash, country, city, userAgent }) {
  const json = JSON.stringify(messages);
  await sql`
    insert into conversations (id, visitor_id, lang, title, messages, message_count, country, city, user_agent, ip_hash)
    values (${id}, ${visitorId}, ${lang}, ${titleOf(messages)}, ${json}::jsonb, ${messages.length},
            ${country}, ${city}, ${userAgent}, ${ipHash})
    on conflict (id) do update set
      messages = excluded.messages,
      message_count = excluded.message_count,
      lang = excluded.lang,
      updated_at = now()
    where conversations.visitor_id = excluded.visitor_id
  `;
}

export async function listConversations({ limit = 50, before = null } = {}) {
  const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const rows = before
    ? await sql`
        select id, visitor_id, lang, title, message_count, country, city, created_at, updated_at
        from conversations where updated_at < ${before}
        order by updated_at desc limit ${n}`
    : await sql`
        select id, visitor_id, lang, title, message_count, country, city, created_at, updated_at
        from conversations order by updated_at desc limit ${n}`;
  const [{ total }] = await sql`select count(*)::int as total from conversations`;
  const [{ visitors }] = await sql`select count(distinct visitor_id)::int as visitors from conversations`;
  return { conversations: rows, total, visitors };
}

export async function getConversation(id) {
  const [row] = await sql`
    select id, visitor_id, lang, title, messages, message_count, country, city, user_agent, created_at, updated_at
    from conversations where id = ${id}`;
  if (row && typeof row.messages === 'string') row.messages = JSON.parse(row.messages);
  return row || null;
}

export async function deleteConversation(id) {
  await sql`delete from conversations where id = ${id}`;
}
