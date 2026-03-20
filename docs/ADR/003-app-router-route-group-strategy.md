# ADR 003: App Router Route Group Strategy

- Status: Accepted
- Date: 2026-03-20

## Context

The app uses shared navigation in most pages, but some surfaces (such as share-specific pages and generated assets) may need distinct layout behavior. Without a clear route-group policy, duplicate route trees and layout drift can appear.

## Decision

Adopt a route-group-first layout strategy in Next.js App Router.

- Keep canonical user-facing pages under dedicated route groups (for example, with shared navbar)
- Use nested layouts only when they provide real UI or behavior differences
- Avoid duplicate parallel route trees for the same feature
- Keep generated assets and share-specific routes separate only when behavior requires it

## Consequences

Positive:

- Lower chance of duplicated logic and route confusion
- Clear ownership of shared layout concerns
- Easier onboarding with predictable routing conventions

Trade-offs:

- Refactors across route groups require careful path verification
- Teams must be explicit about canonical route ownership

Operational note:

- During maintenance, treat duplicate route structures as a code smell and consolidate to one canonical tree.
