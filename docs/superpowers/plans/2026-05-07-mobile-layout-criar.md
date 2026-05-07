# Mobile Layout — Página de Criação de Polaroids — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o layout mobile de `src/routes/criar.tsx` com barra superior fixa (dropdown de tamanho + Finalizar), Polaroid grande centralizada com botões laterais, barra inferior fixa com 6 ações, painéis flutuantes de Fonte e Tamanho, e card colapsável "Minhas Polaroids" — sem tocar no desktop, sem duplicar lógica.

**Architecture:** Tudo inline no arquivo `src/routes/criar.tsx`, usando `lg:hidden` / `hidden lg:block` / `max-lg:` para isolar mobile do desktop. Novos estados de UI (`mobileSizeDropdownOpen`, `mobileFontPanelOpen`, `mobileSizePanelOpen`, `mobileSavedOpen`) adicionados ao componente `CriarPage`. Funções e estados existentes reutilizados sem alteração.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, TanStack Router, Lucide React (ícones já importados)

---

## Mapa de arquivos

| Arquivo | Ação | O que muda |
|---------|------|------------|
| `src/routes/criar.tsx` | Modificar | Novos estados, novos useEffects, reestruturação de JSX mobile, barra superior fixa, barra inferior fixa, painéis flutuantes, card "Minhas Polaroids" mobile |

Nenhum arquivo novo. Desktop não é tocado.

---

## Task 1: Adicionar estados e ref mobile

**Files:**
- Modify: `src/routes/criar.tsx:490-495`

- [ ] **Step 1: Adicionar 4 novos estados após linha 490** (`const [flipMenuOpen, setFlipMenuOpen] = useState(false);`)

```tsx
const [flipMenuOpen, setFlipMenuOpen] = useState(false);
const [mobileSizeDropdownOpen, setMobileSizeDropdownOpen] = useState(false);
const [mobileFontPanelOpen, setMobileFontPanelOpen] = useState(false);
const [mobileSizePanelOpen, setMobileSizePanelOpen] = useState(false);
const [mobileSavedOpen, setMobileSavedOpen] = useState(false);
```

- [ ] **Step 2: Adicionar ref após `uploadAbortRef` (linha 495)**

```tsx
const uploadAbortRef = useRef<string | null>(null);
const prevSavedLengthRef = useRef(0);
```

- [ ] **Step 3: Verificar que o TypeScript não reporta erros**

```powershell
cd c:\Users\leona\Desktop\EditPolaroids
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros relacionados às novas variáveis.

- [ ] **Step 4: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): add mobile panel state vars and prevSavedLengthRef"
```

---

## Task 2: Adicionar useEffects de controle dos painéis mobile

**Files:**
- Modify: `src/routes/criar.tsx` — após o `useEffect([flipMenuOpen])` (que termina por volta da linha 565)

- [ ] **Step 1: Adicionar 4 useEffects após o bloco do `flipMenuOpen`**

Localizar o bloco:
```tsx
  }, [flipMenuOpen]);
```
E adicionar logo após:

```tsx
  useEffect(() => {
    if (!mobileSizeDropdownOpen) return;
    const close = () => setMobileSizeDropdownOpen(false);
    const timerId = window.setTimeout(() => {
      document.addEventListener("click", close, { once: true });
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("click", close);
    };
  }, [mobileSizeDropdownOpen]);

  useEffect(() => {
    if (!mobileFontPanelOpen) return;
    const close = () => setMobileFontPanelOpen(false);
    const timerId = window.setTimeout(() => {
      document.addEventListener("click", close, { once: true });
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("click", close);
    };
  }, [mobileFontPanelOpen]);

  useEffect(() => {
    if (!mobileSizePanelOpen) return;
    const close = () => setMobileSizePanelOpen(false);
    const timerId = window.setTimeout(() => {
      document.addEventListener("click", close, { once: true });
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("click", close);
    };
  }, [mobileSizePanelOpen]);

  useEffect(() => {
    if (prevSavedLengthRef.current === 0 && saved.length === 1) {
      setMobileSavedOpen(true);
    }
    prevSavedLengthRef.current = saved.length;
  }, [saved.length]);
```

- [ ] **Step 2: Verificar TypeScript**

```powershell
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): add useEffects for mobile panel close-on-outside and auto-open saved card"
```

---

## Task 3: Restructurar container raiz e `<main>` para 100dvh no mobile

**Files:**
- Modify: `src/routes/criar.tsx:926` (`.criar-page` div)
- Modify: `src/routes/criar.tsx:947` (`<main>`)
- Modify: `src/routes/criar.tsx:948` (`<section>` do top bar — esconder no mobile)

- [ ] **Step 1: Alterar `.criar-page` div (linha 926)**

