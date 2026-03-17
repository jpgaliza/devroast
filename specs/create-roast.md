# Spec: Create Roast — Submissão de Código + Análise por IA

> **Status**: Draft  
> **Escopo**: Fluxo completo de submissão — do input do usuário à página de resultado com análise real gerada por IA  
> **Fora do escopo**: share_roast, streaming de resposta, diff de código

---

## TL;DR

O usuário cola um trecho de código na homepage, escolhe o modo (roast ou honest) e clica em **$ roast_my_code**. O sistema persiste a submissão, chama a IA, persiste o resultado e redireciona para `/result/[id]` com a análise real. Hoje esse botão aponta para um UUID mockado — essa spec conecta tudo de ponta a ponta.

---

## 1. Estado atual vs. estado desejado

| Ponto                   | Hoje                                | Após implementação                               |
| ----------------------- | ----------------------------------- | ------------------------------------------------ |
| Botão `$ roast_my_code` | Redireciona para UUID hardcoded     | Chama mutation tRPC e redireciona para o ID real |
| `HomeInteractive`       | Sem `language`, sem chamada de API  | Com `language` state, mutation e loading state   |
| `result/[id]/page.tsx`  | Dados mock + `generateStaticParams` | Query real via tRPC server caller                |
| `roast.ts` router       | Não existe                          | `submit` mutation + `getById` query              |
| Integração com IA       | Não existe                          | OpenAI (gpt-4o) com saída JSON estruturada       |

---

## 2. Variáveis de Ambiente

Adicionar em `.env.local` e `.env.example`:

```env
# Provider de IA (OpenAI)
OPENAI_API_KEY=sk-...
```

Adicionar ao `src/app/_components/HomeInteractive.tsx` — nenhuma env exposta ao client, toda comunicação passa pelo servidor via tRPC.

---

## 3. Dependência: pacote OpenAI

```bash
npm install openai
```

---

## 4. Arquitetura do Fluxo

```
[HomeInteractive] (Client Component)
     │
     │  trpc.roast.submit.useMutation()
     │  input: { code, language, mode }
     ▼
[roast.submit] (tRPC Server Procedure)
     │
     ├─ 1. Valida input (Zod)
     ├─ 2. INSERT submissions
     ├─ 3. Chama OpenAI (prompt por mode)
     ├─ 4. Parseia JSON da resposta
     ├─ 5. INSERT roasts
     └─ 6. Retorna { roastId }
     │
     ▼
[router.push(`/result/${roastId}`)]
     │
     ▼
[result/[id]/page.tsx] (Server Component)
     │
     │  getTRPCCaller → roast.getById(id)
     ▼
[Página de resultado com dados reais]
```

---

## 5. tRPC Router — `src/trpc/routers/roast.ts`

### 5.1 Procedure `submit`

**Input (Zod)**:

```ts
z.object({
  code: z.string().min(1).max(2000),
  language: z.enum(languageEnum.enumValues),
  mode: z.enum(roastModeEnum.enumValues),
});
```

**Fluxo interno**:

1. Contar `linesCount` e `charCount` a partir do `code`
2. `INSERT INTO submissions` via Drizzle, obter o `submissionId`
3. Chamar `generateRoast(code, language, mode)` — função auxiliar que chama OpenAI
4. Calcular `verdict` a partir do `score` usando a tabela de verdicts do schema
5. `INSERT INTO roasts` com `submissionId`, dados da IA e `aiModel: "gpt-4o"`
6. Retornar `{ roastId: roast.id }`

**Output (Zod)**:

```ts
z.object({ roastId: z.string().uuid() });
```

**Tratamento de erro**: se a IA falhar ou retornar JSON inválido, lançar `TRPCError` com código `INTERNAL_SERVER_ERROR` e não persistir o roast (a submission pode ficar — não é problema).

---

### 5.2 Procedure `getById`

**Input (Zod)**:

```ts
z.object({ id: z.string().uuid() });
```

**Query**: JOIN entre `roasts` e `submissions` pelo `roasts.submissionId`

**Output (Zod)**:

