import { sql } from './db.js';

/*
 * Fixed-window counters in Postgres. Serverless functions share no memory, so
 * the count has to live somewhere every instance can see.
 *
 * The chat is open to anyone and runs on your API key; these numbers are what
 * stands between a curious recruiter and someone burning your credit with a
 * script. Each answer is capped at MAX_TOKENS too (see chat.js).
 */
export const LIMITS = {
  perIpBurst: { windowSec: 10 * 60, max: 20 },      // 20 messages / 10 min per visitor
  perIpDay:   { windowSec: 24 * 60 * 60, max: 80 }, // 80 messages / day per visitor
  globalDay:  { windowSec: 24 * 60 * 60, max: 1500 }, // 1,500 messages / day in total
  loginFail:  { windowSec: 15 * 60, max: 8 },       // 8 wrong passwords / 15 min per IP
};

/** Counts one hit and returns whether it is still within the limit. */
export async function hit(bucket, { windowSec, max }) {
  const [row] = await sql`
    insert into rate_hits (bucket, window_start, hits)
    values (${bucket}, to_timestamp(floor(extract(epoch from now()) / ${windowSec}) * ${windowSec}), 1)
    on conflict (bucket, window_start) do update set hits = rate_hits.hits + 1
    returning hits
  `;
  // Old windows are never read again; sweep them now and then.
  if (Math.random() < 0.02) {
    sql`delete from rate_hits where window_start < now() - interval '2 days'`.catch(() => {});
  }
  return Number(row.hits) <= max;
}

/** Reads a counter without adding to it. */
export async function peek(bucket, { windowSec, max }) {
  const [row] = await sql`
    select hits from rate_hits
    where bucket = ${bucket}
      and window_start = to_timestamp(floor(extract(epoch from now()) / ${windowSec}) * ${windowSec})
  `;
  return !row || Number(row.hits) < max;
}