Localizar:
```tsx
    <div className="criar-page min-h-screen lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
```

Substituir por:
```tsx
    <div className="criar-page h-[100dvh] overflow-hidden">
```

Justificativa: `h-[100dvh] overflow-hidden` aplica em mobile E desktop. As classes `lg:` antigas eram redundantes e `min-h-screen` impedia a altura fixa no mobile.

- [ ] **Step 2: Alterar `<main>` (linha 947)**

Localizar:
```tsx
      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
```

Substituir por:
```tsx
      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4 lg:h-full lg:min-h-0 lg:overflow-hidden max-lg:p-0 max-lg:max-w-none max-lg:h-full max-lg:flex max-lg:flex-col max-lg:overflow-hidden">
```

- [ ] **Step 3: Esconder a `<section>` de controles no mobile (linha 948)**

Localizar:
```tsx
        <section className="leather-card criar-fade-up criar-delay-1 criar-panel-motion mx-auto mb-3 p-2 lg:max-w-6xl lg:shrink-0 lg:px-4 lg:py-2.5">
```

Substituir por:
```tsx
        <section className="leather-card criar-fade-up criar-delay-1 criar-panel-motion mx-auto mb-3 p-2 lg:max-w-6xl lg:shrink-0 lg:px-4 lg:py-2.5 max-lg:hidden">
```

`max-lg:hidden` esconde a section inteira (mobile + desktop) no mobile; o desktop continua vendo `hidden lg:block` no interior. Como o desktop é `max-lg:hidden` = `display:none` em < 1024px, mas `display:block` em >= 1024px, a section voltará a aparecer para o desktop.

- [ ] **Step 4: Adicionar spacer do topo e do rodapé no mobile, dentro de `<main>`**

Após `</section>` (linha ~1069) e ANTES do grid `<div>` (linha ~1071), inserir:
```tsx
        {/* Spacer mobile: compensa a barra superior fixa de 52px */}
        <div className="lg:hidden h-[52px] shrink-0" />
```

Após o fechamento do grid `<div>` (depois da última `</aside>`, por volta da linha ~1751) e ANTES de `</main>`, inserir:
```tsx
        {/* Spacer mobile: compensa a barra inferior fixa */}
        <div className="lg:hidden shrink-0" style={{ height: "calc(68px + env(safe-area-inset-bottom))" }} />
```

- [ ] **Step 5: Alterar o grid div para flex-1 no mobile (linha ~1071)**

Localizar:
```tsx
        <div className="mx-auto grid items-stretch justify-center gap-3 lg:h-[calc(100dvh-11.75rem)] lg:min-h-0 lg:max-h-[42rem] lg:overflow-hidden lg:grid-cols-[300px_minmax(460px,560px)_300px] lg:gap-6">
```

Substituir por:
```tsx
        <div className="mx-auto grid items-stretch justify-center gap-3 lg:h-[calc(100dvh-11.75rem)] lg:min-h-0 lg:max-h-[42rem] lg:overflow-hidden lg:grid-cols-[300px_minmax(460px,560px)_300px] lg:gap-6 max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-hidden">
```

- [ ] **Step 6: Verificar no browser (mobile viewport)**

Abrir `http://localhost:5173/criar` no browser. No DevTools, ativar "Toggle device toolbar" e selecionar iPhone 14 (390×844). Verificar:
- Tela não tem scroll vertical
- O layout cobre 100% da altura
- Desktop (largura > 1024px): visual igual ao anterior

- [ ] **Step 7: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): restructure criar-page and main for 100dvh flex-col mobile layout"
```

---

## Task 4: Adicionar barra superior fixa no mobile

**Files:**
- Modify: `src/routes/criar.tsx` — inserir antes de `<main>` (após o styleWarning overlay)

- [ ] **Step 1: Inserir a barra fixa superior APÓS o fechamento do overlay `styleWarning` (linha ~945) e ANTES de `<main>` (linha ~947)**

Localizar o padrão:
```tsx
      )}

      <main className="mx-auto
