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
  app/              # Pages and layouts (App Router)
    globals.css     # Design tokens (@theme) — single source of truth for colors/fonts
    layout.tsx      # Root layout (Navbar, font loading)
    page.tsx        # Home page (code input, roast toggle, leaderboard preview)
  components/ui/    # Reusable UI components
    AGENTS.md       # Component-level standards (read before creating components)
    index.ts        # Barrel exports
```

## Global Patterns

- **Design tokens**: All colors and fonts are CSS variables defined in `globals.css` via `@theme`. Use Tailwind classes that reference these tokens (e.g., `text-text-primary`, `bg-bg-surface`, `border-border-primary`).
- **Fonts**: JetBrains Mono (`font-jb`) for headings, code, nav, and buttons. IBM Plex Mono (`font-ibm`) for body text and subtitles. Loaded via Google Fonts CDN in `layout.tsx`.
- **Component standards**: Follow `src/components/ui/AGENTS.md` for all component creation — use `cva`, `twMerge`, `forwardRef`, named exports, and `displayName`.
- **No default exports** in components. Only page files (`page.tsx`) use default exports.
- **Dark theme only**: The app uses a single dark color scheme (`bg-page: #0C0C0C`). There is no light mode.
- **Terminal aesthetic**: UI elements mimic a code editor — monospace fonts, `$` and `//` prefixes, window dots, line numbers, syntax colors.
