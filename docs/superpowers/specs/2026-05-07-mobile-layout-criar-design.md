# Mobile Layout — Página de Criação de Polaroids

**Data:** 2026-05-07  
**Arquivo alvo:** `src/routes/criar.tsx`  
**Abordagem:** Opção A — tudo inline com `lg:hidden`, sem refactor de estado, sem novos arquivos

---

## Contexto

95% dos usuários acessam pelo celular. O layout mobile atual tem problemas de espaço, proporção e usabilidade. O desktop está 100% funcional e **não deve ser tocado**. Todas as mudanças são isoladas dentro de blocos `lg:hidden`, mantendo o breakpoint `lg:` (1024px) existente.

---

## Regras globais

- Breakpoint mobile/desktop: `lg:` (1024px) — sem alteração
- Desktop: não tocar em nenhuma classe, estilo, função, estado ou comportamento
- Mobile: substituir/reorganizar apenas os blocos `lg:hidden` existentes
- Nenhuma lógica duplicada: reutilizar `pickFile`, `concluir`, `removerDraftAtual`, `finalizarPedido`, `selecionarFonte`, `editarSalva`, `setDraft`, etc.
- Novos estados adicionados ao componente `CriarPage` (não criar contexto):
  - `mobileSizeDropdownOpen: boolean` (inicia `false`)
  - `mobileFontPanelOpen: boolean` (inicia `false`)
  - `mobileSizePanelOpen: boolean` (inicia `false`)
  - `mobileSavedOpen: boolean` (inicia `false`)

---

## Seção 1: Layout geral — container mobile

O container `.criar-page` mantém as classes desktop (`lg:min-h-screen`, `lg:h-[100dvh]`, etc.) sem alteração.

O `<main>` interno recebe, apenas no mobile, a estrutura `flex flex-col h-[100dvh] overflow-hidden`:
- **Spacer superior:** `h-[52px]` para compensar a barra fixa do topo
- **Área central:** `flex-1 overflow-hidden` com a Polaroid + card "Minhas Polaroids"
- **Spacer inferior:** `h-[68px]` + `env(safe-area-inset-bottom)` para compensar a barra fixa do rodapé

No mobile, a `<main>` não usa `px-3 py-3 sm:px-6 sm:py-4` — o padding é gerido pelas barras fixas e pela área central.

---

## Seção 2: Barra superior fixa

**Elemento:** `div.lg:hidden` com `position: fixed`, `top-0`, `left-0`, `right-0`, `z-50`, altura `~52px`

**Visual:** `bg-paper/95 backdrop-blur-sm border-b border-border shadow-soft px-4`

**Conteúdo — dois elementos em `flex items-center justify-between`:**

### Dropdown "Polaroid {label}"

- Botão fechado: `"Polaroid 7x10"` (ou 5x8 / 4x5 conforme `draft.polaroidSizeId`) + `<ChevronDown />` à direita
- Estado: `mobileSizeDropdownOpen`
- Ao clicar: toggle `mobileSizeDropdownOpen` + fechar outros painéis (`mobileFontPanelOpen`, `mobileSizePanelOpen`)
- Painel aberto: `position: absolute`, `top: 100%`, `left: 0`, lista com 3 opções
- Ao selecionar opção: `setDraft(d => ({ ...d, polaroidSizeId: item.id }))` + `setMobileSizeDropdownOpen(false)`
- Fechar ao clicar fora: `useEffect` com `document.addEventListener('click')` + `setTimeout(0)`, igual ao padrão do `flipMenuOpen` existente
- `stopPropagation` no botão e no painel para não fechar imediatamente
- Estilo: `bg-paper border border-border rounded-xl text-sm font-medium text-ink`

### Botão Finalizar

- Chama `finalizarPedido()` (função existente, sem alteração)
- Estilo: `bg-black text-white rounded-md px-4 h-9 text-sm font-medium`

---

## Seção 3: Área central — Polaroid proporcional + botões laterais

**Container:** `flex-1 overflow-hidden flex flex-col gap-2 px-3 pt-2`

### Sub-área da Polaroid

Grid de 3 colunas: `grid grid-cols-[1fr_auto_1fr] items-center gap-2`