```

Inserir entre `)}` e `<main`:

```tsx
      {/* MOBILE: Barra superior fixa */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex h-[52px] items-center justify-between border-b border-border bg-paper/95 px-4 shadow-soft backdrop-blur-sm">
        {/* Dropdown de tamanho da Polaroid */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              setMobileSizeDropdownOpen((v) => !v);
              setMobileFontPanelOpen(false);
              setMobileSizePanelOpen(false);
            }}
            className="criar-control flex items-center gap-1.5 rounded-xl border border-border bg-paper px-3 py-1.5 text-sm font-medium text-ink shadow-soft"
          >
            Polaroid {selectedPolaroidSize.label}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                mobileSizeDropdownOpen && "rotate-180",
              )}
            />
          </button>

          {mobileSizeDropdownOpen && (
            <div
              className="absolute left-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-paper shadow-polaroid"
              onClick={(e) => e.stopPropagation()}
            >
              {polaroidSizes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({ ...d, polaroidSizeId: item.id }));
                    setMobileSizeDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                    draft.polaroidSizeId === item.id
                      ? "bg-ink/5 font-semibold text-ink"
                      : "text-muted-foreground hover:bg-cream",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão Finalizar */}
        <Button
          onClick={finalizarPedido}
          className="h-9 cursor-pointer rounded-md border border-transparent bg-black px-4 text-sm font-medium text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97]"
        >
          Finalizar
        </Button>
      </div>
```

- [ ] **Step 2: Verificar no mobile**

Com DevTools em iPhone 14:
- Topo da tela mostra barra com "Polaroid 7x10" e "Finalizar"
- Clicar em "Polaroid 7x10" abre dropdown com 3 opções
- Selecionar "5x8" atualiza o botão para "Polaroid 5x8" e a Polaroid muda de tamanho
- Clicar fora fecha o dropdown
- Desktop (> 1024px): barra NÃO aparece (lg:hidden)

- [ ] **Step 3: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): add fixed top bar with polaroid size dropdown and finalizar button"
```

---

## Task 5: Esconder asides no mobile + flex-1 na seção central

**Files:**
- Modify: `src/routes/criar.tsx:1073` (left aside)
- Modify: `src/routes/criar.tsx:1189` (center section)
- Modify: `src/routes/criar.tsx:1190` (leather-card div)
- Modify: `src/routes/criar.tsx:1191` (inner flex div)
- Modify: `src/routes/criar.tsx:1604` (right aside)

- [ ] **Step 1: Esconder left aside no mobile (linha ~1073)**

Localizar:
```tsx
          <aside className="criar-fade-up criar-delay-2 order-3 lg:order-1 lg:h-full lg:min-h-0">
```

Substituir por:
```tsx
          <aside className="criar-fade-up criar-delay-2 order-3 lg:order-1 lg:h-full lg:min-h-0 hidden lg:block">
```

- [ ] **Step 2: Esconder right aside no mobile (linha ~1604)**

Localizar:
```tsx
          <aside className="criar-fade-up criar-delay-4 order-4 flex flex-col lg:order-3 lg:h-full lg:min-h-0">
```

Substituir por:
```tsx
          <aside className="criar-fade-up criar-delay-4 order-4 flex flex-col lg:order-3 lg:h-full lg:min-h-0 hidden lg:flex">
```

- [ ] **Step 3: Fazer a center section ocupar flex-1 no mobile (linha ~1189)**

Localizar:
```tsx
          <section className="criar-fade-up criar-delay-3 order-2 lg:order-2 lg:h-full lg:min-h-0">
```

Substituir por:
```tsx
          <section className="criar-fade-up criar-delay-3 order-2 lg:order-2 lg:h-full lg:min-h-0 max-lg:flex max-lg:flex-col max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-hidden">
```

- [ ] **Step 4: Propagar flex-1 para o leather-card div (linha ~1190)**

Localizar:
```tsx
            <div className="leather-card criar-plain-card criar-panel-motion flex h-full min-h-0 flex-col items-center justify-center border-0 bg-transparent p-0 shadow-none lg:border lg:bg-paper lg:p-3 lg:shadow-soft">
```

Substituir por:
```tsx
            <div className="leather-card criar-plain-card criar-panel-motion flex h-full min-h-0 flex-col items-center justify-center border-0 bg-transparent p-0 shadow-none lg:border lg:bg-paper lg:p-3 lg:shadow-soft max-lg:flex-1 max-lg:min-h-0 max-lg:items-stretch">
```

- [ ] **Step 5: Propagar flex-1 para o inner flex div (linha ~1191)**

Localizar:
```tsx
              <div className="flex h-full w-full max-w-lg flex-col gap-2 lg:gap-3">
```

Substituir por:
```tsx
              <div className="flex h-full w-full max-w-lg flex-col gap-2 lg:gap-3 max-lg:max-w-none max-lg:flex-1 max-lg:min-h-0 max-lg:gap-0">
```

- [ ] **Step 6: Verificar no mobile**

No DevTools iPhone 14:
- Seção central ocupa toda a área disponível entre o spacer do topo e o spacer do rodapé
- Left aside (Fontes) NÃO aparece no mobile
- Right aside (Minhas Polaroids) NÃO aparece no mobile
- Desktop: ambos os asides continuam aparecendo normalmente

- [ ] **Step 7: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): hide side asides on mobile, center section takes full flex-1 height"
```

---

## Task 6: Grid 3 colunas na área da Polaroid + botões laterais

**Files:**
- Modify: `src/routes/criar.tsx:1192` (container div da Polaroid)

- [ ] **Step 1: Transformar o container da Polaroid em grid 3 colunas no mobile (linha ~1192)**

Localizar:
```tsx
                <div className="relative flex min-h-0 flex-1 flex-col border-0 bg-transparent p-0 lg:rounded-2xl lg:border lg:border-border/70 lg:bg-[#f5ece0] lg:p-3">
