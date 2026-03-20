# ADR 002: Tailwind CSS Variables Approach

- Status: Accepted
- Date: 2026-03-20

## Context

The product uses a custom visual language with terminal-inspired colors and typography. Design tokens must be easy to evolve without touching many components and should work consistently across server and client rendering.

The codebase already centralizes theme values in globals.css using Tailwind v4 @theme tokens.

## Decision

Use CSS custom properties in globals.css as the single source of truth for design tokens, surfaced through Tailwind utility classes.

- Keep semantic tokens (page, surface, text, border, accent) in one place
- Reference tokens via Tailwind classes instead of hardcoded color literals in components
- Keep the app dark-theme only unless a dedicated theming project is approved

## Consequences

Positive:

- Consistent styling language across components
- Faster global visual changes with low regression risk
- Cleaner component code with fewer hardcoded values

Trade-offs:

- Requires discipline to avoid ad-hoc color literals in component files
- Token naming must remain stable to avoid large refactors

Operational note:

- Tailwind config should avoid conflicting color definitions when equivalent tokens already exist in globals.css.
