# devroast — Roadmap de Implementações Futuras

> **Status**: Living document  
> **Última atualização**: Março 2026  
> **Stack**: Next.js 16 · tRPC · Drizzle ORM · PostgreSQL · Tailwind CSS v4

---

## Visão Geral

O devroast tem como proposta central: **paste your code, get roasted**. O site já possui a estrutura visual completa (homepage, leaderboard, página de resultado) e a camada de dados (Drizzle + tRPC). O próximo ciclo de trabalho é conectar os fluxos reais de ponta a ponta — do input do usuário ao resultado gerado por IA — e expandir a experiência com autenticação, compartilhamento e mais interatividade.

---

## 1. Fluxo de Submissão Real (Prioridade Alta)

> Estado atual: o botão `$ roast_my_code` redireciona para um ID mock hardcoded.

### 1.1 tRPC mutation `roast.submit`

- Receber `{ code, language, mode }` do client
- Persistir em `submissions` via Drizzle
- Chamar o provider de IA (OpenAI / Anthropic) com o prompt de roast/honest
- Persistir resultado em `roasts` (`score`, `verdict`, `headline`, `feedback[]`)
- Retornar o `roastId` para o client redirecionar para `/result/[id]`

**Rota**: `src/trpc/routers/roast.ts` — procedure `submit`

### 1.2 Página de resultado real

> Estado atual: `src/app/result/[id]/page.tsx` usa dados mock + `generateStaticParams`.

- Substituir mock data pela query `roast.getById` (tRPC server caller)
- Buscar `roast` + `submission` pelo `id` da rota
- Passar `404` se não encontrado (já existe `notFound()` no código)
- Remover `generateStaticParams` e o `MOCK_ROAST_ID`

### 1.3 Detecção de linguagem automática

- O hook `useLanguageDetection` já existe — integrá-lo ao `HomeInteractive`
- Preencher o `LanguageSelector` automaticamente com base no código colado
- Enviar a linguagem detectada junto com a submissão

---

## 2. Integração com IA (Prioridade Alta)

### 2.1 Prompt de roast

Dois modos distintos controlados pelo campo `mode` da submission:

- **`roast`**: sarcasmo máximo, crítica ácida mas tecnicamente precisa
- **`honest`**: revisão construtiva, tom profissional

Saída esperada do modelo (JSON estruturado):
```ts
{
  score: number,          // 0.0–10.0
  verdict: Verdict,       // enum do schema
  headline: string,       // frase de impacto (1 linha)
  feedback: FeedbackItem[], // array de { content, isPositive }
  diffSuggestion?: string,  // código melhorado (para o diff panel)
}
```

### 2.2 Streaming de resposta

- Exibir feedback progressivo enquanto a IA processa
- Loading state na página de resultado com skeleton animado
- Usar streaming do tRPC ou Server-Sent Events

### 2.3 Diff inteligente

> Estado atual: o `DiffLine` exibe dados mock.

- Gerar o diff a partir do código original + sugestão da IA
- Usar uma lib leve de diff (ex: `diff` ou `diffLines` do pacote `diff`)
- Renderizar no `ResultCodePanel` com highlighting Shiki

---

## 3. Leaderboard — Melhorias (Prioridade Média)

> Estado atual: página `/leaderboard` já conectada ao tRPC com top 20 entradas reais.

### 3.1 Clique em entrada → resultado

- Cada `LeaderboardEntry` deve ser clicável e levar para `/result/[id]`
- Adicionar `submissionId` / `roastId` no retorno de `leaderboard.list`
- Wrap com `<Link href={/result/${entry.roastId}}>` no componente

### 3.2 Filtros

- Filtrar por linguagem (dropdown com `LanguageSelector`)
- Filtrar por faixa de score (ex: `< 2`, `2–4`, `4–6`)
- Implementado como query params na URL (`?lang=javascript&max=2`)
- `leaderboard.list` recebe input opcional `{ language?, maxScore? }`

### 3.3 Paginação

- Adicionar `cursor`-based pagination no `leaderboard.list`
- Botão "load more" no fim da página (não infinite scroll)
- Limite de 20 por página

### 3.4 Stats dinâmicos no hero

> Estado atual: `totalRoasts` e `avgScore` já vêm do tRPC.

- Adicionar `worstScore` (score mais baixo do leaderboard) na query de stats
- Exibir: `X submissions · avg: Y/10 · worst: Z/10`