```

Substituir por:
```tsx
                <div className="relative flex min-h-0 flex-1 flex-col border-0 bg-transparent p-0 lg:rounded-2xl lg:border lg:border-border/70 lg:bg-[#f5ece0] lg:p-3 max-lg:grid max-lg:grid-cols-[1fr_auto_1fr] max-lg:items-center max-lg:gap-1 max-lg:flex-none max-lg:flex-1">
```

- [ ] **Step 2: Adicionar coluna fantasma (phantom) ANTES do polaroid wrapper (linha ~1193)**

Localizar o padrão que começa logo dentro do container alterado:
```tsx
                  <div className="flex min-h-0 flex-1 items-center justify-center">
```

Inserir ANTES dessa linha:
```tsx
                  {/* Mobile phantom col: espelha a largura dos botões laterais para centralizar a Polaroid */}
                  <div className="lg:hidden" aria-hidden="true" />
```

- [ ] **Step 3: Adicionar botões laterais APÓS o fechamento do polaroid wrapper (linha ~1436)**

Localizar o fechamento do polaroid wrapper (a linha `</div>` que fecha `div.flex.min-h-0.flex-1.items-center.justify-center`). O padrão a encontrar é o trecho:
```tsx
                    </div>
                  </div>
                </div>
```
Onde a última `</div>` fecha o container de linha 1192. Inserir OS BOTÕES ANTES desse último fechamento, após o fechamento do wrapper (linha 1193). Na prática, encontrar:

```tsx
                  </div>
                </div>

                {draft.photoLocalUrl && !isAdjustingImage && (
```

E inserir entre `</div>` (fecha linha 1193) e `</div>` (fecha linha 1192):

```tsx
                  {/* Mobile side buttons (col 3): Trocar, Remover, Salvar */}
                  <div
                    className="lg:hidden flex flex-col items-center gap-3 px-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {draft.photoLocalUrl && !isAdjustingImage && (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={pickFile}
                            className="criar-control flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-paper shadow-soft transition-all active:scale-95"
                            aria-label="Trocar foto"
                          >
                            <Upload className="h-4 w-4 text-ink" />
                          </button>
                          <span className="text-[9px] font-medium leading-none text-muted-foreground">
                            Trocar
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={removerDraftAtual}
                            className="criar-control flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-paper shadow-soft transition-all active:scale-95"
                            aria-label="Remover foto"
                          >
                            <Trash2 className="h-4 w-4 text-ink" />
                          </button>
                          <span className="text-[9px] font-medium leading-none text-muted-foreground">
                            Remover
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={concluir}
                            className="criar-control flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white shadow-soft transition-all active:scale-95"
                            aria-label="Salvar Polaroid"
                          >
                            <Save className="h-4 w-4 text-ink" />
                          </button>
                          <span className="text-[9px] font-medium leading-none text-muted-foreground">
                            Salvar
                          </span>
                        </div>
                      </>
                    )}
                  </div>
```

- [ ] **Step 4: Esconder o bloco de 7 botões horizontais no mobile (linha ~1440)**

Localizar:
```tsx
                  <div className="criar-fade-up relative z-20 flex shrink-0 flex-col items-center gap-2">
```

Substituir por:
```tsx
                  <div className="criar-fade-up relative z-20 hidden lg:flex shrink-0 flex-col items-center gap-2">
```

- [ ] **Step 5: Verificar no mobile**

No DevTools iPhone 14:
- Polaroid está centralizada na tela
- À direita da Polaroid aparecem os botões Trocar, Remover e Salvar (quando há foto carregada)
- A coluna esquerda (fantasma) equilibra o layout, mantendo a Polaroid centrada
- Desktop: botões horizontais abaixo da Polaroid continuam iguais

- [ ] **Step 6: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): 3-col grid for polaroid + side action buttons (Trocar/Remover/Salvar)"
```

---

## Task 7: Card "Minhas Polaroids" mobile com carrossel horizontal

**Files:**
- Modify: `src/routes/criar.tsx` — inserir após o container div da Polaroid (linha ~1437) e antes dos botões horizontais (linha ~1439), dentro do `div.flex.h-full.w-full.max-w-lg`

