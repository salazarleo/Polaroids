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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Upload, X, Pencil, Trash2, ChevronDown } from "lucide-react";
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
type Align = "left" | "center" | "right";
type PolaroidSizeId = "7x10" | "5x8" | "4x5";

type FontStyleId =
  | "garet"
  | "bebas-neue"
  | "alice"
  | "bree-serif"
  | "montaser-arabic"
  | "codec-pro"
  | "raleway"
  | "dm-sans";

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
    id: "bree-serif",
    name: "Bree Serif",
    fontClass: "font-bree-serif",
    sample: "Memórias especiais",
  },
  {
    id: "montaser-arabic",
    name: "Montaser Arabic",
    fontClass: "font-montaser-arabic",
    sample: "Memórias especiais",
  },
  {
    id: "codec-pro",
    name: "Codec Pro",
    fontClass: "font-codec-pro",
    sample: "Memórias especiais",
  },
  {
    id: "raleway",
    name: "Raleway",
    fontClass: "font-raleway",
    sample: "Memórias especiais",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    fontClass: "font-dm-sans",
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
  },
  {
    id: "5x8",
    label: "5x8",
    widthCm: 5,
    heightCm: 8,
    imageHeightCm: 6.2,
    measureWidthCm: 4.1,
    measureHeightCm: 6.4,

    previewWidthCm: 6.25,
    previewHeightCm: 10,
    previewImageHeightCm: 7.75,
    previewMeasureWidthCm: 5.1,
    previewMeasureHeightCm: 8,
  },
  {
    id: "4x5",
    label: "4x5",
    widthCm: 4,
    heightCm: 5,
    imageHeightCm: 3.6,
    measureWidthCm: 3.1,
    measureHeightCm: 4,

    previewWidthCm: 8,
    previewHeightCm: 10,
    previewImageHeightCm: 7.2,
    previewMeasureWidthCm: 6.4,
    previewMeasureHeightCm: 8,
  },
];

interface PolaroidItem {
  id: string;
  photo: string | null;
  caption: string;
  templateId: TemplateId;
  fontStyleId: FontStyleId | null;
  polaroidSizeId: PolaroidSizeId;
  size: Size;
  align: Align;
  imagePosX: number;
  imagePosY: number;
}