- **Coluna esquerda (1fr):** invisível, mesma largura da coluna direita — serve para centralizar a Polaroid opticamente
- **Coluna central (auto):** a Polaroid com as medidas existentes
- **Coluna direita (auto):** os 3 botões laterais

A Polaroid mantém exatamente a mesma estrutura atual (`previewScale`, `previewWidthCm`, `previewHeightCm`, medidas em cm, drag handlers, caption, upload placeholder, overlay de uploading). Não alterar nenhuma dimensão ou lógica interna.

O container externo da Polaroid recebe `max-h-[calc(100dvh-52px-68px-56px)] overflow-hidden` para não ultrapassar o espaço disponível (onde 56px é a altura mínima do card "Minhas Polaroids" fechado).

### Botões laterais (coluna direita)

Visíveis apenas quando `draft.photoLocalUrl` existe e `!isAdjustingImage`. Coluna `flex flex-col items-center gap-3`.

| Botão | Ícone | Função existente | Cor fundo |
|-------|-------|-----------------|-----------|
| Trocar | `<Upload />` | `pickFile()` | `bg-paper` |
| Remover | `<Trash2 />` | `removerDraftAtual()` | `bg-paper` |
| Salvar | `<Save />` | `concluir()` | `bg-white` (mais claro) |

Estilo de cada botão: `flex flex-col items-center gap-1`, botão `h-10 w-10 rounded-xl border border-border shadow-soft`, ícone `h-4 w-4`, label `text-[9px] font-medium text-muted-foreground`.

O bloco horizontal de 7 botões existente no mobile (`criar-fade-up ... flex justify-center gap-2`) é **removido apenas no mobile** — o desktop não é afetado pois esse bloco não tem `lg:hidden` (está dentro de uma section que já é mobile-only). Verificar e garantir que o bloco de botões horizontais só seja removido do contexto mobile.

---

## Seção 4: Barra inferior fixa

**Elemento:** `div.lg:hidden` com `position: fixed`, `bottom-0`, `left-0`, `right-0`, `z-50`

**Visual:** `bg-paper/95 backdrop-blur-sm border-t border-border`, `padding-bottom: env(safe-area-inset-bottom)`, altura base `~68px`

**6 botões em `flex justify-around px-2 pt-2 pb-1`:**

| Label | Ícone | Ação ao clicar |
|-------|-------|----------------|
| Texto | `<Type />` | `setMobileCaptionEditing(true)` |
| Fonte | `<FileText />` | `setMobileFontPanelOpen(p => !p); setMobileSizePanelOpen(false)` |
| Tamanho | `<Layers />` | `setMobileSizePanelOpen(p => !p); setMobileFontPanelOpen(false)` |
| Alinhar | dinâmico (`AlignLeft/Center/Right/Justify`) | `setDraft(d => ({ ...d, align: nextAlign[d.align] }))` |
| Inverter | `<FlipHorizontal2 />` | `setFlipMenuOpen(v => !v)` (estado existente) |
| Posição | `<Pencil />` | `setIsAdjustingImage(true)` |

Todos os ícones já estão importados. Botões com `draft.photoLocalUrl` ausente ficam com `opacity-40 pointer-events-none` para evitar chamadas sem contexto.

### Painel Fonte (`mobileFontPanelOpen`)

- `position: fixed`, `left-0`, `right-0`, `z-40`
- `bottom: calc(68px + env(safe-area-inset-bottom))`
- Visual: `bg-paper rounded-t-2xl border-t border-border shadow-[0_-4px_20px_rgba(60,45,30,0.1)]`
- Interior: carrossel horizontal `flex flex-row gap-3 overflow-x-auto px-4 py-3 scrollbar-none scroll-snap-type-x-mandatory`
- Cada item: `scroll-snap-align: start`, card `~80px` de largura, nome da fonte na própria fonte, "AaBbCc" como amostra, borda `border-2 border-ink` quando ativa
- Ao selecionar: chama `selecionarFonte(style)` (existente) + `setMobileFontPanelOpen(false)` no onClick do item
- Fechar ao clicar fora: `useEffect` + `document.addEventListener('click')` com `stopPropagation` no painel

### Painel Tamanho (`mobileSizePanelOpen`)

