# Spec: Code Editor com Syntax Highlighting

> **Status**: Implementado ✅
> **Feature**: Editor da homepage com syntax highlight automático e seletor de linguagem manual

---

## TL;DR

Usar a técnica de **mirrored textarea** (mesma do ray.so): um `<textarea>` transparente sobreposto a uma camada de HTML tokenizado pelo **Shiki**. Para detecção automática de linguagem, usar o `highlight.js` exclusivamente como detector (não como renderizador). A colorização usará as variáveis CSS `--color-syn-*` já definidas no `globals.css`, sem nenhum conflito com o design system existente.

---

## 1. Pesquisa: como o ray.so faz

O [ray.so](https://github.com/raycast/ray-so) é a principal referência. Após análise do código-fonte:

### Bibliotecas utilizadas

| Biblioteca     | Versão    | Papel                                        |
| -------------- | --------- | -------------------------------------------- |
| `shiki`        | `^1.0.0`  | Tokenização e colorização — HTML final       |
| `highlight.js` | `^11.7.0` | **Somente** detecção automática de linguagem |
| `jotai`        | `^2.8.3`  | State management global                      |

### Técnica: Mirrored Textarea

```
┌──────────────────────────────────────────────┐
│  <div>  (container posicionado)              │
│  ┌────────────────────────────────────────┐  │
│  │  <div dangerouslySetInnerHTML />       │  │  ← HTML colorizado (Shiki)
│  │  color: var(--syn-keyword)...          │  │    posicionado abaixo
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │  <textarea />                          │  │  ← Transparente, captura input
│  │  color: transparent                    │  │    posicionado em cima
│  │  z-index: 1                            │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

- O `textarea` fica **transparente** por cima da camada colorizada
- O usuário digita no `textarea`, o React re-renderiza o Shiki HTML abaixo
- Fontes, tamanhos, line-height e padding devem ser **pixel perfeitos** entre as duas camadas

### Fluxo de detecção de linguagem

```
usuário cola código
       ↓
hljs.highlightAuto(code) → { language: "python", ... }
       ↓
selectedLanguage = userOverride ?? hljs.detected ?? "plaintext"
       ↓
Shiki.codeToHtml(code, { lang: selectedLanguage })
       ↓
dangerouslySetInnerHTML no layer abaixo do textarea
```

### Sistema de temas via CSS variables

O ray.so inicializa o Shiki com `createCssVariablesTheme`, fazendo com que o HTML gerado emita `color: var(--ray-token-keyword)` ao invés de hex fixo. Trocar de tema = trocar as CSS variables no container — **o Shiki não precisa re-renderizar**.

---

## 2. Alternativas consideradas

| Opção                         | Bundle                     | Complexidade                                          | Conclusão                                        |
| ----------------------------- | -------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| **Mirrored textarea + Shiki** | ~leve (Shiki já instalado) | Baixa                                                 | ✅ **Recomendado**                               |
| CodeMirror 6                  | +200KB                     | Alta (API complexa, theming personalizado trabalhoso) | ❌ Overkill                                      |
| Monaco Editor (VS Code)       | +2MB                       | Muito alta                                            | ❌ Overkill                                      |
| PrismJS                       | ~30KB                      | Média                                                 | ❌ Shiki já está instalado e é superior          |
| `react-simple-code-editor`    | ~5KB (usa Prism por baixo) | Baixa                                                 | ⚠️ Possível alternativa leve, mas limita o Shiki |

**Veredito**: a abordagem do ray.so é a mais elegante para este caso. Sem dependência de editor completo, sem lock-in, e aproveita o Shiki já instalado no projeto.

---

## 3. Especificação Técnica

### 3.1 Novas dependências

```json
"highlight.js": "^11.x"
```

> Somente para auto-detecção. Usar o bundle `highlight.js/lib/common` (~40 linguagens, ~30KB gzip) para evitar importar as 190+ linguagens.

O Shiki já está instalado na versão `^4.0.2`. Nenhuma atualização necessária.

### 3.2 Tokens CSS existentes → tema Shiki

O `globals.css` já define todas as variáveis de sintaxe necessárias:

```css
/* globals.css — já existente */
--color-syn-keyword: #c678dd; /* palavras-chave (if, const, def...) */
--color-syn-function: #61afef; /* nomes de funções */
--color-syn-variable: #e5c07b; /* variáveis e parâmetros */
--color-syn-operator: #abb2bf; /* operadores e pontuação */
--color-syn-number: #d19a66; /* números */
--color-syn-string: #98c379; /* strings */
--color-syn-property: #56b6c2; /* propriedades e atributos */
--color-syn-comment: #8b8b8b; /* comentários */
```

A integração com o Shiki se dará via `createCssVariablesTheme` com prefix `--shiki-`. O CSS do projeto precisará mapear os tokens do Shiki para os tokens de design existentes:

```css
/* a criar: mapeamento Shiki → design tokens */
.code-highlighted {
  --shiki-token-keyword: var(--color-syn-keyword);
  --shiki-token-function: var(--color-syn-function);
  --shiki-token-constant: var(--color-syn-variable);
  --shiki-token-string: var(--color-syn-string);
  --shiki-token-number: var(--color-syn-number);
  --shiki-token-comment: var(--color-syn-comment);
  --shiki-token-punctuation: var(--color-syn-operator);
  --shiki-foreground: var(--color-text-primary);
  --shiki-background: transparent;
}
```

### 3.3 Componentes a criar/modificar

#### `src/components/ui/CodeEditor.tsx` → modificar

Adicionar `CodeEditorHighlightBody`: o container com a técnica mirrored textarea.

```
CodeEditorRoot
├── CodeEditorHeader          ← adicionar: LanguageSelector no lado direito
└── CodeEditorBody
    └── CodeEditorLineNumbers
        CodeEditorHighlightBody  ← NOVO: wrapper de overlay
            CodeHighlightLayer   ← NOVO: div com HTML do Shiki
            CodeEditorInput      ← existente, recebe `color: transparent`
```

#### `src/hooks/useLanguageDetection.ts` → criar

Hook responsável por:

1. Executar `hljs.highlightAuto(code)` quando o código muda (debounced 300ms)
2. Mapear o nome da linguagem do hljs para o ID correspondente no Shiki
3. Retornar `{ detectedLanguage, confidence }`

#### `src/hooks/useShikiHighlighter.ts` → criar

Hook responsável por:

1. Inicializar o highlighter uma única vez (`useEffect` com `[]`)
2. Fazer lazy-load de gramáticas sob demanda
3. Retornar `{ highlighter, isLoading }`

#### `src/components/ui/LanguageSelector.tsx` → criar

Componente client-side que renderiza no header do editor:

- Exibe a linguagem detectada/selecionada
- Permite ao usuário fazer override manual via dropdown/select
- Visual: `// python ▾` — estilo terminal, inline no header

### 3.4 Linguagens suportadas

Prioridade alta (lazy-load imediato no bundle inicial):
`javascript`, `typescript`, `tsx`, `python`, `go`, `rust`

Prioridade média (lazy-load sob demanda):
`java`, `c`, `cpp`, `csharp`, `php`, `ruby`, `sql`, `bash`, `json`, `yaml`, `html`, `css`, `markdown`

Fallback: `plaintext` (sem highlight, só escapa HTML)

### 3.5 Comportamento esperado

1. **Usuário cola código** → `hljs.highlightAuto` roda (debounced) → linguagem detectada é exibida no header
2. **Shiki renderiza** o HTML colorizado no layer abaixo do textarea
3. **Usuário pode clicar** no selector de linguagem e fazer override manual → Shiki re-renderiza com a linguagem forçada
4. **Se o código estiver vazio**, o textarea mostra o placeholder normal, sem highlight layer visível
5. **Loading state**: enquanto o highlighter inicializa ou carrega gramática, o textarea exibe texto sem cor (fallback gracioso)

### 3.6 Alinhamento pixel perfeito (mirrored textarea)

Para que a sobreposição funcione, tanto o textarea quanto o highlight layer devem ter **exatamente os mesmos** valores de:

- `font-family`: `font-jb` (`JetBrains Mono`)
- `font-size`: `text-xs` (12px)
- `line-height`: `leading-[20px]` (20px)
- `padding`: `p-4` (16px)
- `letter-spacing`: `0` / normal
- `white-space: pre-wrap`
- `word-break: break-all` ou `overflow-wrap: break-word`

O Shiki gera `<pre><code>` — os estilos base do `pre` devem ser resetados (margin, padding, background) para não quebrar o alinhamento.

---

## 4. TODOs

### Pesquisa / Decisão

- [ ] **Confirmar API do Shiki v4**: verificar se `createCssVariablesTheme` e `createHighlighter` têm a mesma assinatura que o Shiki v1 (que o ray.so usa). O `CodeBlock.server.tsx` atual usa uma API diferente e pode ter workarounds.
- [ ] **Decidir sobre o LanguageSelector**: dropdown customizado ou `<select>` nativo estilizado? (ver pergunta aberta #1)
- [ ] **Decidir persistência**: salvar linguagem selecionada? (ver pergunta aberta #2)

### Implementação

- [ ] Instalar `highlight.js` e confirmar que o bundle `lib/common` cobre os casos de uso do devroast
- [ ] Criar `src/hooks/useShikiHighlighter.ts` — inicialização lazy do highlighter com as 6 linguagens prioritárias
- [ ] Criar `src/hooks/useLanguageDetection.ts` — debounced hljs.highlightAuto + mapeamento para IDs do Shiki
- [ ] Adicionar mapeamento CSS `--shiki-token-*` → `--color-syn-*` no `globals.css`
- [ ] Modificar `CodeEditor.tsx`: adicionar `CodeEditorHighlightBody` com a técnica de overlay
- [ ] Criar `LanguageSelector.tsx` — dropdown com estética terminal para o header do editor
- [ ] Atualizar `CodeEditorHeader` para aceitar e renderizar o `LanguageSelector`
- [ ] Garantir alinhamento pixel perfeito (testar em Chrome, Firefox, Safari)
- [ ] Adicionar loading skeleton/fallback: textarea sem highlight enquanto o Shiki não inicializou
- [ ] Adicionar suporte a Tab key no textarea (inserir 2 espaços ao invés de perder foco)
- [ ] Exportar novos componentes no `src/components/ui/index.ts`
- [ ] Atualizar `page.tsx` para usar o novo CodeEditor com highlight e passar o `onLanguageChange` handler

### QA / Detalhes

- [ ] Testar alinhamento com código que tem tabs vs espaços
- [ ] Testar com código muito longo (overflow horizontal)
- [ ] Testar a detecção automática com os casos do leaderboard (JS, SQL, Python)
- [ ] Garantir que `plaintext` / linguagem não reconhecida não quebra o Shiki

---

## 5. Perguntas em aberto

### #1 — Placement e UI do LanguageSelector

Onde e como exibir o seletor de linguagem?

**Badge flutuante no canto do editor**
Parecido com o badge de linguagem do GitHub.

### #2 — Persistência da linguagem selecionada

Quando o usuário faz override manual, devemos:

- **Não persistir** (reset a cada nova sessão) — mais simples

Para o MVP do devroast, provavelmente **não persistir** é suficiente já que o foco é colar e roastar rapidamente.

---

## 6. Referências

- [ray.so source — Editor.tsx](<https://github.com/raycast/ray-so/blob/main/app/(navigation)/(code)/components/Editor.tsx>)
- [ray.so source — HighlightedCode.tsx](<https://github.com/raycast/ray-so/blob/main/app/(navigation)/(code)/components/HighlightedCode.tsx>)
- [ray.so source — store/code.ts](<https://github.com/raycast/ray-so/blob/main/app/(navigation)/(code)/store/code.ts>)
- [Shiki docs — CSS Variables Theme](https://shiki.style/guide/theme#css-variables-theme)
- [highlight.js — Language Detection](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto)
