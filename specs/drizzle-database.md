# Spec: Database — Drizzle ORM + PostgreSQL

> **Status**: Draft
> **Escopo**: Schema completo, Docker Compose, configuração do Drizzle e setup inicial

---

## TL;DR

Persistência das submissões de código e resultados de roasts usando **Drizzle ORM** com
**PostgreSQL 16** (via Docker Compose em dev). Sem autenticação no MVP — todas as submissões
são anônimas. O leaderboard é derivado de queries sobre as tabelas principais, sem tabela
própria.

---

## 1. Screens que dependem do banco

| Screen | Feature | Dados necessários |
|--------|---------|-------------------|
| Screen 1 — Code Input | stats no footer | `COUNT(roasts)`, `AVG(roasts.score)` |
| Screen 2 — Roast Results | exibir resultado e código submetido | `submissions` + `roasts` |
| Screen 2 — share_roast | URL pública de um roast | `submission.id` (UUID como slug) |
| Screen 3 — Shame Leaderboard | ranking dos piores | `submissions` + `roasts` ordenados por `score` ASC |
| Screen 4 — OG Image | metadados do roast para pré-visualização social | `roasts.headline`, `roasts.score`, `submissions.language` |

---

## 2. Dependências

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit @types/node dotenv
```

| Pacote | Papel |
|--------|-------|
| `drizzle-orm` | ORM e query builder |
| `postgres` | Driver PostgreSQL (postgres.js — mais leve que node-postgres para Next.js) |
| `drizzle-kit` | CLI para migrations e introspection |
| `dotenv` | Carregar variáveis de `.env.local` nos scripts de migration |

---

## 3. Docker Compose

**`docker-compose.yml`** na raiz do projeto:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: devroast_db
    environment:
      POSTGRES_DB: devroast
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devroast -d devroast"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Comandos do dia a dia:

```bash
docker compose up -d      # sobe o banco em background
docker compose down       # para o banco
docker compose down -v    # para e apaga o volume (reset completo)
```

---

## 4. Variáveis de ambiente

**`.env.local`** (nunca commitar):

```env
DATABASE_URL=postgres://devroast:devroast@localhost:5432/devroast
```

**`.env.example`** (commitar):

```env
DATABASE_URL=postgres://devroast:devroast@localhost:5432/devroast
```

Adicionar `.env.local` ao `.gitignore`.

---

## 5. Schema

### 5.1 Enums

```ts
// src/db/schema.ts

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "tsx",
  "python",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "sql",
  "bash",
  "json",
  "yaml",
  "html",
  "css",
  "markdown",
  "plaintext",
]);

export const roastModeEnum = pgEnum("roast_mode", [
  "honest",   // revisão construtiva
  "roast",    // sarcasmo máximo (default da UI)
]);