```ts
z.object({
  roastId: z.string().uuid(),
  score: z.number(),
  verdict: z.enum(verdictEnum.enumValues),
  headline: z.string(),
  feedback: z.array(z.object({ content: z.string(), isPositive: z.boolean() })),
  aiModel: z.string(),
  code: z.string(),
  language: z.string(),
  mode: z.enum(roastModeEnum.enumValues),
  linesCount: z.number(),
  createdAt: z.date(),
});
```

Se não encontrado há query retorna `undefined`, lançar `TRPCError({ code: "NOT_FOUND" })`.

---

### 5.3 Registrar no `_app.ts`

```ts
import { roastRouter } from "@/trpc/routers/roast";

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  metrics: metricsRouter,
  roast: roastRouter, // <-- adicionar
});
```

---

## 6. Integração com OpenAI

### 6.1 Arquivo: `src/lib/ai.ts` (novo)

Responsabilidades:

- Instanciar o cliente `OpenAI`
- Definir os prompts por modo
- Chamar `openai.chat.completions.create` com `response_format: { type: "json_object" }`
- Validar e tipar o retorno com Zod

### 6.2 Prompts

**System prompt — modo `roast`**:

```
You are a ruthless senior engineer doing a brutal code review. Be sarcastic, sharp, and technically precise.
Your job is to tear apart this code with maximum sarcasm while still being technically accurate.
Never be cruel for no reason — every joke must have technical substance.
```

**System prompt — modo `honest`**:

```
You are an experienced senior engineer doing a thorough and constructive code review.
Be direct, professional, and helpful. Identify real issues and real strengths.
```

**User prompt (igual nos dois modos)**:

```
Review the following {language} code and respond with a JSON object exactly matching this structure:
{
  "score": <number 0.0–10.0, one decimal>,
  "headline": <one punchy sentence summarizing the review>,
  "feedback": [
    { "content": <specific observation>, "isPositive": <true|false> },
    ...  // 3 to 5 items
  ]
}
Code:
\`\`\`{language}
{code}
\`\`\`
```

### 6.3 Função `generateRoast`

```ts
async function generateRoast(
  code: string,
  language: string,
  mode: RoastMode,
): Promise<{ score: number; headline: string; feedback: FeedbackItem[] }>;
```

Retorna os dados brutos que o router usa para calcular `verdict` e persistir.

### 6.4 Cálculo do `verdict` a partir do `score`

Extrair em uma função utilitária compartilhada (pode viver no próprio `roast.ts`):

| Score      | Verdict              |
| ---------- | -------------------- |
| 0.0 – 2.0  | `garbage_fire`       |
| 2.1 – 4.0  | `needs_serious_help` |
| 4.1 – 6.0  | `questionable`       |
| 6.1 – 8.0  | `not_terrible`       |
| 8.1 – 10.0 | `actually_good`      |

---

## 7. `HomeInteractive` — mudanças

arquivo: `src/app/_components/HomeInteractive.tsx`

### 7.1 Novos estados

```ts
const [language, setLanguage] = React.useState<Language>("plaintext");
const [isSubmitting, setIsSubmitting] = React.useState(false);
```

O `LanguageSelector` já existe como componente — adicionar ao `HomeInteractive` abaixo do `CodeEditor` ou na actions bar. O estado de linguagem pode ser alimentado manualmente pelo usuário (inicialmente) — a auto-detecção via `useLanguageDetection` pode ser adicionada como melhoria incremental no mesmo PR.

### 7.2 Mutation tRPC

```ts
const utils = useTRPC();
const submitMutation = useTRPCMutation(utils.roast.submit, {
  onSuccess: ({ roastId }) => router.push(`/result/${roastId}`),
  onError: () => {
    /* toast ou mensagem de erro inline */
  },
});
```

Usar o hook `useMutation` do `@trpc/tanstack-react-query` conforme padrão já adotado no projeto.

### 7.3 Handler do botão

```ts
onClick={() => {
  if (!code.trim() || isOverLimit) return;
  submitMutation.mutate({ code, language, mode: roastMode ? "roast" : "honest" });
}}
```

### 7.4 Loading state do botão

- Quando `submitMutation.isPending`: desabilitar botão e exibir texto `"$ analyzing..."` ou um spinner inline
- O botão já tem estilos para `disabled` — só adaptar o label

### 7.5 Remover

