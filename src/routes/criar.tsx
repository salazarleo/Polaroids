import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Label } from "../components/ui/label";
import {
  Upload,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  MoreHorizontal,
  Save,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { cn } from "../lib/utils";
import t1 from "../assets/template-1.png";
import t2 from "../assets/template-2.png";
import t3 from "../assets/template-3.png";
import t4 from "../assets/template-4.png";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Crie suas Polaroids — Polaroids" },
      {
        name: "description",
        content:
          "Envie suas fotos, escolha um modelo retrô e personalize a frase. Monte suas Polaroids antes de finalizar.",
      },
      { property: "og:title", content: "Crie suas Polaroids — Polaroids" },
      {
        property: "og:description",
        content:
          "Editor simples e elegante para criar Polaroids personalizadas com frases e modelos prontos.",
      },
    ],
  }),
  component: CriarPage,
});

type TemplateId = "amor" | "viagem" | "familia" | "carta" | "minimalista" | "album";
type Size = "sm" | "md" | "lg";
type Align = "default" | "left" | "center" | "right";
type PolaroidSizeId = "7x10" | "5x8" | "4x5";
type FontWeightId = "regular";

type FontStyleId =
  | "arimo"
  | "open-sans"
  | "montserrat"
  | "poppins"
  | "anton"
  | "league-spartan"
  | "glacial-indifference"
  | "canva-sans"
  | "archivo-black"
  | "questrial"
  | "gagalin"
  | "garet"
  | "bebas-neue"
  | "alice"
  | "caveat"
  | "playfair";

interface TemplateDef {
  id: TemplateId;
  name: string;
  thumb: string;
  defaultSize: Size;
  defaultAlign: Align;
  toneClass: string;
}

interface FontStyleDef {
  id: FontStyleId;
  name: string;
  fontClass: string;
  sample: string;
}

interface PolaroidSizeDef {
  id: PolaroidSizeId;
  label: string;
  widthCm: number;
  heightCm: number;
  imageHeightCm: number;
  measureWidthCm: number;
  measureHeightCm: number;
  previewWidthCm: number;
  previewHeightCm: number;
  previewImageHeightCm: number;
  previewMeasureWidthCm: number;
  previewMeasureHeightCm: number;
  previewScale: number;
  galleryScale: number;
}

const DEFAULT_CAPTION_SIZE: Size = "md";

const templates: TemplateDef[] = [
  {
    id: "amor",
    name: "Amor antigo",
    thumb: t1,
    defaultSize: DEFAULT_CAPTION_SIZE,
    defaultAlign: "center",
    toneClass: "",
  },
  {
    id: "viagem",
    name: "Viagem de verão",
    thumb: t2,
    defaultSize: DEFAULT_CAPTION_SIZE,
    defaultAlign: "left",
    toneClass: "",
  },
  {
    id: "familia",
    name: "Família",
    thumb: t3,
    defaultSize: DEFAULT_CAPTION_SIZE,
    defaultAlign: "center",
    toneClass: "",
  },
  {
    id: "carta",
    name: "Carta curta",
    thumb: t4,
    defaultSize: DEFAULT_CAPTION_SIZE,
    defaultAlign: "left",
    toneClass: "",
  },
  {
    id: "minimalista",
    name: "Minimalista",
    thumb: t2,
    defaultSize: DEFAULT_CAPTION_SIZE,
    defaultAlign: "center",
    toneClass: "",
  },
  {
    id: "album",
    name: "Álbum retrô",
    thumb: t1,
    defaultSize: DEFAULT_CAPTION_SIZE,
    defaultAlign: "center",
    toneClass: "sepia-[0.15]",
  },
];

