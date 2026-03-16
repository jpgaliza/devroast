# Shame Leaderboard Page

## Overview
Full-page leaderboard displaying the worst code submissions ranked by score (lower = worse). Accessible via `/leaderboard` route and linked from navbar.

## Location
- Route: `/leaderboard` (`src/app/leaderboard/page.tsx`)
- Components: `LeaderboardEntry` (`src/components/ui/LeaderboardEntry.tsx`)

## Layout

### Hero Section
- **Title**: `> shame_leaderboard` (prefix green, title white, JetBrains Mono)
  - Prefix: 32px, #10b981
  - Text: 28px, #e5e5e5, bold
- **Subtitle**: `// the most roasted code on the internet` (IBM Plex Mono, 14px, #a3a3a3)
- **Stats**: `2,847 submissions · avg score: 4.2/10` (IBM Plex Mono, 12px, #737373)

### Leaderboard Entries
Each entry is a `LeaderboardEntry` component with:

#### Meta Row (48px height)
- **Left side**:
  - Rank: `# 1` (# gray, number amber-bold, JetBrains Mono 13px)
  - Score: `score: 1.2` (label gray, value colored by severity)
    - `< 2.0`: Red (#ef4444)
    - `2.0-3.5`: Amber (#f59e0b)
    - `> 3.5`: Gray (#a3a3a3)
- **Right side**:
  - Language: `javascript` (gray, JetBrains Mono 12px)
  - Lines: `3 lines` (light gray, JetBrains Mono 12px)

#### Code Block (120px height)
- **Background**: #111111
- **Line numbers column** (40px wide):
  - Background: #171717
  - Right border
  - Numbers: right-aligned, gray, JetBrains Mono 12px
- **Code area**:
  - Plain text (no syntax highlighting for now)
  - JetBrains Mono 12px, 20px line-height
  - White text (#e5e5e5)

## Spacing
- Hero section: 40px bottom margin
- Between entries: 20px gap
- Bottom spacing: 80px

## Data Structure
```typescript
interface LeaderboardData {
  rank: number;
  score: number;
  code: string;
  language: string;
  lines: number;
}
```

## Future Enhancements
- [ ] Real-time data from API
- [ ] Syntax highlighting via Shiki (client-side or server-rendered)
- [ ] Pagination or infinite scroll
- [ ] Filters (by language, score range, date)
- [ ] Share/vote buttons
- [ ] Code expand/collapse for long snippets
