# Spec: API Layer — tRPC + TanStack React Query (Next.js App Router)

> **Status**: Draft
> **Escopo**: Definir a camada de API/back-end do devroast com tRPC (v11), integrada ao App Router com suporte a SSR e React Server Components.

---

## TL;DR

Vamos adotar **tRPC + TanStack React Query** como camada de API tipada entre front-end e back-end, com integração nativa para **Next.js App Router**.

A abordagem segue as docs oficiais de:

- `tanstack-react-query/setup`
- `tanstack-react-query/server-components`

Objetivo principal:

- manter tipagem end-to-end;
- suportar consumo em Client Components e prefetch em Server Components;
- padronizar hidratação de cache com React Query no fluxo SSR/RSC.

---

## 1. Objetivos

1. Criar uma camada de API tipada para queries e mutations do projeto.
2. Integrar com SSR/RSC no App Router sem perder ergonomia em Client Components.
3. Evitar duplicação de tipos entre API, banco e UI.
4. Preparar base para autenticação/autorização e observabilidade futuras.

---

## 2. Escopo funcional (MVP)

### Incluído

- Router principal tRPC (`appRouter`) com namespace inicial de exemplo.
- Contexto de request para procedures server-side.
- Handler HTTP em `app/api/trpc/[trpc]/route.ts`.
- Setup do client tRPC para Client Components.
- Setup do proxy/server helpers para Server Components (prefetch + hydration).
- Integração no layout raiz com Provider.

### Fora do escopo (nesta etapa)

- Reescrever todas as features já existentes para tRPC.
- Sistema de auth completo.
- Rate limiting e cache distribuído.

---

## 3. Dependências

Instalar:

```bash
npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod superjson client-only server-only
```

### Pacotes e função

- `@trpc/server`: definição de routers/procedures no servidor.
- `@trpc/client`: transporte HTTP e consumo tipado.
- `@trpc/tanstack-react-query`: integração tRPC + Query Options + helpers para RSC.
- `@tanstack/react-query`: cache, hydration e hooks.
- `zod`: validação de input/output em procedures.
- `superjson`: serialização de tipos complexos (Date, Map etc.).
- `client-only` e `server-only`: proteção explícita de fronteira client/server.

---

## 4. Arquitetura proposta

## 4.1 Estrutura de pastas

```text
src/
  app/
    api/
      trpc/
        [trpc]/
          route.ts
  trpc/
    init.ts
    context.ts
    query-client.ts
    client.tsx
    server.tsx
    routers/
      _app.ts
      health.ts
```

## 4.2 Responsabilidades

- `trpc/init.ts`
  - Inicializa `initTRPC`.
  - Declara `publicProcedure` e futuras procedures protegidas.

- `trpc/context.ts`
  - Cria contexto por request (headers, cookies, user, db, etc.).

- `trpc/routers/_app.ts`
  - Router raiz que agrega sub-routers (`health`, `roast`, `leaderboard`, etc.).
  - Exporta tipo `AppRouter`.

- `app/api/trpc/[trpc]/route.ts`
  - Adapter fetch do tRPC para endpoint HTTP da API.

- `trpc/query-client.ts`
  - Factory de `QueryClient` com configuração SSR/RSC:
    - `staleTime` > 0
    - `dehydrate.shouldDehydrateQuery` incluindo `pending`
    - serialização compatível com `superjson`

- `trpc/client.tsx`
  - Provider para Client Components usando `createTRPCContext`.
  - `createTRPCClient` + `httpBatchLink`.
  - `useTRPC()` para consumir Query Options tipadas.

- `trpc/server.tsx`
  - Helpers para Server Components com `createTRPCOptionsProxy`.
  - `getQueryClient` estável por request (via `cache`).
  - Helpers de `prefetch` + `HydrateClient` para streaming/hydration.
  - `caller` opcional para leitura direta em Server Components (sem hidratar cache).

---

## 5. Integração com Next.js App Router (SSR/RSC)

## 5.1 Provider no layout

No layout raiz, montar um provider client-side para:

- `QueryClientProvider`
- `TRPCProvider`

Isso habilita hooks do React Query e consumo de query/mutation options em Client Components.

## 5.2 Prefetch em Server Component

Fluxo recomendado para páginas App Router:

1. Em Server Component, chamar `prefetch(trpc.algumaQuery.queryOptions(input))`.
2. Renderizar `<HydrateClient>{...client components...}</HydrateClient>`.
3. No Client Component, usar `useQuery(trpc.algumaQuery.queryOptions(input))` ou `useSuspenseQuery`.

Benefício: “render as you fetch”, com streaming de dados pelo RSC protocol.

## 5.3 Data ownership

Quando precisar usar dado no servidor e no cliente ao mesmo tempo:

- preferir `fetchQuery` no servidor (quando necessário);
- entender tradeoff de ownership/revalidation do React Query SSR.

## 5.4 Acesso direto no Server Component

Para dados apenas server-side (sem hidratar no cliente), usar `caller`:

- `const data = await caller.algumaProcedure(input)`

Essa leitura é separada do cache do Query Client por design.

---

## 6. Convenções de procedures

- Inputs com `zod` sempre obrigatórios quando houver payload.
- Estrutura inicial:
  - `health.hello`
  - `roast.create`
  - `roast.byId`
  - `leaderboard.list`
- Erros: usar `TRPCError` com códigos semânticos (`BAD_REQUEST`, `NOT_FOUND`, `UNAUTHORIZED`).
- Não acessar banco diretamente em Client Components.

---

## 7. Sequência de implementação

### Fase 1 — Foundation

- [ ] Instalar dependências.
- [ ] Criar `trpc/init.ts`, `trpc/context.ts`, `trpc/routers/_app.ts`.
- [ ] Criar `app/api/trpc/[trpc]/route.ts`.

### Fase 2 — Query Layer

- [ ] Criar `trpc/query-client.ts`.
- [ ] Criar `trpc/client.tsx` e montar provider no layout.
- [ ] Criar `trpc/server.tsx` com proxy/options + helpers de hydration.

### Fase 3 — Primeiro endpoint real

- [ ] Implementar `roast.byId` com UUID.
- [ ] Consumir no fluxo da página de resultado usando prefetch/hydration.

### Fase 4 — Expansão

- [ ] Migrar leaderboard para `leaderboard.list`.
- [ ] Migrar submit para `roast.create`.

---

## 8. Critérios de aceitação

1. Build e typecheck passando com tRPC integrado.
2. Endpoint `/api/trpc/*` funcional.
3. Pelo menos 1 query consumida via:
   - prefetch server-side
   - uso em Client Component com `useQuery`/`useSuspenseQuery`
4. Sem imports de módulos server em arquivos client (fronteira respeitada).
5. Tipagem end-to-end validada sem duplicação manual de tipos.

---

## 9. Riscos e mitigação

- **Risco**: cache compartilhado entre requests.
  - Mitigação: criar QueryClient por request no servidor.

- **Risco**: importar código de servidor em client.
  - Mitigação: `import type`, `server-only`, `client-only`, revisão de boundaries.

- **Risco**: hidratação inconsistente com tipos complexos.
  - Mitigação: padronizar `superjson` nos transformadores e hydrate/dehydrate.

- **Risco**: adoção parcial gerar dois padrões de dados.
  - Mitigação: migrar por domínio (result -> leaderboard -> submit) com checklist.

---

## 10. Referências

- https://trpc.io/docs/client/tanstack-react-query/server-components
- https://trpc.io/docs/client/tanstack-react-query/setup
- https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
