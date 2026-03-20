# AGENTS.md — devroast

## Overview

devroast is a web app where developers paste code and receive brutally honest AI-powered code reviews ("roasts"). It features a roast/normal toggle, a public shame leaderboard, and a dark terminal-inspired UI.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS v4 with `@theme` tokens in `globals.css`
- **Variants**: `class-variance-authority` (cva) + `tailwind-merge`
- **Syntax Highlighting**: Shiki
- **Linter/Formatter**: Biome

## Project Structure

```
src/
  app/
    layout.tsx                      # Root layout (next/font + providers)
    globals.css                     # @theme tokens (single source of truth)
    (with-nav)/
      layout.tsx                    # Shared navbar layout
      page.tsx                      # Home page
      leaderboard/page.tsx          # Leaderboard page
      result/[id]/page.tsx          # Result page
    result/[id]/
      share/page.tsx                # Share preview page (HTML)
      opengraph-image.tsx           # Share image endpoint (PNG)
  components/ui/
    AGENTS.md                       # Component-level standards
    index.ts                        # Barrel exports
  trpc/routers/                     # leaderboard, metrics, roast
  db/                               # schema, client, seed
```

## Global Patterns

- **Design tokens**: All colors and fonts are CSS variables defined in `globals.css` via `@theme`. Use Tailwind classes that reference these tokens (e.g., `text-text-primary`, `bg-bg-surface`, `border-border-primary`).
- **Fonts**: JetBrains Mono (`font-jb`) and IBM Plex Mono (`font-ibm`) are loaded via `next/font/google` in `src/app/layout.tsx` and exposed through CSS variables.
- **Component standards**: Follow `src/components/ui/AGENTS.md` for all component creation — use `cva`, `twMerge`, `forwardRef`, named exports, and `displayName`.
- **No default exports** in components. Only page files (`page.tsx`) use default exports.
- **Dark theme only**: The app uses a single dark color scheme (`bg-page: #0C0C0C`). There is no light mode.
- **Terminal aesthetic**: UI elements mimic a code editor — monospace fonts, `$` and `//` prefixes, window dots, line numbers, syntax colors.
- **Result sharing flow**: sharing should use `/result/[id]/share` as the public URL, and that page handles the share preview experience.
