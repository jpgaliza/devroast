# devroast

**Paste your code. Get roasted.**

devroast is a web app that gives your code a brutally honest review. Drop in a snippet, hit submit, and get an AI-generated score with no-holds-barred feedback on what you wrote.

## Features

- **Code input** — A terminal-style editor where you paste your code, complete with line numbers and syntax highlighting.
- **Roast mode** — Toggle between a constructive code review and full roast mode with maximum sarcasm.
- **Score & feedback** — Every submission gets a score out of 10 and detailed feedback pointing out what's wrong (and occasionally what's right).
- **Shame leaderboard** — The worst code on the internet, ranked by shame. See how your snippet stacks up against the hall of infamy.
- **Share card** — Dedicated share page plus dynamic Open Graph image for each roast result.

## Stack

- Next.js 16 + App Router
- React 19
- tRPC + TanStack Query
- Drizzle ORM + PostgreSQL
- Tailwind CSS v4 + CSS variables (`@theme`)
- Shiki syntax highlighting

## How it works

1. Paste your code into the editor
2. Toggle roast mode on or off
3. Hit **$ roast_my_code**
4. Get your score and feedback
5. If it's bad enough, you might end up on the leaderboard

## Running locally

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env.local` and set your API key.

Required values:

- `DATABASE_URL` (defaults to local Docker Postgres on port `5433`)
- `NEXT_PUBLIC_APP_URL` (defaults to `http://localhost:3000`)
- `OPENAI_API_KEY`

### 3) Start database

```bash
docker compose up -d
```

### 4) Sync schema

```bash
npm run db:push
```

### 5) Run app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful scripts

- `npm run dev` — run development server
- `npm run build` — production build
- `npm run build:analyze` — build with bundle analyzer
- `npm run db:push` — sync Drizzle schema to database
- `npm run db:studio` — open Drizzle Studio
- `npm run db:seed` — seed sample data

## Deploy on Vercel

### 1) Push your repository

Push this project to GitHub, GitLab, or Bitbucket.

### 2) Provision a production PostgreSQL database

Use a managed Postgres provider (for example: Vercel Postgres, Neon, Supabase, Railway, Render).

Copy the full connection string and keep it ready as `DATABASE_URL`.

### 3) Import the project into Vercel

1. Open Vercel dashboard
2. Click **Add New... > Project**
3. Import your repository
4. Keep framework preset as **Next.js**
5. Build command: `npm run build`
6. Install command: `npm install`

### 4) Configure environment variables in Vercel

Set these variables for **Production** (and optionally **Preview**):

- `DATABASE_URL` = your managed Postgres URL
- `OPENAI_API_KEY` = your API key used by `src/lib/ai.ts`
- `NEXT_PUBLIC_APP_URL` = your public app URL (example: `https://your-app.vercel.app`)

Notes:

- Do not use local Docker database settings in production.
- `NEXT_PUBLIC_APP_URL` is used to build absolute URLs for sharing and metadata.

### 5) Apply database schema to production

After setting production `DATABASE_URL`, apply schema:

```bash
npm run db:push
```

Run this command from your machine (or CI) with environment variables pointing to production.

### 6) Deploy

Trigger your first deployment in Vercel. After deploy succeeds, validate:

1. Home page loads
2. New roast submission works
3. Result page opens
4. Share page and Open Graph image render correctly

### 7) Ongoing updates

For schema changes in future releases:

1. Update schema in code
2. Deploy app changes
3. Run `npm run db:push` against production database

If you prefer stricter migration history, switch from `db:push` to generated SQL migrations before larger production releases.