const fontStyles: FontStyleDef[] = [
  {
    id: "arimo",
    name: "Arimo",
    fontClass: "font-arimo",
    sample: "Memórias especiais",
  },
  {
    id: "open-sans",
    name: "Open Sans",
    fontClass: "font-open-sans",
    sample: "Memórias especiais",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    fontClass: "font-montserrat",
    sample: "Memórias especiais",
  },
  {
    id: "poppins",
    name: "Poppins",
    fontClass: "font-poppins",
    sample: "Memórias especiais",
  },
  {
    id: "anton",
    name: "Anton",
    fontClass: "font-anton",
    sample: "Memórias especiais",
  },
  {
    id: "league-spartan",
    name: "League Spartan",
    fontClass: "font-league-spartan",
    sample: "Memórias especiais",
  },
  {
    id: "glacial-indifference",
    name: "Glacial Indifference",
    fontClass: "font-glacial-indifference",
    sample: "Memórias especiais",
  },
  {
    id: "canva-sans",
    name: "Canva Sans",
    fontClass: "font-canva-sans",
    sample: "Memórias especiais",
  },
  {
    id: "archivo-black",
    name: "Archivo Black",
    fontClass: "font-archivo-black",
    sample: "Memórias especiais",
  },
  {
    id: "questrial",
    name: "Questrial",
    fontClass: "font-questrial",
    sample: "Memórias especiais",
  },
  {
    id: "gagalin",
    name: "Gagalin",
    fontClass: "font-gagalin",
    sample: "Memórias especiais",
  },
  {
    id: "garet",
    name: "Garet",
    fontClass: "font-garet",
    sample: "Memórias especiais",
  },
  {
    id: "bebas-neue",
    name: "Bebas Neue",
    fontClass: "font-bebas-neue",
    sample: "Memórias especiais",
  },
  {
    id: "alice",
    name: "Alice",
    fontClass: "font-alice",
    sample: "Memórias especiais",
  },
  {
    id: "caveat",
    name: "Caveat",
    fontClass: "font-caveat",
    sample: "Memórias especiais",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    fontClass: "font-display",
    sample: "Memórias especiais",
  },
];

const polaroidSizes: PolaroidSizeDef[] = [
  {
    id: "7x10",
    label: "7x10",
    widthCm: 7,
    heightCm: 10,
    imageHeightCm: 7.8,
    measureWidthCm: 5.8,
    measureHeightCm: 8.2,

    previewWidthCm: 7,
    previewHeightCm: 10,
    previewImageHeightCm: 7.8,
    previewMeasureWidthCm: 5.8,
    previewMeasureHeightCm: 8.2,
    previewScale: 1,
    galleryScale: 0.36,
  },
  {
    id: "5x8",
    label: "5x8",
    widthCm: 5,
    heightCm: 8,
    imageHeightCm: 6.2,
    measureWidthCm: 4.1,
    measureHeightCm: 6.4,

    previewWidthCm: 5,
    previewHeightCm: 8,
    previewImageHeightCm: 6.2,
    previewMeasureWidthCm: 4.1,
    previewMeasureHeightCm: 6.4,
    previewScale: 1.18,
    galleryScale: 0.48,
  },
  {
    id: "4x5",
    label: "4x5",
    widthCm: 4,
    heightCm: 5,
    imageHeightCm: 3.6,
    measureWidthCm: 3.1,
    measureHeightCm: 4,

    previewWidthCm: 4,
    previewHeightCm: 5,
    previewImageHeightCm: 3.6,
    previewMeasureWidthCm: 3.1,
    previewMeasureHeightCm: 4,
    previewScale: 1.55,
    galleryScale: 0.68,
  },
];

interface PolaroidItem {
  id: string;
  photo: string | null;
  caption: string;
  templateId: TemplateId;
  fontStyleId: FontStyleId | null;
  fontWeightId: FontWeightId;
  polaroidSizeId: PolaroidSizeId;
  size: Size;
  align: Align;
  imagePosX: number;
  imagePosY: number;
}

const captionSizeClass: Record<PolaroidSizeId, Record<Size, string>> = {
  "7x10": {
    sm: "text-[0.95rem]",
    md: "text-[1.08rem]",
    lg: "text-[1.2rem]",
  },
  "5x8": {
    sm: "text-[0.8rem]",
    md: "text-[0.92rem]",
    lg: "text-[1.05rem]",
  },
  "4x5": {
    sm: "text-[0.58rem]",
    md: "text-[0.68rem]",
    lg: "text-[0.78rem]",
  },
};

const fontWeightClass: Record<FontWeightId, string> = {
  regular: "font-normal",
};