```ts
const MOCK_ROAST_ID = "550e8400-e29b-41d4-a716-446655440000";
```

---

## 8. `result/[id]/page.tsx` — mudanças

### 8.1 Remover

- `MOCK_ROAST_ID`
- `RESULT_DATA` (mock)
- `ANALYSIS_ITEMS` (mock)
- `DIFF_LINES` (mock)
- `generateStaticParams()`

### 8.2 Buscar dados reais

```ts
export const dynamic = "force-dynamic";

export default async function ResultPage({ params }) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) notFound();

  const caller = await getTRPCCaller();
  const roast = await caller.roast.getById({ id }).catch(() => null);

  if (!roast) notFound();

  // resto do render com dados reais
}
```

### 8.3 Mapear dados para a UI

| Campo mock             | Campo real                                                             |
| ---------------------- | ---------------------------------------------------------------------- |
| `RESULT_DATA.score`    | `roast.score`                                                          |
| `RESULT_DATA.verdict`  | `roast.verdict`                                                        |
| `RESULT_DATA.headline` | `roast.headline`                                                       |
| `RESULT_DATA.language` | `roast.language`                                                       |
| `RESULT_DATA.code`     | `roast.code`                                                           |
| `ANALYSIS_ITEMS`       | `roast.feedback` mapeado para `{ variant, label, title, description }` |

### 8.4 Feedback → Cards

O `feedback` vem como `FeedbackItem[]` da IA: `{ content: string, isPositive: boolean }`.  
Mapear para `<CardRoot>` + `<Badge>`:

- `isPositive: true` → `variant="good"`, `label="good"`
- `isPositive: false` (critical vs. warning): usar score do item não existe — simplificar para dois variantes: `"critical"` se `score < 5`, caso contrário `"warning"`. Ou mapear por posição: primeiro item negativo = `"critical"`, demais = `"warning"`.

### 8.5 Seção de Diff

Com os mocks removidos e `diffSuggestion` fora do escopo desta spec, **remover ou ocultar** a seção de diff da página até que a funcionalidade seja implementada. A seção `your_submission` (código original) permanece.

### 8.6 Botão share_roast

Manter o botão no layout mas deixá-lo **desabilitado** (`disabled`) ou removê-lo temporariamente — não implementar a lógica de compartilhamento nesta fase.

---

## 9. Arquivos a criar / modificar

| Arquivo                                   | Ação                                                    |
| ----------------------------------------- | ------------------------------------------------------- |
| `src/lib/ai.ts`                           | **Criar** — cliente OpenAI + prompts + `generateRoast`  |
| `src/trpc/routers/roast.ts`               | **Criar** — procedures `submit` e `getById`             |
| `src/trpc/routers/_app.ts`                | **Modificar** — registrar `roastRouter`                 |
| `src/app/_components/HomeInteractive.tsx` | **Modificar** — mutation, language state, loading       |
| `src/app/result/[id]/page.tsx`            | **Modificar** — remover mocks, usar dados reais         |
| `.env.local`                              | **Modificar** — adicionar `OPENAI_API_KEY`              |
| `.env.example`                            | **Modificar** — adicionar `OPENAI_API_KEY=` (sem valor) |

---

## 10. Ordem de implementação sugerida

1. **`src/lib/ai.ts`** — isolar a lógica de IA primeiro, testável de forma independente
2. **`src/trpc/routers/roast.ts`** — implementar `submit` + `getById` usando a função de IA
3. **`src/trpc/routers/_app.ts`** — registrar o router
4. **`src/app/result/[id]/page.tsx`** — trocar mocks por dados reais (depende de `getById`)
5. **`src/app/_components/HomeInteractive.tsx`** — conectar mutation + language state (depende de `submit`)
6. **Smoke test manual** — submeter um trecho real e verificar o fluxo completo

---

## 11. Considerações de segurança

- `OPENAI_API_KEY` nunca chega ao client — toda chamada é server-side via tRPC procedure
- Input `code` é limitado a 2000 chars no client e validado novamente no server via Zod (`max(2000)`)
- A IA recebe o código como conteúdo de mensagem — não como instrução — minimizando risco de prompt injection
- Não há dados de usuário sensíveis: todas as submissões são anônimas no MVP