- [ ] **Step 1: Inserir o card mobile "Minhas Polaroids" após o fechamento do container da Polaroid**

Localizar o padrão exato (o `</div>` que fecha o container de linha 1192, seguido da condicional de botões):
```tsx
                </div>

                {draft.photoLocalUrl && !isAdjustingImage && (
                  <div className="criar-fade-up relative z-20 hidden lg:flex shrink-0 flex-col items-center gap-2">
```

Inserir entre `</div>` e `{draft.photoLocalUrl`:

```tsx
                {/* MOBILE: Card "Minhas Polaroids" colapsável */}
                <div className="lg:hidden mt-2 shrink-0 mx-0 rounded-2xl border border-border bg-paper shadow-soft">
                  {/* Cabeçalho sempre visível */}
                  <button
                    type="button"
                    onClick={() => setMobileSavedOpen((v) => !v)}
                    className="criar-control flex w-full items-center justify-between px-4 py-3"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-display text-base font-medium text-ink">
                        Minhas Polaroids
                      </span>
                      {saved.length > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          {saved.length} {saved.length === 1 ? "foto" : "fotos"} •{" "}
                          {totalPedidoFormatado}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        mobileSavedOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Área interna (visível apenas quando aberta) */}
                  {mobileSavedOpen && (
                    <div className="border-t border-border">
                      {saved.length === 0 ? (
                        <div className="mx-3 mb-3 mt-2 rounded-xl border border-dashed border-border p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Nenhuma Polaroid criada ainda.
                          </p>
                        </div>
                      ) : (
                        <div
                          className="flex flex-row gap-3 overflow-x-auto px-3 pb-3 pt-2"
                          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
                        >
                          {saved.map((item) => {
                            const it = templates.find((t) => t.id === item.templateId)!;
                            const itemFontStyle = item.fontStyleId
                              ? fontStyles.find((style) => style.id === item.fontStyleId)
                              : null;
                            const itemPolaroidSize =
                              polaroidSizes.find((size) => size.id === item.polaroidSizeId) ??
                              polaroidSizes[0];
                            const gallerySlotStyle = getGallerySlotStyle(itemPolaroidSize);
                            const cardWidth = gallerySlotStyle.width;
                            const isSelected = item.id === draft.id;

                            return (
                              <div
                                key={item.id}
                                className="criar-saved-card criar-fade-up relative shrink-0"
                                style={{ width: cardWidth, scrollSnapAlign: "start" }}
                              >
                                <div className="mb-2 text-center text-[11px] font-medium text-muted-foreground">
                                  {itemPolaroidSize.label} cm
                                </div>

                                <div
                                  className="relative flex items-start justify-center"
                                  style={gallerySlotStyle}
                                >
                                  <button
                                    type="button"
                                    onClick={() => editarSalva(item)}
                                    className={cn(
                                      "absolute inset-0 z-10 rounded-md transition-[box-shadow,filter] duration-200 hover:ring-2 hover:ring-ink/20 hover:ring-offset-2 hover:ring-offset-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/35 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                                      isSelected &&
                                        "ring-2 ring-ink/40 ring-offset-2 ring-offset-paper",
                                    )}
                                    aria-label="Editar Polaroid"
                                  />

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDraftIdPendenteRemocao(item.id);
                                    }}
                                    className="absolute -right-1.5 -top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-paper shadow-soft transition-opacity duration-150 hover:bg-cream focus:outline-none"
                                    aria-label="Remover Polaroid"
                                  >
                                    <X className="h-2.5 w-2.5 text-muted-foreground" />
                                  </button>

                                  <div
                                    className="origin-top-left"
                                    style={{
                                      transform: `scale(${itemPolaroidSize.galleryScale})`,
                                      transformOrigin: "top center",
                                    }}
                                  >
                                    <div
                                      className="polaroid box-border max-w-none"
                                      style={{
                                        width: `${itemPolaroidSize.widthCm}cm`,
                                        height: `${itemPolaroidSize.heightCm}cm`,
                                      }}
                                    >
                                      <div
                                        className={cn(
                                          "relative w-full overflow-hidden bg-muted",
                                          it.toneClass,
                                        )}
                                        style={{ height: `${itemPolaroidSize.imageHeightCm}cm` }}
                                      >
                                        {item.photoLocalUrl && (
                                          <img
                                            src={item.photoLocalUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                            style={{
                                              objectPosition: `${item.imagePosX}% ${item.imagePosY}%`,
                                              transform: getImageTransform(item),
                                            }}
                                          />
                                        )}
                                      </div>

                                      <p
                                        className="absolute bottom-0 left-3 right-3 flex items-center justify-center overflow-hidden px-2 text-black leading-tight"
                                        style={{
                                          top: `calc(0.75rem + ${itemPolaroidSize.imageHeightCm}cm)`,
                                        }}
                                      >
                                        <span
                                          className={cn(
                                            "inline-block w-full max-w-full break-words leading-tight",
                                            alignClass[item.align],
                                            itemFontStyle?.fontClass,
                                            fontWeightClass[item.fontWeightId ?? "regular"],
                                            getCaptionSizeClass(item.polaroidSizeId, item.size),
                                          )}
                                        >
                                          {item.caption || " "}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
```

