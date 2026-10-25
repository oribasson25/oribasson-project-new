# Ori Basson — personal site

A portfolio for recruiters, built on the 8Legs.ai design: a ChatGPT-style home
screen where visitors ask an AI about Ori, a Resume page, a Projects page, and
the questions each visitor asked in the sidebar. The animated figure is Ori's
Codex pet. English and Hebrew, switchable.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
```

No database or environment variables are needed locally: the server falls back
to a built-in Postgres in `.data/`, and the admin password is `admin`.
Open `/admin`, sign in, and paste a Claude API key to make the chat answer.

## Fill in your content

Everything the site shows — and everything the chatbot knows — comes from
`content/`. Edit, commit, push; Vercel redeploys.

| File | What it holds |
|---|---|
| `content/profile.js` | Name, headline, contact links, resume PDF, pronouns, and free-text "about" for the chatbot |
| `content/resume.js` | Summary, experience, education, skills, languages, certifications |
| `content/projects.js` | Project cards |
| `content/questions.js` | The ready-made questions under the chat box |

Each file has a commented example. Any text can be one string or `{ en, he }`.
Set `pronouns` in `profile.js` — Hebrew grammar needs it, and without it the
chatbot has to guess.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it in Vercel
   (the framework is detected as Vite).
2. **Storage → Create → Neon Postgres**, connect it to the project. This sets
   `DATABASE_URL`. Tables are created on the first request.
3. **Settings → Environment Variables**:
   - `ADMIN_PASSWORD` — the password for `/admin`
   - `SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
4. Deploy, open `https://<your-domain>/admin`, sign in, paste the Claude API
   key, pick the model.

## How it fits together

```
content/        your resume, projects, questions (the only files to edit)
src/            the React app (Vite)
api/            Vercel functions
  chat.js         POST — streams one answer (Server-Sent Events)
  status.js       GET  — is the chat online
  admin/          login, logout, me, settings, conversations
server/         code the functions share: db, auth, secrets, prompt, limits
public/pet/     the spritesheet (Codex pet v2 layout: 8×11 cells of 192×208)
```

- **The API key never reaches a browser.** It is stored AES-256-GCM encrypted
  in Postgres and used only inside `api/chat.js`. The admin screen shows its
  last four characters.
- **Abuse limits** (`server/ratelimit.js`): 20 messages per 10 minutes and 80
  per day per visitor, 1,500 per day site-wide, 4,096 output tokens per
  answer, 2,000 characters per question.
- **The system prompt** (`server/prompt.js`) is built from `content/` and is
  byte-identical on every request, so prompt caching applies.
- **Conversations** are saved server-side for the admin's Conversations
  screen; visitors are told so under the chat box. IPs are stored only as a
  keyed hash.
- **Models**: Claude Opus 5.5 by default; Sonnet 5.5 and Haiku 4.5 are
  cheaper choices in the admin screen. Opus and Sonnet requests use
  server-side refusal fallbacks.