const sizeClass: Record<Size, string> = {
  sm: "text-lg",
  md: "text-[1.35rem]",
  lg: "text-2xl",
};

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

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
    polaroidSizeId,
    size: t.defaultSize,
    align: t.defaultAlign,
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
      caption: style.sample,
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

  function adicionarOutra() {
    if (draft.photo) {
      concluir();
    } else {
      setStyleWarning("");
      setMobileCaptionEditing(false);
      setDraft(newDraft(draft.templateId, draft.polaroidSizeId));
    }
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

    const nextX = clampPercent(
      drag.startPosX - (deltaX / Math.max(drag.areaWidth, 1)) * 100,
    );

    const nextY = clampPercent(
      drag.startPosY - (deltaY / Math.max(drag.areaHeight, 1)) * 100,
    );

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
    <div className="min-h-screen">
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

      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-10">
        <div className="grid items-stretch gap-3 lg:grid-cols-[300px_1fr_300px] lg:gap-8">
          {/* ESQUERDA - MODELOS */}
          <aside className="order-3 lg:order-1 lg:h-full">
            <div className="leather-card flex h-full flex-col border-0 bg-transparent p-0 shadow-none lg:border lg:bg-paper lg:p-5 lg:shadow-soft">
              {/* DESKTOP */}
              <div className="hidden lg:block">
                <h2 className="font-display text-xl font-medium">Modelos prontos</h2>
                <p className="mt-1 font-script text-lg text-sepia">Escolha um estilo</p>

                <div className="mt-5 rounded-2xl border border-border/70 bg-paper/70 p-2">
                  <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                    {fontStyles.map((style) => {
                      const active = style.id === draft.fontStyleId;

                      return (
                        <button
                          key={style.id}
                          onClick={() => selecionarFonte(style)}
                          className={cn(
                            "relative w-full rounded-xl border px-3 py-3 text-center transition-all",
                            active
                              ? "border-ink/85 bg-cream/70 shadow-soft"
                              : "border-border/70 bg-paper hover:border-ink/40 hover:bg-cream/60",
                          )}
                          aria-pressed={active}
                        >
                          {active && (
                            <span
                              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-ink bg-paper shadow-[inset_0_0_0_1px_var(--color-ink)]"
                              aria-hidden="true"
                            />
                          )}

                          <p
                            className={cn(
                              "w-full whitespace-nowrap text-center text-lg leading-tight text-ink",
                              style.fontClass,
                            )}
                          >
                            {style.sample}
                          </p>
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
                  <div>
                    <h2 className="font-display text-base font-medium text-ink">
                      Modelos prontos
                    </h2>
                    <p className="font-script text-sm text-sepia">Escolha um estilo</p>
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-300",
                      mobileStylesOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                {mobileStylesOpen && (
                  <div className="mt-2 rounded-xl border border-border/70 bg-paper/70 p-2">
                    <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                      {fontStyles.map((style) => {
                        const active = style.id === draft.fontStyleId;

                        return (
                          <button
                            key={style.id}
                            onClick={() => selecionarFonte(style)}
                            className={cn(
                              "relative w-full rounded-xl border px-3 py-2.5 text-center transition-all",
                              active
                                ? "border-ink/85 bg-cream/70 shadow-soft"
                                : "border-border/70 bg-paper hover:border-ink/40 hover:bg-cream/60",
                            )}
                            aria-pressed={active}
                          >
                            {active && (
                              <span
                                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-ink bg-paper shadow-[inset_0_0_0_1px_var(--color-ink)]"
                                aria-hidden="true"
                              />
                            )}

                            <p
                              className={cn(
                                "w-full whitespace-nowrap text-center text-base leading-tight text-ink",
                                style.fontClass,
                              )}
                            >
                              {style.sample}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    onClick={adicionarOutra}
                    variant="outline"
                    className="h-8 rounded-full border-border bg-paper px-3 text-[11px] font-medium text-ink hover:bg-cream"
                  >
                    Adicionar outra
                  </Button>

                  <Button
                    onClick={concluir}
                    disabled={!draft.photo}
                    className="h-8 rounded-full bg-ink px-3 text-[11px] font-medium text-paper hover:bg-ink/90"
                  >
                    Concluir
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* CENTRO - PREVIEW */}
          <section className="order-2 lg:order-2 lg:h-full">
            <div className="leather-card flex h-full flex-col items-center justify-center border-0 bg-transparent p-0 shadow-none lg:border lg:bg-paper lg:p-5 lg:shadow-soft">
              <div className="flex w-full max-w-lg flex-col gap-2 lg:gap-4">
                <div className="border-0 bg-transparent p-0 lg:rounded-2xl lg:border lg:border-border/70 lg:bg-cream/80 lg:p-4">
                  <div className="relative mx-auto h-[330px] w-full max-w-[10cm] overflow-visible min-[390px]:h-[350px] sm:h-[11.35cm]">
                    <div
                      className={cn(
                        "absolute left-1/2 top-0 h-[11.35cm] w-[10cm] -translate-x-1/2 origin-top scale-[0.76] min-[390px]:scale-[0.81] sm:scale-100",
                        isAdjustingImage ? "z-[60]" : "",
                      )}
                    >
                      {/* MEDIDA VERTICAL */}
                      <div
                        className="absolute top-0 flex h-[10cm] w-5 items-center justify-center"
                        style={{
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
                                isAdjustingImage
                                  ? "z-[70] cursor-grab active:cursor-grabbing"
                                  : "",
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
                                className="h-10 rounded-xl border border-paper bg-ink px-7 text-sm font-semibold text-paper shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-transform hover:bg-ink/90 active:scale-95"
                              >
                                Salvar ajuste
                              </Button>
                            ) : mobileCaptionEditing ? (
                              <input
                                autoFocus
                                value={draft.caption}
                                onChange={(e) =>
                                  setDraft((d) => ({ ...d, caption: e.target.value }))
                                }
                                onBlur={() => setMobileCaptionEditing(false)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setMobileCaptionEditing(false);
                                  }
                                }}
                                maxLength={60}
                                className={cn(
                                  "w-full rounded-md border border-border bg-paper/90 px-2 py-1 text-center leading-tight text-ink outline-none",
                                  draftFontStyle?.fontClass,
                                  sizeClass[draft.size],
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
                                  sizeClass[draft.size],
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
                        className="absolute top-[10.45cm] h-4 transition-all duration-300"
                        style={{
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

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />

                {draft.photo && !isAdjustingImage && (
                  <div className="mt-0 lg:mt-5">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={pickFile}
                        className="rounded-full border-border bg-paper text-ink hover:bg-cream"
                      >
                        Trocar imagem
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdjustingImage(true)}
                        className="rounded-full border-border bg-paper text-ink hover:bg-cream"
                      >
                        Ajustar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDraft((d) => ({ ...d, photo: null }));
                          setIsAdjustingImage(false);
                          setMobileCaptionEditing(false);
                        }}
                        className="rounded-full border-border bg-paper text-ink hover:bg-cream"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* DIREITA - PERSONALIZAR */}
          <aside className="order-1 lg:order-3 lg:h-full">
            <div className="leather-card flex h-full flex-col p-2 lg:p-5">
              {/* MOBILE - BARRA DE PERSONALIZAR */}
              <div className="lg:hidden">
                <div className="grid grid-cols-3 gap-2">
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
                            draft.size === s
                              ? "bg-ink text-paper"
                              : "text-ink hover:bg-cream",
                          )}
                        >
                          {s === "sm" ? "P" : s === "md" ? "M" : "G"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Alinhar
                    </p>
                    <div className="grid grid-cols-3 overflow-hidden rounded-full border border-border bg-paper">
                      {(["left", "center", "right"] as Align[]).map((a) => (
                        <button
                          key={a}
                          onClick={() => setDraft((d) => ({ ...d, align: a }))}
                          className={cn(
                            "px-1.5 py-1.5 text-[10px] transition-colors",
                            draft.align === a
                              ? "bg-ink text-paper"
                              : "text-ink hover:bg-cream",
                          )}
                        >
                          {a === "left" ? "Esq" : a === "center" ? "Meio" : "Dir"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKTOP - PERSONALIZAR */}
              <div className="hidden lg:block">
                <h2 className="font-display text-xl font-medium">Personalizar</h2>

                <div className="mt-5 space-y-5">
                  <div>
                    <Label htmlFor="frase" className="text-sm font-medium text-ink">
                      Frase da Polaroid
                    </Label>

                    <div className="relative mt-1.5">
                      <Input
                        id="frase"
                        value={draft.caption}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, caption: e.target.value }))
                        }
                        placeholder="Escreva uma frase especial"
                        maxLength={60}
                        className="rounded-lg border-border bg-paper pr-10"
                      />

                      {draft.caption.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, caption: "" }))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-cream hover:text-ink"
                          aria-label="Limpar frase"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      {draft.caption.length}/60
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-ink">
                      Tamanho da Polaroid
                    </Label>

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
                    <Label className="text-sm font-medium text-ink">
                      Tamanho do texto
                    </Label>

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

                  <div>
                    <Label className="text-sm font-medium text-ink">Alinhamento</Label>

                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      {(["left", "center", "right"] as Align[]).map((a) => (
                        <button
                          key={a}
                          onClick={() => setDraft((d) => ({ ...d, align: a }))}
                          className={cn(
                            "rounded-md border px-2 py-2 text-xs transition-colors",
                            draft.align === a
                              ? "border-ink bg-ink text-paper"
                              : "border-border bg-paper text-ink hover:bg-cream",
                          )}
                        >
                          {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 hidden space-y-2.5 lg:block">
                <Button
                  onClick={adicionarOutra}
                  variant="outline"
                  className="h-11 w-full rounded-full border-border bg-paper text-sm font-medium text-ink hover:bg-cream"
                >
                  Adicionar outra imagem
                </Button>

                <Button
                  onClick={concluir}
                  disabled={!draft.photo}
                  className="h-11 w-full rounded-full bg-ink text-sm font-medium text-paper hover:bg-ink/90"
                >
                  Concluir Polaroid
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* MINHAS POLAROIDS */}
        <section className="mt-8 border-t border-border/60 pt-8 lg:mt-14 lg:pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-medium">Minhas Polaroids</h2>

              <p className="mt-1 font-script text-lg text-sepia">
                {saved.length > 0
                  ? `${saved.length} ${saved.length === 1 ? "memória" : "memórias"} no álbum`
                  : "Seu álbum começa aqui"}
              </p>
            </div>

            <Button
              onClick={() => setOpen(true)}
              disabled={saved.length === 0}
              className="h-11 rounded-full bg-ink px-6 text-sm font-medium text-paper hover:bg-ink/90"
            >
              Salvar e finalizar
            </Button>
          </div>

          {saved.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-paper/50 p-10 text-center">
              <p className="text-muted-foreground">Nenhuma Polaroid criada ainda.</p>
            </div>
          ) : (
            <div className="mt-6 flex gap-5 overflow-x-auto pb-4">
              {saved.map((item) => {
                const it = templates.find((t) => t.id === item.templateId)!;

                const itemFontStyle = item.fontStyleId
                  ? fontStyles.find((style) => style.id === item.fontStyleId)
                  : null;

                const itemPolaroidSize =
                  polaroidSizes.find((size) => size.id === item.polaroidSizeId) ??
                  polaroidSizes[0];

                const thumbnailScale =
                  itemPolaroidSize.id === "7x10"
                    ? 0.64
                    : itemPolaroidSize.id === "5x8"
                      ? 0.78
                      : 1;

                return (
                  <div key={item.id} className="group relative shrink-0 w-[170px]">
                    <button
                      onClick={() => editarSalva(item)}
                      className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-soft lg:hidden"
                      aria-label="Editar"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>

                    <button
                      onClick={() => removerSalva(item.id)}
                      className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-soft lg:hidden"
                      aria-label="Remover"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex h-[243px] w-[170px] items-start justify-center">
                      <div
                        className="origin-top-left"
                        style={{
                          transform: `scale(${thumbnailScale})`,
                          transformOrigin: "top left",
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
                                sizeClass[item.size],
                              )}
                            >
                              {item.caption || " "}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-x-0 -bottom-2 hidden justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
                      <button
                        onClick={() => editarSalva(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper shadow-soft hover:bg-ink/90"
                        aria-label="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => removerSalva(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink shadow-soft hover:bg-cream"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
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