const alignClass: Record<Align, string> = {
  default: "text-center",
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const nextAlign: Record<Align, Align> = {
  default: "left",
  left: "center",
  center: "right",
  right: "default",
};

function getFontPreviewText(caption: string, fallback: string) {
  const trimmedCaption = caption.trim();

  return trimmedCaption.length > 0 ? trimmedCaption : fallback;
}

function getGallerySlotStyle(size: PolaroidSizeDef) {
  const scaledWidth = size.widthCm * size.galleryScale;
  const scaledHeight = size.heightCm * size.galleryScale;

  return {
    width: `${Math.ceil(scaledWidth * 38)}px`,
    height: `${Math.ceil(scaledHeight * 38)}px`,
  };
}

function getCaptionSizeClass(polaroidSizeId: PolaroidSizeId, size: Size) {
  return captionSizeClass[polaroidSizeId][size];
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function newDraft(
  templateId: TemplateId = "amor",
  polaroidSizeId: PolaroidSizeId = "7x10",
): PolaroidItem {
  const t = templates.find((x) => x.id === templateId)!;

  return {
    id: crypto.randomUUID(),
    photo: null,
    caption: "",
    templateId,
    fontStyleId: null,
    fontWeightId: "regular",
    polaroidSizeId,
    size: t.defaultSize,
    align: "default",
    imagePosX: 50,
    imagePosY: 50,
  };
}

interface ImageDragState {
  pointerId: number;
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
  areaWidth: number;
  areaHeight: number;
}

function CriarPage() {
  const [draft, setDraft] = useState<PolaroidItem>(() => newDraft());
  const [saved, setSaved] = useState<PolaroidItem[]>([]);
  const [open, setOpen] = useState(false);
  const [styleWarning, setStyleWarning] = useState("");
  const [isAdjustingImage, setIsAdjustingImage] = useState(false);
  const [mobileStylesOpen, setMobileStylesOpen] = useState(false);
  const [mobileCaptionEditing, setMobileCaptionEditing] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<ImageDragState | null>(null);

  const tpl = templates.find((t) => t.id === draft.templateId)!;

  const draftFontStyle = draft.fontStyleId
    ? fontStyles.find((style) => style.id === draft.fontStyleId)
    : null;

  const selectedPolaroidSize =
    polaroidSizes.find((size) => size.id === draft.polaroidSizeId) ?? polaroidSizes[0];
  const previewStageHeightCm = 10;
  const selectedPreviewOffsetTopCm = Math.max(
    0,
    (previewStageHeightCm - selectedPolaroidSize.previewHeightCm) / 2,
  );

  function pickFile() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setDraft((d) => ({
        ...d,
        photo: reader.result as string,
        imagePosX: 50,
        imagePosY: 50,
      }));

      setStyleWarning("");
      setIsAdjustingImage(false);
      setMobileCaptionEditing(false);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function selecionarFonte(style: FontStyleDef) {
    if (!draft.photo) {
      setStyleWarning("Adicione primeiro uma foto");
      return;
    }

    setStyleWarning("");
    setMobileStylesOpen(false);
    setMobileCaptionEditing(false);

    setDraft((d) => ({
      ...d,
      fontStyleId: style.id,
      fontWeightId: "regular",
      caption: d.caption || style.sample,
    }));
  }

  function concluir() {
    if (!draft.photo) return;

    setSaved((s) => {
      const idx = s.findIndex((x) => x.id === draft.id);

      if (idx >= 0) {
        const next = [...s];
        next[idx] = draft;
        return next;
      }

      return [...s, draft];
    });

    setStyleWarning("");
    setIsAdjustingImage(false);
    setMobileCaptionEditing(false);
    setDraft(newDraft(draft.templateId, draft.polaroidSizeId));
  }

  function editarSalva(item: PolaroidItem) {
    setDraft({ ...item });
    setIsAdjustingImage(false);
    setMobileCaptionEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removerSalva(id: string) {
    setSaved((s) => s.filter((x) => x.id !== id));
  }

  function onStartImageDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!isAdjustingImage || !draft.photo) return;

    const rect = e.currentTarget.getBoundingClientRect();

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: draft.imagePosX,
      startPosY: draft.imagePosY,
      areaWidth: rect.width,
      areaHeight: rect.height,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onMoveImageDrag(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!isAdjustingImage || !drag || drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    const nextX = clampPercent(drag.startPosX - (deltaX / Math.max(drag.areaWidth, 1)) * 100);

    const nextY = clampPercent(drag.startPosY - (deltaY / Math.max(drag.areaHeight, 1)) * 100);

    setDraft((d) => ({ ...d, imagePosX: nextX, imagePosY: nextY }));
  }

  function onEndImageDrag(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== e.pointerId) return;

    dragRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <div className="min-h-screen lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
      {isAdjustingImage && <div className="fixed inset-0 z-40 bg-black/55" />}

      {styleWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-[1px]"
          role="alertdialog"
          aria-live="assertive"
        >
          <div className="w-full max-w-xs rounded-2xl border border-border bg-paper p-5 text-center shadow-soft">
            <p className="text-sm font-medium text-ink">{styleWarning}</p>

            <Button
              type="button"
              onClick={() => setStyleWarning("")}
              className="mt-4 h-10 w-full rounded-full bg-ink text-sm font-medium text-paper hover:bg-ink/90"
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <section className="leather-card mx-auto mb-3 p-2 lg:max-w-6xl lg:shrink-0 lg:px-4 lg:py-2.5">
          {/* MOBILE - BARRA DE PERSONALIZAR */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Polaroid
                </p>
                <div className="grid grid-cols-3 overflow-hidden rounded-full border border-border bg-paper">
                  {polaroidSizes.map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          polaroidSizeId: item.id,
                        }))
                      }
                      className={cn(
                        "px-1.5 py-1.5 text-[10px] transition-colors",
                        draft.polaroidSizeId === item.id
                          ? "bg-ink text-paper"
                          : "text-ink hover:bg-cream",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Texto
                </p>
                <div className="grid grid-cols-3 overflow-hidden rounded-full border border-border bg-paper">
                  {(["sm", "md", "lg"] as Size[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDraft((d) => ({ ...d, size: s }))}
                      className={cn(
                        "px-1.5 py-1.5 text-[10px] transition-colors",
                        draft.size === s ? "bg-ink text-paper" : "text-ink hover:bg-cream",
                      )}
                    >
                      {s === "sm" ? "P" : s === "md" ? "M" : "G"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setOpen(true)}
              disabled={saved.length === 0 && !draft.photo}
              className="mt-2 h-8 w-full rounded-full bg-ink text-xs font-medium text-paper hover:bg-ink/90"
            >
              Salvar e finalizar
            </Button>
          </div>

          {/* DESKTOP - PERSONALIZAR */}
          <div className="hidden lg:block">
            <div className="flex justify-center">
              <div className="grid w-full max-w-3xl grid-cols-[220px_220px_auto] items-end justify-center gap-4">
                <div>
                  <Label className="text-sm font-medium text-ink">Tamanho da Polaroid</Label>

                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {polaroidSizes.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            polaroidSizeId: item.id,
                          }))
                        }
                        className={cn(
                          "rounded-md border px-2 py-2 text-xs transition-colors",
                          draft.polaroidSizeId === item.id
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-paper text-ink hover:bg-cream",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-ink">Tamanho do texto</Label>

                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {(["sm", "md", "lg"] as Size[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setDraft((d) => ({ ...d, size: s }))}
                        className={cn(
                          "rounded-md border px-2 py-2 text-xs transition-colors",
                          draft.size === s
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-paper text-ink hover:bg-cream",
                        )}
                      >
                        {s === "sm" ? "Pequeno" : s === "md" ? "Médio" : "Grande"}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setOpen(true)}
                  disabled={saved.length === 0 && !draft.photo}
                  className="h-10 rounded-full bg-ink px-6 text-sm font-medium text-paper hover:bg-ink/90"
                >
                  Salvar e finalizar
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid items-stretch justify-center gap-3 lg:h-[calc(100dvh-11.75rem)] lg:min-h-0 lg:max-h-[42rem] lg:overflow-hidden lg:grid-cols-[300px_minmax(460px,560px)_300px] lg:gap-6">
          {/* ESQUERDA - MODELOS */}
          <aside className="order-3 lg:order-1 lg:h-full lg:min-h-0">
            <div className="leather-card flex h-full flex-col border-0 bg-transparent p-0 shadow-none lg:min-h-0 lg:border lg:bg-paper lg:p-4 lg:shadow-soft">
              {/* DESKTOP */}
              <div className="hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col">
                <h2 className="font-display text-xl font-medium text-ink">Fontes</h2>

                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-1.5">
                    {fontStyles.map((style) => {
                      const active = style.id === draft.fontStyleId;

                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => selecionarFonte(style)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                            active ? "bg-cream/80" : "hover:bg-cream/60",
                          )}
                          aria-pressed={active}
                        >
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[1rem] leading-tight text-ink",
                              style.fontClass,
                            )}
                          >
                            {style.name}
                          </span>

                          <span
                            className={cn(
                              "shrink-0 text-sm leading-tight text-muted-foreground group-hover:text-ink",
                              style.fontClass,
                            )}
                          >
                            AaBbCc
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MOBILE */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileStylesOpen((value) => !value)}
                  className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-paper/70 px-3 py-2 text-left transition-colors hover:bg-cream"
                >
                  <h2 className="font-display text-base font-medium text-ink">Fontes</h2>

                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-300",
                      mobileStylesOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                {mobileStylesOpen && (
                  <div className="mt-2 rounded-xl border border-border/70 bg-paper/70 p-2">
                    <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                      {fontStyles.map((style) => {
                        const active = style.id === draft.fontStyleId;

                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => selecionarFonte(style)}
                            className={cn(
                              "group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                              active ? "bg-cream/80" : "hover:bg-cream/60",
                            )}
                            aria-pressed={active}
                          >
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate text-base leading-tight text-ink",
                                style.fontClass,
                              )}
                            >
                              {style.name}
                            </span>

                            <span
                              className={cn(
                                "shrink-0 text-sm leading-tight text-muted-foreground group-hover:text-ink",
                                style.fontClass,
                              )}
                            >
                              AaBbCc
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* CENTRO - PREVIEW */}
          <section className="order-2 lg:order-2 lg:h-full lg:min-h-0">
            <div className="leather-card flex h-full min-h-0 flex-col items-center justify-center border-0 bg-transparent p-0 shadow-none lg:border lg:bg-paper lg:p-3 lg:shadow-soft">
              <div className="flex h-full w-full max-w-lg flex-col gap-2 lg:gap-3">
                <div className="relative flex min-h-0 flex-1 flex-col border-0 bg-transparent p-0 lg:rounded-2xl lg:border lg:border-border/70 lg:bg-cream/80 lg:p-3">
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="relative mx-auto h-[11.35cm] w-full max-w-[10cm] overflow-visible">
                      <div
                        className={cn(
                          "absolute left-1/2 top-1/2 h-[11.35cm] w-[10cm] transition-transform duration-300",
                          isAdjustingImage ? "z-[60]" : "",
                        )}
                        style={{
                          transform: `translate(-50%, -50%) scale(${selectedPolaroidSize.previewScale})`,
                          transformOrigin: "center center",
                        }}
                      >
                        {/* MEDIDA VERTICAL */}
                        <div
                          className={cn(
                            "absolute flex w-5 items-center justify-center transition-opacity duration-200",
                            isAdjustingImage ? "opacity-20 blur-[1px]" : "opacity-100",
                          )}
                          style={{
                            top: `${selectedPreviewOffsetTopCm}cm`,
                            height: `${selectedPolaroidSize.previewHeightCm}cm`,
                            left: `calc(50% - ${selectedPolaroidSize.previewWidthCm / 2}cm - 0.65cm)`,
                          }}
                        >
                          <div
                            className="relative w-5 transition-all duration-300"
                            style={{
                              height: `${selectedPolaroidSize.previewMeasureHeightCm}cm`,
                            }}
                          >
                            <span className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-muted-foreground/55" />
                            <span className="absolute left-1/2 top-0 h-px w-3 -translate-x-1/2 bg-muted-foreground/55" />
                            <span className="absolute bottom-0 left-1/2 h-px w-3 -translate-x-1/2 bg-muted-foreground/55" />

                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180 whitespace-nowrap bg-cream px-1 py-1 text-[11px] font-medium text-muted-foreground [writing-mode:vertical-rl]">
                              {selectedPolaroidSize.heightCm} cm
                            </span>
                          </div>
                        </div>

                        {/* POLAROID CENTRALIZADA */}
                        <div className="absolute left-1/2 top-0 flex h-[10cm] w-[8cm] -translate-x-1/2 items-center justify-center">
                          <div
                            className="polaroid box-border max-w-full transition-all duration-300"
                            style={{
                              width: `${selectedPolaroidSize.previewWidthCm}cm`,
                              height: `${selectedPolaroidSize.previewHeightCm}cm`,
                            }}
                          >
                            {draft.photo ? (
                              <div
                                className={cn(
                                  "relative w-full overflow-hidden bg-muted transition-all duration-300",
                                  tpl.toneClass,
                                  isAdjustingImage ? "z-[70] cursor-move" : "",
                                )}
                                style={{
                                  height: `${selectedPolaroidSize.previewImageHeightCm}cm`,
                                }}
                                onPointerDown={onStartImageDrag}
                                onPointerMove={onMoveImageDrag}
                                onPointerUp={onEndImageDrag}
                                onPointerCancel={onEndImageDrag}
                                onLostPointerCapture={onEndImageDrag}
                              >
                                <img
                                  src={draft.photo}
                                  alt="Sua foto"
                                  className="h-full w-full object-cover"
                                  style={{
                                    objectPosition: `${draft.imagePosX}% ${draft.imagePosY}%`,
                                  }}
                                  draggable={false}
                                />

                                {isAdjustingImage && (
                                  <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-paper/90" />
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={pickFile}
                                className="flex w-full flex-col items-center justify-center gap-3 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
                                style={{
                                  height: `${selectedPolaroidSize.previewImageHeightCm}cm`,
                                }}
                              >
                                <Upload className="h-7 w-7" strokeWidth={1.5} />
                                <span className="font-display text-lg">Adicionar foto</span>
                                <span className="text-xs">JPG ou PNG</span>
                              </button>
                            )}

                            <div
                              className={cn(
                                "absolute bottom-0 left-3 right-3 flex items-center justify-center overflow-visible px-2 text-ink/85 leading-tight",
                                isAdjustingImage ? "z-[80]" : "",
                              )}
                              style={{
                                top: `calc(0.75rem + ${selectedPolaroidSize.previewImageHeightCm}cm)`,
                              }}
                            >
                              {isAdjustingImage ? (
                                <Button
                                  type="button"
                                  onClick={() => setIsAdjustingImage(false)}
                                  className="h-10 rounded-xl bg-ink px-7 text-sm font-semibold text-paper shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-transform hover:bg-ink/90 active:scale-95"
                                >
                                  Pronto
                                </Button>
                              ) : mobileCaptionEditing ? (
                                <input
                                  autoFocus
                                  value={draft.caption}
                                  onChange={(e) =>
                                    setDraft((d) => ({
                                      ...d,
                                      caption: e.target.value,
                                    }))
                                  }
                                  onBlur={() => setMobileCaptionEditing(false)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      setMobileCaptionEditing(false);
                                    }
                                  }}
                                  maxLength={60}
                                  className={cn(
                                    "w-full rounded-md border border-border bg-paper/90 px-2 py-1 leading-tight text-ink outline-none",
                                    alignClass[draft.align],
                                    draftFontStyle?.fontClass,
                                    fontWeightClass[draft.fontWeightId],
                                    getCaptionSizeClass(draft.polaroidSizeId, draft.size),
                                  )}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setMobileCaptionEditing(true)}
                                  className={cn(
                                    "inline-block w-full max-w-full break-words bg-transparent leading-tight outline-none lg:pointer-events-none",
                                    alignClass[draft.align],
                                    draftFontStyle?.fontClass,
                                    fontWeightClass[draft.fontWeightId],
                                    getCaptionSizeClass(draft.polaroidSizeId, draft.size),
                                  )}
                                >
                                  {draft.caption || (
                                    <span className="text-sm text-muted-foreground/70 lg:hidden">
                                      Toque para editar
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* MEDIDA HORIZONTAL */}
                        <div
                          className={cn(
                            "absolute h-4 transition-all duration-300",
                            isAdjustingImage ? "opacity-20 blur-[1px]" : "opacity-100",
                          )}
                          style={{
                            top: `${selectedPreviewOffsetTopCm + selectedPolaroidSize.previewHeightCm + 0.45}cm`,
                            width: `${selectedPolaroidSize.previewMeasureWidthCm}cm`,
                            left: `calc(50% - ${selectedPolaroidSize.previewMeasureWidthCm / 2}cm)`,
                          }}
                        >
                          <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-muted-foreground/55" />
                          <span className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-muted-foreground/55" />
                          <span className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-muted-foreground/55" />

                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-cream px-2 text-[11px] font-medium text-muted-foreground">
                            {selectedPolaroidSize.widthCm} cm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {draft.photo && !isAdjustingImage && (
                  <div className="relative z-20 flex shrink-0 flex-col items-center gap-2">
                    <div className="flex justify-center gap-4">
                      <div className="flex w-12 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setMobileCaptionEditing(true)}
                          className="group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-colors hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Adicionar texto"
                          title="Adicionar texto"
                        >
                          <Type className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Texto
                        </span>
                      </div>

                      <div className="flex w-12 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              align: nextAlign[d.align],
                            }))
                          }
                          className="group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-colors hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Alinhar texto"
                          title="Alinhar texto"
                        >
                          {draft.align === "left" ? (
                            <AlignLeft className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                          ) : draft.align === "center" ? (
                            <AlignJustify className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                          ) : draft.align === "right" ? (
                            <AlignRight className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                          ) : (
                            <AlignCenter className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                          )}
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Alinhar
                        </span>
                      </div>

                      <div className="flex w-12 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={pickFile}
                          className="group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-colors hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Trocar Polaroid"
                          title="Trocar Polaroid"
                        >
                          <Upload className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Trocar
                        </span>
                      </div>

                      <div className="flex w-12 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsAdjustingImage(true)}
                          className="group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-colors hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Ajustar Polaroid"
                          title="Ajustar Polaroid"
                        >
                          <Pencil className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Ajustar
                        </span>
                      </div>

                      <div className="flex w-12 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDraft((d) => ({ ...d, photo: null }));
                            setIsAdjustingImage(false);
                            setMobileCaptionEditing(false);
                          }}
                          className="group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-colors hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Remover"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Remover
                        </span>
                      </div>

                      <div className="flex w-12 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={concluir}
                          className="group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-colors hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Salvar Polaroid"
                          title="Salvar Polaroid"
                        >
                          <Save className="h-4 w-4 transition-colors group-hover:text-[#8b5cf6]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Salvar
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />
              </div>
            </div>
          </section>

          {/* MINHAS POLAROIDS */}
          <aside className="order-4 flex flex-col lg:order-3 lg:h-full lg:min-h-0">
            <div className="leather-card flex min-h-0 flex-1 flex-col overflow-hidden p-4 lg:p-4">
              <div>
                <h2 className="font-display text-xl font-medium">Minhas Polaroids</h2>

                <p className="mt-1 font-script text-lg text-sepia">
                  {saved.length > 0
                    ? `${saved.length} ${saved.length === 1 ? "memória" : "memórias"} no álbum`
                    : ""}
                </p>
              </div>

              {saved.length === 0 ? (
                <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-paper/50 p-5 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma Polaroid criada ainda.</p>
                </div>
              ) : (
                <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 justify-items-center gap-x-3 gap-y-4 overflow-y-auto pb-2 pr-1">
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

                    return (
                      <div key={item.id} className="relative shrink-0" style={{ width: cardWidth }}>
                        <div className="mb-2 text-center text-[11px] font-medium text-muted-foreground">
                          {itemPolaroidSize.label} cm
                        </div>

                        <div
                          className="relative flex items-start justify-center"
                          style={gallerySlotStyle}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white shadow-soft transition-colors hover:bg-ink"
                                aria-label="Mais opções"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="min-w-32 border-border bg-paper"
                            >
                              <DropdownMenuItem
                                onClick={() => editarSalva(item)}
                                className="cursor-pointer"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => removerSalva(item.id)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

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
                                style={{
                                  height: `${itemPolaroidSize.imageHeightCm}cm`,
                                }}
                              >
                                {item.photo && (
                                  <img
                                    src={item.photo}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    style={{
                                      objectPosition: `${item.imagePosX}% ${item.imagePosY}%`,
                                    }}
                                  />
                                )}
                              </div>

                              <p
                                className="absolute bottom-0 left-3 right-3 flex items-center justify-center overflow-hidden px-2 text-ink/85 leading-tight"
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
          </aside>
        </div>
      </main>

      {/* MODAL FINALIZAÇÃO */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl border-border bg-paper sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="font-display text-2xl font-medium text-ink">
              Suas Polaroids estão prontas
            </DialogTitle>

            <DialogDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
              Revise suas imagens e libere o download em alta qualidade após o pagamento.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 flex flex-wrap justify-center gap-3">
            {saved.slice(0, 6).map((item) => (
              <div key={item.id} className="polaroid !p-1.5 !pb-3 w-20">
                <div className="aspect-square overflow-hidden bg-muted">
                  {item.photo && (
                    <img
                      src={item.photo}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${item.imagePosX}% ${item.imagePosY}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}

            {saved.length === 0 && draft.photo && (
              <div className="polaroid !p-1.5 !pb-3 w-20">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={draft.photo}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${draft.imagePosX}% ${draft.imagePosY}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Button className="h-12 w-full rounded-full bg-ink text-base font-medium text-paper hover:bg-ink/90">
            Finalizar e liberar download
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Você só paga depois de visualizar.
          </p>

          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-ink"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
