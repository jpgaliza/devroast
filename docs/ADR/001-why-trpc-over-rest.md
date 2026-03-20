# ADR 001: Why tRPC Over REST

- Status: Accepted
- Date: 2026-03-20

## Context

The project needs a backend API layer for AI roast generation, leaderboard queries, and home metrics. The team is building a TypeScript-first app with Next.js App Router and wants:

- End-to-end type safety between client and server
- Minimal API boilerplate
- Fast iteration for product experiments
- Consistent error handling and input validation patterns

Traditional REST endpoints would require duplicated contracts and manual client typings, increasing maintenance cost for a small team.

## Decision

Use tRPC as the application API layer.

- Define procedures and schemas once in the server router
- Share inferred types with the client for zero-copy contracts
- Keep transport internal to the app while preserving procedure boundaries
- Use Zod validation at procedure boundaries for runtime safety

## Consequences

Positive:

- Reduced contract drift between frontend and backend
- Faster refactors due to compile-time type feedback
- Better developer experience for product iteration

Trade-offs:

- API shape is framework-coupled to TypeScript/tRPC internals
- Public third-party API exposure would likely require a separate REST/HTTP boundary

Operational note:

- If an external public API is needed later, add a translation layer at the edge while keeping internal domain logic in tRPC routers.