export const verdictEnum = pgEnum("verdict", [
  "garbage_fire",        // 0.0 – 2.0
  "needs_serious_help",  // 2.1 – 4.0  ← aparece no Screen 2 do design
  "questionable",        // 4.1 – 6.0
  "not_terrible",        // 6.1 – 8.0
  "actually_good",       // 8.1 – 10.0
]);
```

> **Mapeamento de score → verdict**: feito na camada da aplicação (ou action server) antes
> de salvar, não no banco.

---

### 5.2 Tabela `submissions`

Armazena o código submetido pelo usuário.

```ts
export const submissions = pgTable("submissions", {
  id:         uuid("id").primaryKey().defaultRandom(),
  code:       text("code").notNull(),
  language:   languageEnum("language").notNull().default("plaintext"),
  linesCount: integer("lines_count").notNull(),
  charCount:  integer("char_count").notNull(),
  mode:       roastModeEnum("mode").notNull().default("roast"),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | `uuid` PK | UUID v4, usado como slug de URL pública |
| `code` | `text` | Conteúdo bruto do código |
| `language` | `language` enum | Detectada/selecionada na UI |
| `lines_count` | `integer` | Calculado antes de salvar |
| `char_count` | `integer` | Calculado antes de salvar |
| `mode` | `roast_mode` enum | "roast" ou "honest" |
| `created_at` | `timestamptz` | Auto |

---

### 5.3 Tabela `roasts`

Armazena o resultado gerado pela IA para cada submissão.

```ts
export const roasts = pgTable("roasts", {
  id:           uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
                  .notNull()
                  .references(() => submissions.id, { onDelete: "cascade" }),
  score:        numeric("score", { precision: 3, scale: 1 })
                  .notNull(),
  verdict:      verdictEnum("verdict").notNull(),
  headline:     text("headline").notNull(),
  feedback:     jsonb("feedback").notNull().default([]),
  aiModel:      text("ai_model").notNull(),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | `uuid` PK | — |
| `submission_id` | `uuid` FK → `submissions.id` | CASCADE delete |
| `score` | `numeric(3,1)` | 0.0 a 10.0 — ex: `3.5` |
| `verdict` | `verdict` enum | Derivado do score |
| `headline` | `text` | A frase de roast principal (ex: *"this code looks like it was written during a power outage… in 2005."*) |
| `feedback` | `jsonb` | Array de itens de feedback (ver formato abaixo) |
| `ai_model` | `text` | ID do modelo usado (ex: `claude-sonnet-4-6`) |
| `created_at` | `timestamptz` | Auto |

#### Formato do campo `feedback` (JSONB)

```ts
type FeedbackItem = {
  content: string;    // texto do feedback
  isPositive: boolean; // elogio (true) ou crítica (false)
};

// Exemplo:
[
  { content: "Naming is descriptive, at least.", isPositive: true },
  { content: "Zero error handling. What could go wrong? Everything.", isPositive: false },
  { content: "SQL injection on line 3. Classic.", isPositive: false },
]
```

> Usando JSONB no MVP para evitar joins desnecessários. Pode ser normalizado para
> `feedback_items` se você precisar de queries/filtros sobre os itens individuais.

---

### 5.4 Diagrama de relacionamentos

```
submissions (1) ──────── (1) roasts
     │
     └── id é usado como slug de URL pública
         ex: /roast/[submissionId]
```

Sem tabela de usuários no MVP. Sem tabela separada de leaderboard — é uma query:

```sql
SELECT s.id, s.language, s.lines_count, s.code, r.score, r.verdict, r.headline
FROM   submissions s
JOIN   roasts r ON r.submission_id = s.id
ORDER  BY r.score ASC
LIMIT  50;
```

---

## 6. Drizzle config

**`drizzle.config.ts`** na raiz:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out:    "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Scripts a adicionar em `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate":  "drizzle-kit migrate",
    "db:studio":   "drizzle-kit studio",
    "db:push":     "drizzle-kit push"
  }
}
```

> Em dev, `db:push` é suficiente para sincronizar o schema sem gerar arquivos de migration.
> Use `db:generate` + `db:migrate` em staging/prod.

---

## 7. Database client

**`src/db/index.ts`**:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

> Este arquivo é importado apenas em Server Components, Server Actions e Route Handlers —
> **nunca** em Client Components (o driver abre conexões TCP reais).

---

## 8. Estrutura de arquivos

```
src/
└── db/
    ├── index.ts          ← client singleton
    ├── schema.ts         ← tabelas e enums (única fonte da verdade)
    └── migrations/       ← arquivos .sql gerados pelo drizzle-kit (commitar)
```

---

## 9. TODOs

### Setup
- [ ] Instalar dependências: `npm install drizzle-orm postgres && npm install -D drizzle-kit dotenv`
- [ ] Criar `docker-compose.yml` na raiz
- [ ] Criar `.env.local` com `DATABASE_URL` e adicionar ao `.gitignore`
- [ ] Criar `.env.example` com valor de referência
- [ ] Criar `drizzle.config.ts` na raiz
- [ ] Adicionar scripts `db:*` no `package.json`

### Schema
- [ ] Criar `src/db/schema.ts` com enums (`language`, `roast_mode`, `verdict`) e tabelas (`submissions`, `roasts`)
- [ ] Criar `src/db/index.ts` com o client singleton

### Migrations
- [ ] Subir o banco: `docker compose up -d`
- [ ] Aplicar o schema: `npm run db:push` (dev) ou `npm run db:generate && npm run db:migrate`
- [ ] Verificar no Drizzle Studio: `npm run db:studio`

### Integração com a UI
- [ ] **Screen 1 footer stats**: criar Server Action ou Route Handler para `COUNT` e `AVG`
- [ ] **Screen 2 results**: persistir `submission` + `roast` após retorno da IA; redirecionar para `/roast/[id]`
- [ ] **Screen 2 share**: a URL pública já é `/roast/[submissionId]` — sem trabalho extra
- [ ] **Screen 3 leaderboard**: criar query paginada ordenada por `score ASC`
- [ ] **Screen 4 OG Image**: criar `app/roast/[id]/opengraph-image.tsx` consumindo os dados do roast

### QA
- [ ] Testar `score` com `0.0` e `10.0` (boundaries do CHECK)
- [ ] Testar cascade delete: deletar uma `submission` deve apagar o `roast` associado
- [ ] Testar inserção de `feedback` como array vazio e com itens
- [ ] Garantir que o `DATABASE_URL` não vaza para o bundle client-side (checar `next build` warnings)

---

## 10. Perguntas em aberto

### #1 — Paginação do leaderboard
A página completa do leaderboard (Screen 3) precisa de paginação ou infinite scroll?
- **Cursor-based** (recomendado para listas ordenadas por score): `WHERE score > $cursor ORDER BY score ASC LIMIT 20`

### #2 — Rate limiting / deduplicação
Sem autenticação, qualquer um pode submeter código infinitas vezes. Estratégias:
- **Nenhum por agora**: ok para MVP privado/beta

### #3 — Retenção do código no banco
O conteúdo do código (`submissions.code`) pode ser sensível. Opções:
- Guardar o código completo (necessário para Screen 2 e Screen 3)