- [ ] **Step 2: Verificar no mobile**

No DevTools iPhone 14:
- Abaixo da Polaroid aparece o card "Minhas Polaroids" com cabeçalho clicável
- Clicar no cabeçalho abre/fecha o card
- Sem nenhuma Polaroid salva: card mostra "Nenhuma Polaroid criada ainda."
- Ao salvar a primeira Polaroid (botão lateral "Salvar"), o card abre automaticamente e mostra a Polaroid em miniatura
- Com múltiplas Polaroids, o carrossel arrasta horizontalmente
- Botão X remove a Polaroid; clicar nela carrega de volta para edição
- Desktop: este card NÃO aparece (lg:hidden)

- [ ] **Step 3: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): add collapsible Minhas Polaroids card with horizontal carousel"
```

---

## Task 8: Barra inferior fixa com 6 botões

**Files:**
- Modify: `src/routes/criar.tsx` — inserir após `</main>` e antes dos modais Dialog

- [ ] **Step 1: Inserir a barra inferior fixa após `</main>` (por volta da linha ~1752)**

Localizar:
```tsx
      </main>

      {/* MODAL CONFIRMAÇÃO REMOÇÃO */}
```

Inserir entre `</main>` e `{/* MODAL CONFIRMAÇÃO REMOÇÃO */}`:

```tsx
      {/* MOBILE: Barra inferior fixa */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-paper/95 backdrop-blur-sm shadow-[0_-1px_12px_rgba(60,45,30,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 pb-1 pt-2">
          {/* Texto */}
          <button
            type="button"
            onClick={() => setMobileCaptionEditing(true)}
            className={cn(
              "criar-control flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all active:scale-95",
              !draft.photoLocalUrl && "pointer-events-none opacity-40",
            )}
            aria-label="Editar texto"
          >
            <Type className="h-5 w-5 text-ink" />
            <span className="text-[10px] font-medium leading-none text-muted-foreground">
              Texto
            </span>
          </button>

          {/* Fonte */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileFontPanelOpen((v) => !v);
              setMobileSizePanelOpen(false);
            }}
            className={cn(
              "criar-control flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all active:scale-95",
              mobileFontPanelOpen && "bg-ink/5",
              !draft.photoLocalUrl && "pointer-events-none opacity-40",
            )}
            aria-label="Escolher fonte"
          >
            <FileText className="h-5 w-5 text-ink" />
            <span className="text-[10px] font-medium leading-none text-muted-foreground">
              Fonte
            </span>
          </button>

          {/* Tamanho do texto */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileSizePanelOpen((v) => !v);
              setMobileFontPanelOpen(false);
            }}
            className={cn(
              "criar-control flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all active:scale-95",
              mobileSizePanelOpen && "bg-ink/5",
              !draft.photoLocalUrl && "pointer-events-none opacity-40",
            )}
            aria-label="Tamanho do texto"
          >
            <Layers className="h-5 w-5 text-ink" />
            <span className="text-[10px] font-medium leading-none text-muted-foreground">
              Tamanho
            </span>
          </button>

          {/* Alinhar */}
          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({ ...d, align: nextAlign[d.align] }))
            }
            className={cn(
              "criar-control flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all active:scale-95",
              !draft.photoLocalUrl && "pointer-events-none opacity-40",
            )}
            aria-label="Alinhar texto"
          >
            {draft.align === "left" ? (
              <AlignLeft className="h-5 w-5 text-ink" />
            ) : draft.align === "center" ? (
              <AlignJustify className="h-5 w-5 text-ink" />
            ) : draft.align === "right" ? (
              <AlignRight className="h-5 w-5 text-ink" />
            ) : (
              <AlignCenter className="h-5 w-5 text-ink" />
            )}
            <span className="text-[10px] font-medium leading-none text-muted-foreground">
              Alinhar
            </span>
          </button>

          {/* Inverter */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFlipMenuOpen((v) => !v);
              }}
              className={cn(
                "criar-control flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all active:scale-95",
                !draft.photoLocalUrl && "pointer-events-none opacity-40",
              )}
              aria-label="Inverter imagem"
            >
              <FlipHorizontal2 className="h-5 w-5 text-ink" />
              <span className="text-[10px] font-medium leading-none text-muted-foreground">
                Inverter
              </span>
            </button>
            {flipMenuOpen && (
              <div className="absolute bottom-full left-1/2 z-[101] mb-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-[#2a2f3a] bg-[#1a1c23] shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({ ...d, flipHorizontal: !d.flipHorizontal }));
                    setFlipMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 transition-colors hover:bg-[#2a2f3a]"
                >
                  <FlipHorizontal2 className="h-3.5 w-3.5 shrink-0" />
                  Inverter horizontalmente
                </button>
                <div className="h-px bg-[#2a2f3a]" />
                <button
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({ ...d, flipVertical: !d.flipVertical }));
                    setFlipMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 transition-colors hover:bg-[#2a2f3a]"
                >
                  <FlipVertical2 className="h-3.5 w-3.5 shrink-0" />
                  Inverter verticalmente
                </button>
              </div>
            )}
          </div>

          {/* Posição */}
          <button
            type="button"
            onClick={() => setIsAdjustingImage(true)}
            className={cn(
              "criar-control flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all active:scale-95",
              !draft.photoLocalUrl && "pointer-events-none opacity-40",
            )}
            aria-label="Ajustar posição"
          >
            <Pencil className="h-5 w-5 text-ink" />
            <span className="text-[10px] font-medium leading-none text-muted-foreground">
              Posição
            </span>
          </button>
        </div>
      </div>
```

- [ ] **Step 2: Verificar no mobile**

No DevTools iPhone 14:
- Barra inferior fixa com 6 botões: Texto, Fonte, Tamanho, Alinhar, Inverter, Posição
- Sem foto carregada: botões aparecem com opacity reduzida (não clicáveis)
- Com foto: botões funcionam normalmente
- "Posição" ativa o modo de ajuste de imagem
- "Alinhar" alterna entre os alinhamentos
- "Inverter" abre o submenu com as opções horizontal/vertical
- Desktop: barra NÃO aparece

- [ ] **Step 3: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): add fixed bottom toolbar with 6 action buttons"
```

---

## Task 9: Painéis flutuantes de Fonte e Tamanho

**Files:**
- Modify: `src/routes/criar.tsx` — inserir entre a barra inferior e os modais Dialog

- [ ] **Step 1: Inserir painel de Fonte e painel de Tamanho após a barra inferior e ANTES dos modais**

Localizar:
```tsx
      {/* MODAL CONFIRMAÇÃO REMOÇÃO */}
      <Dialog
```

Inserir antes de `{/* MODAL CONFIRMAÇÃO REMOÇÃO */}`:

```tsx
      {/* MOBILE: Painel de fontes flutuante */}
      {mobileFontPanelOpen && (
        <div
          className="lg:hidden fixed left-0 right-0 z-[55] rounded-t-2xl border-t border-border bg-paper shadow-[0_-4px_20px_rgba(60,45,30,0.1)]"
          style={{ bottom: "calc(68px + env(safe-area-inset-bottom))" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pb-1 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fonte
            </span>
          </div>
          <div
            className="flex flex-row gap-3 overflow-x-auto px-4 pb-4 pt-2"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {fontStyles.map((style) => {
              const active = style.id === draft.fontStyleId;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    selecionarFonte(style);
                    setMobileFontPanelOpen(false);
                  }}
                  style={{ scrollSnapAlign: "start" }}
                  className={cn(
                    "criar-control flex shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-3 py-2.5 transition-all",
                    active
                      ? "border-ink bg-ink/5"
                      : "border-border bg-paper hover:bg-cream",
                  )}
                >
                  <span className={cn("text-base leading-tight text-ink", style.fontClass)}>
                    AaBb
                  </span>
                  <span className="max-w-[72px] truncate text-center text-[10px] leading-tight text-muted-foreground">
                    {style.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MOBILE: Painel de tamanho do texto flutuante */}
      {mobileSizePanelOpen && (
        <div
          className="lg:hidden fixed left-0 right-0 z-[55] rounded-t-2xl border-t border-border bg-paper shadow-[0_-4px_20px_rgba(60,45,30,0.1)]"
          style={{ bottom: "calc(68px + env(safe-area-inset-bottom))" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pb-1 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tamanho do texto
            </span>
          </div>
          <div className="flex flex-row gap-3 px-4 pb-4 pt-2">
            {(["sm", "md", "lg"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setDraft((d) => ({ ...d, size: s }));
                  setMobileSizePanelOpen(false);
                }}
                className={cn(
                  "criar-control flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-3 transition-all",
                  draft.size === s
                    ? "border-ink bg-ink text-paper"
                    : "border-border bg-paper text-ink hover:bg-cream",
                )}
              >
                <span className="text-lg font-semibold leading-none">
                  {s === "sm" ? "P" : s === "md" ? "M" : "G"}
                </span>
                <span className="text-[10px] leading-none opacity-70">
                  {s === "sm" ? "Pequeno" : s === "md" ? "Médio" : "Grande"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
```

- [ ] **Step 2: Verificar no mobile**

No DevTools iPhone 14:
- Botão "Fonte" na barra inferior → abre carrossel horizontal de fontes acima da barra
- Clicar em uma fonte → atualiza o texto da Polaroid e fecha o painel
- Botão "Tamanho" → abre painel com P / M / G acima da barra
- Selecionar um tamanho → atualiza e fecha o painel
- Fonte e Tamanho nunca abertos simultaneamente
- Clicar fora do painel (no body) fecha o painel
- Desktop: painéis NÃO aparecem

- [ ] **Step 3: Verificar TypeScript final**

```powershell
npx tsc --noEmit 2>&1
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): add floating font and text-size panels above bottom toolbar"
```

---

## Task 10: Verificação final e checklist

**Files:**
- Read: `src/routes/criar.tsx` (revisão)
- Browser: `http://localhost:5173/criar`

- [ ] **Step 1: Verificar checklist do spec em mobile (iPhone 14, 390×844)**

Abrir DevTools → Toggle device toolbar → iPhone 14.

| Item | Verificar |
|------|-----------|
| Barra superior | Fixa no topo, "Polaroid 7x10" com seta + "Finalizar" à direita |
| Dropdown tamanho | Abre ao clicar, selecionar muda Polaroid, fecha sozinho |
| Polaroid | Grande, centralizada, proporcional |
| Medidas | Medida lateral e inferior visíveis |
| Botões laterais | Trocar / Remover / Salvar à direita quando há foto |
| Botão Salvar | Fundo branco/claro |
| Barra inferior | Fixa no rodapé, 6 botões com ícone + label |
| Fonte | Abre carrossel horizontal acima da barra |
| Tamanho | Abre P/M/G acima da barra |
| Painéis exclusivos | Fonte e Tamanho não aparecem juntos |
| Inverter | Submenu acima da barra inferior funciona |
| Posição | Ativa modo drag com borda tracejada |
| Texto | Clica e abre input no caption da Polaroid |
| Minhas Polaroids | Card colapsável abaixo da Polaroid |
| Auto-abertura | Abre na primeira Polaroid salva |
| Carrossel | Drag horizontal com múltiplas Polaroids |
| Remover no carrossel | Botão X funciona |
| Sem scroll vertical | Tela principal não scrolla |
| Safe area | Barra inferior respeita safe area (testar em Safari iPhone) |

- [ ] **Step 2: Verificar desktop (≥ 1024px)**

Trocar para viewport desktop (1440px de largura).

| Item | Verificar |
|------|-----------|
| Top bar desktop | Mostra "Tamanho da Polaroid" + "Tamanho do texto" + "Finalizar" |
| Left aside | Fontes visíveis com lista scrollável |
| Center | Polaroid com background |
| Right aside | "Minhas Polaroids" com grid |
| Botões abaixo da Polaroid | Linha horizontal com 7 botões |
| Barra superior mobile | NÃO aparece |
| Barra inferior mobile | NÃO aparece |
| Card mobile saved | NÃO aparece |

- [ ] **Step 3: Commit final**

```powershell
git add src/routes/criar.tsx
git commit -m "feat(mobile): complete mobile layout redesign — verified desktop parity"
```

---

## Notas de implementação

**Sobre `max-lg:` no Tailwind v4:** A variante `max-lg:` (equivalente a `@media (max-width: 1023px)`) é suportada nativamente no Tailwind v4. Não requer configuração adicional.

**Sobre o painel de fontes e a função `selecionarFonte`:** A função existente chama `setMobileStylesOpen(false)`. Isso é inofensivo — o estado `mobileStylesOpen` existe mas o painel antigo foi substituído. O fechamento do novo painel é feito via `setMobileFontPanelOpen(false)` no `onClick` de cada item.

**Sobre o flipMenu mobile:** O `flipMenuOpen` existente já tem seu `useEffect` de close-on-outside. Na barra inferior, o submenu de Inverter reutiliza exatamente esse mecanismo sem alteração.

**Sobre `scrollSnapType` e `WebkitOverflowScrolling`:** Usados via `style={{}}` (inline) pois o Tailwind v4 não tem utilities diretas para `scroll-snap-type: x mandatory` com `touch`. Alternativa: adicionar `.mobile-carousel { scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }` em `src/styles.css` e usar a classe — mas inline resolve sem tocar no CSS global.
