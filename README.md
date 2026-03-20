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