- Mesma posição e visual do painel Fonte
- 3 opções lado a lado: **P / M / G** com `sm / md / lg`
- Ao selecionar: `setDraft(d => ({ ...d, size: s }))` + `setMobileSizePanelOpen(false)`
- Opção ativa: `bg-ink text-paper`, inativa: `bg-paper text-ink border border-border`
- Fechar ao clicar fora: mesmo padrão

### Sobre `selecionarFonte`

A função existente chama `setMobileStylesOpen(false)` — pode permanecer sem impacto (o estado não é mais renderizado no mobile novo). O fechamento do painel novo é feito via `setMobileFontPanelOpen(false)` no onClick do item.

---

## Seção 5: Card "Minhas Polaroids"

Fica no fluxo normal entre a área da Polaroid e o spacer da barra inferior. Não é `fixed`.

**Visual:** `bg-paper rounded-2xl border border-border shadow-soft mx-3 mb-2`

### Cabeçalho (sempre visível, clicável)

`flex items-center justify-between px-4 py-3` com `onClick={() => setMobileSavedOpen(v => !v)}`

- Esquerda: título "Minhas Polaroids" (`font-display text-base font-medium`) + resumo em linha abaixo quando `saved.length > 0`: `"{N} foto(s) • {totalPedidoFormatado}"` — usa `totalPedidoFormatado` já calculado no componente
- Direita: `<ChevronDown />` que rotaciona `rotate-180` quando `mobileSavedOpen`

### Área interna (visível quando `mobileSavedOpen`)

**Quando vazio:** área com `border border-dashed border-border rounded-xl mx-3 mb-3 p-4 text-center`, mensagem "Nenhuma Polaroid criada ainda." em `text-sm text-muted-foreground`

**Quando com itens:** carrossel `flex flex-row gap-3 overflow-x-auto px-3 pb-3 scrollbar-none`, com `scroll-snap-type: x mandatory`

Cada item do carrossel:
- `scroll-snap-align: start shrink-0`
- Mesma estrutura interna do `saved.map(...)` existente: `getGallerySlotStyle`, `galleryScale`, frame `.polaroid`, foto, caption, botão X (`setDraftIdPendenteRemocao`), borda de seleção (`isSelected`), clique para editar (`editarSalva`)
- A única diferença é o container externo: `flex-row` horizontal em vez de `grid-cols-2`

### Auto-abertura

```ts
// Abre automaticamente só quando a primeira Polaroid é salva
useEffect(() => {
  if (saved.length === 1 && /* condição para evitar re-open */) {
    setMobileSavedOpen(true);
  }
}, [saved.length]);
```

Controle preciso: comparar `prevLength` com `saved.length` via `useRef` para abrir apenas quando `prevLength === 0 && saved.length === 1`. Não reabrir se o usuário fechou manualmente.

---

## Checklist de validação final

- [ ] Desktop continua exatamente igual (sem nenhuma classe `lg:` tocada)
- [ ] Mobile tem barra superior fixa com dropdown de tamanho e botão Finalizar
- [ ] Mobile tem barra inferior fixa com 6 botões
- [ ] Polaroid está grande, centralizada opticamente com grid 3 colunas
- [ ] Botões Trocar, Remover, Salvar estão na lateral direita da Polaroid
- [ ] Painel Fonte abre horizontal acima da barra inferior, fecha ao clicar fora
- [ ] Painel Tamanho abre horizontal acima da barra inferior, fecha ao clicar fora
- [ ] Fonte e Tamanho não ficam abertos simultaneamente
- [ ] Card "Minhas Polaroids" funciona como aba com carrossel horizontal
- [ ] Auto-abertura do card apenas na primeira Polaroid salva
- [ ] Sem scroll vertical desnecessário na tela principal mobile
- [ ] Sem duplicação de botões entre barra inferior e lateral da Polaroid
- [ ] Todas as funções existentes são reaproveitadas sem alteração de lógica
- [ ] Safe-area respeitada na barra inferior (iOS)
- [ ] `mobileFontPanelOpen` e `mobileSizePanelOpen` nunca abertos simultaneamente
- [ ] `mobileSizeDropdownOpen` fecha ao clicar fora com o padrão do `flipMenuOpen`