---

## 4. Homepage — Melhorias (Prioridade Média)

### 4.1 Language Selector visível

- Adicionar `LanguageSelector` na barra de ações do `HomeInteractive`
- Permitir override manual da linguagem detectada automaticamente
- Passar linguagem selecionada na mutation de submissão

### 4.2 Loading state no submit

- Substituir o redirect imediato por um estado de loading no botão
- Botão muda para `$ roasting...` com cursor animado enquanto aguarda a IA
- Redirecionar para `/result/[id]` somente quando a mutation retornar

### 4.3 Métricas em tempo real

> Estado atual: `HomeMetrics` já faz query real via tRPC.

- Auto-refresh da contagem de roasts a cada 30s (React Query `refetchInterval`)
- Animação de incremento quando o número muda (ex: `countUp`)

---

## 5. Autenticação (Prioridade Baixa — Pós-MVP)

### 5.1 Auth via GitHub

- Login com GitHub OAuth (Next.js Auth ou Clerk)
- Associar submissions ao usuário logado (coluna `userId` em `submissions`)
- Perfil público com histórico de roasts

### 5.2 "Meus roasts"

- Página `/profile` com todas as submissões do usuário logado
- Ordenar por data, filtrar por score
- Opção de deletar submissão (remove do leaderboard também via cascade)

### 5.3 Leaderboard pessoal

- Mini-leaderboard do usuário na página de perfil
- "Seu pior código" com badge de vergonha

---

## 6. Compartilhamento (Prioridade Baixa)

### 6.1 Share button na página de resultado

> Estado atual: botão de share já existe no UI mas não tem ação.

- Gerar URL canônica `/result/[id]` (já é a própria rota)
- `navigator.share()` com fallback para copiar URL no clipboard
- Gerar imagem OG dinâmica com Next.js `ImageResponse` (score + headline + linguagem)

### 6.2 OG Image

- Rota `app/result/[id]/opengraph-image.tsx`
- Visual: fundo `#0C0C0C`, score em destaque, headline, badge de linguagem
- Usado automaticamente pelo Next.js no `<head>`

---

## 7. UX / Polish (Prioridade Baixa)

### 7.1 Toast de erro na submissão

- Exibir toast quando a submissão falha (IA offline, rate limit, etc.)
- Componente `Toast` com variantes `error` / `success` seguindo o design system

### 7.2 Expand/collapse no LeaderboardEntry

- Entradas no leaderboard mostram preview de até 5 linhas
- Botão `// show more` expande para o código completo in-place
- Estado controlado localmente no componente cliente

### 7.3 Skeleton unificado

- Garantir que toda tela tenha Suspense + skeleton correspondente
- Página `/leaderboard` ainda renderiza server-side mas pode ter skeleton de navegação

### 7.4 404 e Error Pages

- `not-found.tsx` com estética terminal: `// 404: page_not_found`
- `error.tsx` para erros de runtime: `// error: something_went_wrong`

---

## 8. Infraestrutura (Background)

### 8.1 Rate limiting

- Limitar submissões por IP (sem auth) a N por hora
- Usar Upstash Redis + `@upstash/ratelimit` no middleware do tRPC

### 8.2 Variáveis de ambiente e configuração

- Validação de env vars com `zod` no startup (`src/env.ts`)
- Documentar todas as vars necessárias no `README.md`

### 8.3 Migrations automatizadas

- Script de migration no CI (ou `drizzle-kit push` no deploy)
- Seed de dados de exemplo para desenvolvimento local

---

## Ordem de Prioridade Resumida

| # | Feature | Impacto | Esforço |
|---|---------|---------|---------|
| 1 | Fluxo de submissão real (tRPC mutation + IA) | Alto | Alto |
| 2 | Página de resultado real (sem mock) | Alto | Médio |
| 3 | Detecção de linguagem no HomeInteractive | Médio | Baixo |
| 4 | LeaderboardEntry clicável → `/result/[id]` | Médio | Baixo |
| 5 | Language selector na homepage | Médio | Baixo |
| 6 | Loading state no submit | Médio | Baixo |
| 7 | Share button + OG Image | Médio | Médio |
| 8 | Filtros + paginação no leaderboard | Baixo | Médio |
| 9 | Auth GitHub + perfil | Baixo | Alto |
| 10 | Rate limiting + infraestrutura | Baixo | Médio |
