import { neon } from '@neondatabase/serverless';

/*
 * One tagged-template `sql` for the whole server.
 *
 * Deployed, it is Neon (DATABASE_URL, or POSTGRES_URL as the Vercel
 * marketplace names it). On a laptop with neither set it is PGlite — a real
 * Postgres compiled to WASM, kept in .data/ — so `npm run dev` works with no
 * database to create first. Deployed with no URL is an error, not a fallback:
 * a site that forgets its settings on every cold start is worse than one that
 * says why it cannot start.
 */
const URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const DEPLOYED = !!process.env.VERCEL;

let driver = null;

async function getDriver() {
  if (driver) return driver;
  if (URL) {
    const q = neon(URL);
    driver = (strings, values) => q(strings, ...values);
    return driver;
  }
  if (DEPLOYED) {
    throw Object.assign(new Error('DATABASE_URL is not set. Connect a Neon database to the Vercel project.'), { code: 'NO_DATABASE' });
  }
  // Held in a variable so the deploy bundler does not trace it into a function.
  const mod = '@electric-sql/pglite';
  const { PGlite } = await import(/* @vite-ignore */ mod);
  const fs = await import('fs');
  fs.mkdirSync('./.data', { recursive: true });
  const pg = new PGlite('./.data/pglite');
  await pg.waitReady;
  driver = async (strings, values) => {
    const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
    const result = await pg.query(text, values);
    return result.rows;
  };
  return driver;
}

let schemaReady = null;

function ensureSchema(run) {
  if (!schemaReady) {
    schemaReady = (async () => {
      const t = (s) => Object.assign([s], { raw: [s] });
      await run(t(`create table if not exists site_settings (
        id int primary key,
        api_key_enc text,
        model text,
        chat_enabled boolean not null default true,
        updated_at timestamptz not null default now()
      )`), []);
      await run(t(`create table if not exists conversations (
        id uuid primary key,
        visitor_id text not null,
        lang text,
        title text,
        messages jsonb not null default '[]'::jsonb,
        message_count int not null default 0,
        country text,
        city text,
        user_agent text,
        ip_hash text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )`), []);
      await run(t(`create index if not exists conversations_updated_idx on conversations (updated_at desc)`), []);
      await run(t(`create table if not exists rate_hits (
        bucket text not null,
        window_start timestamptz not null,
        hits int not null default 0,
        primary key (bucket, window_start)
      )`), []);
    })().catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
}

/** sql`select … where id = ${id}` — values are always sent as parameters. */
export async function sql(strings, ...values) {
  const run = await getDriver();
  await ensureSchema(run);
  return run(strings, values);
}
