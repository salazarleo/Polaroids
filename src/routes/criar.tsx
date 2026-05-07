import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getUploadUrl } from "../server/fns/getUploadUrl";
import { createCheckout } from "../server/fns/createCheckout";
import type { CheckoutItem } from "../types/order";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Upload,
  Pencil,
  Trash2,
  ChevronDown,
  Save,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  X,
  FlipHorizontal2,
  FlipVertical2,
  FileText,
  FileImage,
  Layers,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  MELHOR_OFERTA_QTD,
  PRECO_POLAROID_UNITARIO_CENTAVOS,
  calcularPrecoPolaroidsCentavos,
  formatarPrecoCentavos,
} from "../utils/pricing";
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
const PREVIEW_VISIBLE_COUNT = 4;
const MAX_POLAROIDS = 20;

type UploadStatus = "idle" | "uploading" | "done" | "error";

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
    imageHeightCm: 8.8,
    measureWidthCm: 5.8,
    measureHeightCm: 8.2,

    previewWidthCm: 7,
    previewHeightCm: 10,
    previewImageHeightCm: 8.4,
    previewMeasureWidthCm: 5.8,
    previewMeasureHeightCm: 8.2,
    previewScale: 0.82,
    galleryScale: 0.36,
  },
  {
    id: "5x8",
    label: "5x8",
    widthCm: 5,
    heightCm: 8,
    imageHeightCm: 7.2,
    measureWidthCm: 4.1,
    measureHeightCm: 6.4,

    previewWidthCm: 5,
    previewHeightCm: 8,
    previewImageHeightCm: 6.7,
    previewMeasureWidthCm: 4.1,
    previewMeasureHeightCm: 6.4,
    previewScale: 1.05,
    galleryScale: 0.48,
  },
  {
    id: "4x5",
    label: "4x5",
    widthCm: 4,
    heightCm: 5,
    imageHeightCm: 4.4,
    measureWidthCm: 3.1,
    measureHeightCm: 4,

    previewWidthCm: 4,
    previewHeightCm: 5,
    previewImageHeightCm: 4.0,
    previewMeasureWidthCm: 3.1,
    previewMeasureHeightCm: 4,
    previewScale: 1.55,
    galleryScale: 0.68,
  },
];

interface PolaroidItem {
  id: string;
  photoLocalUrl: string | null;
  photoUrl: string | null;
  uploadStatus: UploadStatus;
  caption: string;
  templateId: TemplateId;
  fontStyleId: FontStyleId | null;
  fontWeightId: FontWeightId;
  polaroidSizeId: PolaroidSizeId;
  size: Size;
  align: Align;
  imagePosX: number;
  imagePosY: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  imageScale: number;
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

function getImageTransform(item: PolaroidItem): string | undefined {
  const scaleX = item.imageScale * (item.flipHorizontal ? -1 : 1);
  const scaleY = item.imageScale * (item.flipVertical ? -1 : 1);
  if (scaleX === 1 && scaleY === 1) return undefined;
  return `scale(${scaleX}, ${scaleY})`;
}

function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { message?: unknown; error?: unknown };

    if (typeof maybeError.message === "string") return maybeError.message;
    if (typeof maybeError.error === "string") return maybeError.error;
  }

  return "Erro desconhecido";
}

function newDraft(
  templateId: TemplateId = "amor",
  polaroidSizeId: PolaroidSizeId = "7x10",
): PolaroidItem {
  const t = templates.find((x) => x.id === templateId)!;

  return {
    id: crypto.randomUUID(),
    photoLocalUrl: null,
    photoUrl: null,
    uploadStatus: "idle" as UploadStatus,
    caption: "",
    templateId,
    fontStyleId: null,
    fontWeightId: "regular",
    polaroidSizeId,
    size: t.defaultSize,
    align: "default",
    imagePosX: 50,
    imagePosY: 50,
    flipHorizontal: false,
    flipVertical: false,
    imageScale: 1,
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

interface CornerDragState {
  pointerId: number;
  corner: "tl" | "tr" | "bl" | "br";
  startX: number;
  startY: number;
  startScale: number;
  areaSize: number;
}

function CriarPage() {
  const [draft, setDraft] = useState<PolaroidItem>(() => newDraft());
  const [saved, setSaved] = useState<PolaroidItem[]>([]);
  const [open, setOpen] = useState(false);
  const [styleWarning, setStyleWarning] = useState("");
  const [isAdjustingImage, setIsAdjustingImage] = useState(false);
  const [mobileStylesOpen, setMobileStylesOpen] = useState(false);
  const [mobileCaptionEditing, setMobileCaptionEditing] = useState(false);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);
  const [previewPolaroidId, setPreviewPolaroidId] = useState<string | null>(null);
  const [draftIdPendenteRemocao, setDraftIdPendenteRemocao] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [flipMenuOpen, setFlipMenuOpen] = useState(false);
  const [mobileSizeDropdownOpen, setMobileSizeDropdownOpen] = useState(false);
  const [mobileFontPanelOpen, setMobileFontPanelOpen] = useState(false);
  const [mobileSizePanelOpen, setMobileSizePanelOpen] = useState(false);
  const [mobileSavedOpen, setMobileSavedOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<ImageDragState | null>(null);
  const cornerDragRef = useRef<CornerDragState | null>(null);
  const uploadAbortRef = useRef<string | null>(null);
  const prevSavedLengthRef = useRef(0);

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
  const uploadPlaceholderScale = 1 / selectedPolaroidSize.previewScale;
  const measurementLabelFontSizePx = 11 / selectedPolaroidSize.previewScale;
  const quantidadePolaroids = saved.length;
  const totalPedidoCentavos = calcularPrecoPolaroidsCentavos(quantidadePolaroids);
  const totalPedidoFormatado = formatarPrecoCentavos(totalPedidoCentavos);
  const valorSemPromocaoCentavos = quantidadePolaroids * PRECO_POLAROID_UNITARIO_CENTAVOS;
  const economiaCentavos = Math.max(0, valorSemPromocaoCentavos - totalPedidoCentavos);
  const economiaFormatada = formatarPrecoCentavos(economiaCentavos);
  const mensagemEconomia =
    economiaCentavos > 0
      ? `Você economiza ${economiaFormatada} neste pedido.`
      : quantidadePolaroids === 1
        ? "1 Polaroid por apenas R$ 0,99."
        : quantidadePolaroids < MELHOR_OFERTA_QTD
          ? "R$ 0,99 por Polaroid."
          : "A partir de 5, cada extra continua só R$ 0,99.";
  const showPreviewControls = saved.length > PREVIEW_VISIBLE_COUNT;
  const canGoPrev = previewStartIndex > 0;
  const canGoNext = previewStartIndex + PREVIEW_VISIBLE_COUNT < saved.length;
  const carrinhoVazio = quantidadePolaroids === 0;
  const previewPolaroid = previewPolaroidId
    ? (saved.find((item) => item.id === previewPolaroidId) ?? null)
    : null;
  const previewPolaroidSize = previewPolaroid
    ? (polaroidSizes.find((size) => size.id === previewPolaroid.polaroidSizeId) ?? polaroidSizes[0])
    : polaroidSizes[0];
  const modalPreviewScale = Math.max(1, previewPolaroidSize.previewScale);
  const previewTemplate = previewPolaroid
    ? (templates.find((template) => template.id === previewPolaroid.templateId) ?? templates[0])
    : templates[0];
  const previewFontStyle = previewPolaroid?.fontStyleId
    ? fontStyles.find((style) => style.id === previewPolaroid.fontStyleId)
    : null;

  useEffect(() => {
    const maxPreviewStartIndex = Math.max(0, saved.length - PREVIEW_VISIBLE_COUNT);

    setPreviewStartIndex((current) => Math.min(current, maxPreviewStartIndex));
    setPreviewPolaroidId((current) => {
      if (!current) return current;

      return saved.some((item) => item.id === current) ? current : null;
    });
  }, [saved]);

  useEffect(() => {
    if (!flipMenuOpen) return;
    const close = () => setFlipMenuOpen(false);
    const timerId = window.setTimeout(() => {
      document.addEventListener("click", close, { once: true });
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("click", close);
    };
  }, [flipMenuOpen]);

  function pickFile() {
    fileRef.current?.click();
  }

  async function uploadFile(file: File, localUrl: string, uploadId: string) {
    try {
      const result = await getUploadUrl({
        data: { fileName: file.name, contentType: file.type },
      });

      if (!result.signedUrl) {
        throw new Error("URL assinada retornou vazia. Reinicie o dev server.");
      }

      const body = new FormData();
      body.append("cacheControl", "3600");
      body.append("", file);

      const response = await fetch(result.signedUrl, {
        method: "PUT",
        body,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw new Error(
          `Supabase upload falhou (${response.status}): ${responseText || response.statusText}`,
        );
      }

      if (uploadAbortRef.current !== uploadId) return;

      setDraft((d) => {
        if (d.photoLocalUrl !== localUrl) return d;
        return { ...d, photoUrl: result.publicUrl, uploadStatus: "done" };
      });
    } catch (error) {
      const message = getUploadErrorMessage(error);

      console.error(`[upload-polaroid] Falha no upload da foto: ${message}`, {
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      if (uploadAbortRef.current !== uploadId) return;

      setDraft((d) => {
        if (d.photoLocalUrl !== localUrl) return d;
        return { ...d, uploadStatus: "error" };
      });
      setStyleWarning(`O upload falhou: ${message}`);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStyleWarning("Apenas imagens JPG ou PNG são aceitas");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStyleWarning("A imagem deve ter no máximo 10 MB");
      e.target.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);
    const uploadId = crypto.randomUUID();
    uploadAbortRef.current = uploadId;

    setDraft((d) => {
      if (d.photoLocalUrl) URL.revokeObjectURL(d.photoLocalUrl);
      return {
        ...d,
        photoLocalUrl: localUrl,
        photoUrl: null,
        uploadStatus: "uploading",
        imagePosX: 50,
        imagePosY: 50,
        flipHorizontal: false,
        flipVertical: false,
        imageScale: 1,
      };
    });

    setStyleWarning("");
    setIsAdjustingImage(false);
    setMobileCaptionEditing(false);
    e.target.value = "";

    uploadFile(file, localUrl, uploadId);
  }

  function selecionarFonte(style: FontStyleDef) {
    if (!draft.photoLocalUrl) {
      setStyleWarning("Adicione primeiro uma imagem");
      return;
    }

    if (!draft.caption.trim()) {
      setStyleWarning("Adicione primeiro um texto");
      return;
    }

    setStyleWarning("");
    setMobileStylesOpen(false);
    setMobileCaptionEditing(false);

    setDraft((d) => ({
      ...d,
      fontStyleId: style.id,
      fontWeightId: "regular",
    }));
  }

  function concluir() {
    if (!draft.photoLocalUrl) return;

    if (draft.uploadStatus === "uploading") {
      setStyleWarning("Aguarde, o upload da foto ainda está em andamento...");
      return;
    }

    if (draft.uploadStatus === "error") {
      setStyleWarning("O upload falhou. Tente selecionar a foto novamente.");
      return;
    }

    const isEditing = saved.some((x) => x.id === draft.id);

    if (!isEditing && saved.length >= MAX_POLAROIDS) {
      setStyleWarning(`Máximo de ${MAX_POLAROIDS} Polaroids por pedido`);
      return;
    }

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

  function finalizarPedido() {
    if (saved.length === 0) {
      setStyleWarning("Adicione pelo menos uma Polaroid");
      return;
    }

    setOpen(true);
  }

  function handlePrevPreview() {
    setPreviewStartIndex((current) => Math.max(0, current - 1));
  }

  function handleNextPreview() {
    const maxPreviewStartIndex = Math.max(0, saved.length - PREVIEW_VISIBLE_COUNT);

    setPreviewStartIndex((current) => Math.min(maxPreviewStartIndex, current + 1));
  }

  function abrirPreviewPolaroid(id: string) {
    setPreviewPolaroidId(id);
  }

  function fecharPreviewPolaroid() {
    setPreviewPolaroidId(null);
  }

  async function iniciarPagamento() {
    if (saved.length === 0) {
      setStyleWarning("Adicione pelo menos uma Polaroid");
      return;
    }

    const itemSemUpload = saved.find((x) => !x.photoUrl || x.uploadStatus !== "done");
    if (itemSemUpload) {
      setStyleWarning("Uma ou mais fotos ainda não foram enviadas. Aguarde e tente novamente.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const items: CheckoutItem[] = saved.map((x) => ({
        photoUrl: x.photoUrl!,
        caption: x.caption,
        templateId: x.templateId,
        fontStyleId: x.fontStyleId,
        fontWeightId: x.fontWeightId,
        polaroidSizeId: x.polaroidSizeId,
        size: x.size,
        align: x.align,
        imagePosX: x.imagePosX,
        imagePosY: x.imagePosY,
      }));

      const result = await createCheckout({ data: { items } });

      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error("[checkout] Erro ao criar pedido", err);
      setStyleWarning("Não foi possível iniciar o pagamento. Tente novamente.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  function editarSalva(item: PolaroidItem) {
    setDraft({ ...item });
    setIsAdjustingImage(false);
    setMobileCaptionEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removerPolaroidDoCarrinho(id: string) {
    setSaved((s) => s.filter((x) => x.id !== id));
  }

  function limparDraftAtual() {
    setDraft((d) => {
      if (d.photoLocalUrl) URL.revokeObjectURL(d.photoLocalUrl);
      return {
        ...d,
        photoLocalUrl: null,
        photoUrl: null,
        uploadStatus: "idle" as UploadStatus,
        caption: "",
        fontStyleId: null,
        fontWeightId: "regular",
      };
    });
    setIsAdjustingImage(false);
    setMobileCaptionEditing(false);
  }

  function removerDraftAtual() {
    const draftJaEstaSalvo = saved.some((item) => item.id === draft.id);

    if (!draftJaEstaSalvo) {
      limparDraftAtual();
      return;
    }

    setDraftIdPendenteRemocao(draft.id);
  }

  function cancelarRemocaoDraft() {
    setDraftIdPendenteRemocao(null);
  }

  function confirmarRemocaoDraft() {
    if (!draftIdPendenteRemocao) return;

    removerPolaroidDoCarrinho(draftIdPendenteRemocao);
    setDraftIdPendenteRemocao(null);
    setStyleWarning("");
    setIsAdjustingImage(false);
    setMobileCaptionEditing(false);
    setDraft((d) => newDraft(d.templateId, d.polaroidSizeId));
  }

  function removerPolaroidSelecionada() {
    if (!previewPolaroidId) return;

    removerPolaroidDoCarrinho(previewPolaroidId);
    setPreviewPolaroidId(null);
  }

  function onStartImageDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!isAdjustingImage || !draft.photoLocalUrl) return;

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
    const cDrag = cornerDragRef.current;
    if (cDrag && cDrag.pointerId === e.pointerId) {
      const dx = e.clientX - cDrag.startX;
      const dy = e.clientY - cDrag.startY;
      const signX = cDrag.corner === "tr" || cDrag.corner === "br" ? 1 : -1;
      const signY = cDrag.corner === "bl" || cDrag.corner === "br" ? 1 : -1;
      const delta = (dx * signX + dy * signY) / Math.max(cDrag.areaSize, 1);
      const newScale = Math.max(1, Math.min(4, cDrag.startScale + delta * 2));
      setDraft((d) => ({ ...d, imageScale: newScale }));
      return;
    }

    const drag = dragRef.current;
    if (!isAdjustingImage || !drag || drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    const nextX = clampPercent(drag.startPosX - (deltaX / Math.max(drag.areaWidth, 1)) * 100);
    const nextY = clampPercent(drag.startPosY - (deltaY / Math.max(drag.areaHeight, 1)) * 100);

    setDraft((d) => ({ ...d, imagePosX: nextX, imagePosY: nextY }));
  }

  function onEndImageDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (cornerDragRef.current?.pointerId === e.pointerId) {
      cornerDragRef.current = null;
    }
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function onStartCornerDrag(
    e: React.PointerEvent<HTMLDivElement>,
    corner: "tl" | "tr" | "bl" | "br",
  ) {
    e.stopPropagation();
    const parent = e.currentTarget.parentElement as HTMLElement;
    const rect = parent.getBoundingClientRect();
    cornerDragRef.current = {
      pointerId: e.pointerId,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startScale: draft.imageScale,
      areaSize: Math.min(rect.width, rect.height),
    };
    parent.setPointerCapture(e.pointerId);
  }

  return (
    <div className="criar-page min-h-screen lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
      {styleWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-[1px]"
          role="alertdialog"
          aria-live="assertive"
        >
          <div className="criar-alert-card w-full max-w-xs rounded-2xl border border-border bg-paper p-5 text-center shadow-soft">
            <p className="text-sm font-medium text-ink">{styleWarning}</p>

            <Button
              type="button"
              onClick={() => setStyleWarning("")}
              className="mt-4 h-9 w-[92px] cursor-pointer rounded-md border border-transparent bg-black px-0 text-sm font-medium text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97]"
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <section className="leather-card criar-fade-up criar-delay-1 criar-panel-motion mx-auto mb-3 p-2 lg:max-w-6xl lg:shrink-0 lg:px-4 lg:py-2.5">
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
                        "criar-control px-1.5 py-1.5 text-[10px] transition-all",
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
                        "criar-control px-1.5 py-1.5 text-[10px] transition-all",
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
              onClick={finalizarPedido}
              className="mt-2 h-8 w-full cursor-pointer rounded-full border border-transparent bg-black text-xs font-medium text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97]"
            >
              Finalizar
            </Button>
          </div>

          {/* DESKTOP - PERSONALIZAR */}
          <div className="hidden lg:block">
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-end gap-4">
              <div className="col-start-2 grid grid-cols-[220px_220px] items-end justify-center gap-4">
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
                          "criar-control rounded-md border px-2 py-2 text-xs transition-all",
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
                          "criar-control rounded-md border px-2 py-2 text-xs transition-all",
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
              </div>

              <Button
                onClick={finalizarPedido}
                className="col-start-3 h-10 cursor-pointer self-center justify-self-end rounded-md border border-transparent bg-black px-6 py-2 text-sm font-medium text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97]"
              >
                Finalizar
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto grid items-stretch justify-center gap-3 lg:h-[calc(100dvh-11.75rem)] lg:min-h-0 lg:max-h-[42rem] lg:overflow-hidden lg:grid-cols-[300px_minmax(460px,560px)_300px] lg:gap-6">
          {/* ESQUERDA - MODELOS */}
          <aside className="criar-fade-up criar-delay-2 order-3 lg:order-1 lg:h-full lg:min-h-0">
            <div className="leather-card criar-plain-card criar-panel-motion flex h-full flex-col border-0 bg-transparent p-0 shadow-none lg:min-h-0 lg:border lg:bg-paper lg:p-4 lg:shadow-soft">
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
                            "criar-font-item group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-all",
                            active
                              ? "border-l-2 border-ink bg-cream/90 pl-[calc(0.5rem-2px)]"
                              : "hover:bg-cream/60",
                          )}
                          aria-pressed={active}
                        >
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[1rem] leading-tight text-ink",
                              active && "font-semibold",
                              style.fontClass,
                            )}
                          >
                            {style.name}
                          </span>

                          <span
                            className={cn(
                              "shrink-0 text-sm leading-tight group-hover:text-ink",
                              active ? "text-ink/70" : "text-muted-foreground",
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
                  className="criar-control flex w-full items-center justify-between rounded-xl border border-border/70 bg-paper/70 px-3 py-2 text-left transition-all hover:bg-cream"
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
                  <div className="criar-alert-card mt-2 rounded-xl border border-border/70 bg-paper/70 p-2">
                    <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                      {fontStyles.map((style) => {
                        const active = style.id === draft.fontStyleId;

                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => selecionarFonte(style)}
                            className={cn(
                              "criar-font-item group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-all",
                              active
                                ? "border-l-2 border-ink bg-cream/90 pl-[calc(0.5rem-2px)]"
                                : "hover:bg-cream/60",
                            )}
                            aria-pressed={active}
                          >
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate text-base leading-tight text-ink",
                                active && "font-semibold",
                                style.fontClass,
                              )}
                            >
                              {style.name}
                            </span>

                            <span
                              className={cn(
                                "shrink-0 text-sm leading-tight group-hover:text-ink",
                                active ? "text-ink/70" : "text-muted-foreground",
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
          <section className="criar-fade-up criar-delay-3 order-2 lg:order-2 lg:h-full lg:min-h-0">
            <div className="leather-card criar-plain-card criar-panel-motion flex h-full min-h-0 flex-col items-center justify-center border-0 bg-transparent p-0 shadow-none lg:border lg:bg-paper lg:p-3 lg:shadow-soft">
              <div className="flex h-full w-full max-w-lg flex-col gap-2 lg:gap-3">
                <div className="relative flex min-h-0 flex-1 flex-col border-0 bg-transparent p-0 lg:rounded-2xl lg:border lg:border-border/70 lg:bg-[#f5ece0] lg:p-3">
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

                            <span
                              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180 whitespace-nowrap bg-cream px-1 py-1 text-[11px] font-medium text-muted-foreground [writing-mode:vertical-rl]"
                              style={{
                                fontSize: `${measurementLabelFontSizePx}px`,
                              }}
                            >
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
                            {draft.photoLocalUrl ? (
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
                                <div className="criar-photo-enter h-full w-full">
                                  <img
                                    src={draft.photoLocalUrl}
                                    alt="Sua foto"
                                    className="h-full w-full object-cover"
                                    style={{
                                      objectPosition: `${draft.imagePosX}% ${draft.imagePosY}%`,
                                      transform: getImageTransform(draft),
                                    }}
                                    draggable={false}
                                  />
                                </div>

                                {isAdjustingImage && (
                                  <>
                                    <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-paper/90" />
                                    {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                                      <div
                                        key={corner}
                                        className={cn(
                                          "absolute z-[90] flex h-7 w-7 items-center justify-center",
                                          corner === "tl" && "left-0 top-0 cursor-nw-resize",
                                          corner === "tr" && "right-0 top-0 cursor-ne-resize",
                                          corner === "bl" && "bottom-0 left-0 cursor-sw-resize",
                                          corner === "br" && "bottom-0 right-0 cursor-se-resize",
                                        )}
                                        onPointerDown={(e) => onStartCornerDrag(e, corner)}
                                      >
                                        <div className="h-3 w-3 rounded-sm border-[1.5px] border-white/70 bg-white shadow-md" />
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={pickFile}
                                className="criar-upload-zone flex w-full cursor-pointer flex-col items-center justify-center gap-3 bg-muted/50 text-muted-foreground transition-all hover:bg-muted"
                                style={{
                                  height: `${selectedPolaroidSize.previewImageHeightCm}cm`,
                                }}
                              >
                                <span
                                  className="flex flex-col items-center justify-center gap-3"
                                  style={{
                                    transform: `scale(${uploadPlaceholderScale})`,
                                    transformOrigin: "center",
                                  }}
                                >
                                  <Upload className="h-7 w-7" strokeWidth={1.5} />
                                  <span className="font-display text-lg">Adicionar foto</span>
                                  <span className="text-xs">JPG ou PNG</span>
                                </span>
                              </button>
                            )}

                            {/* Overlay de upload — cobre a Polaroid inteira enquanto a foto está sendo enviada */}
                            {draft.photoLocalUrl && draft.uploadStatus === "uploading" && (
                              <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-[4px] bg-[#fefdf9]/80 backdrop-blur-[3px]">
                                <span
                                  className="flex flex-col items-center gap-2"
                                  style={{
                                    transform: `scale(${uploadPlaceholderScale})`,
                                    transformOrigin: "center",
                                  }}
                                >
                                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink/65" />
                                  <span className="text-[0.7rem] font-medium tracking-wide text-ink/65">
                                    Preparando sua Polaroid…
                                  </span>
                                </span>
                              </div>
                            )}

                            <div
                              className={cn(
                                "absolute bottom-0 left-3 right-3 flex items-center justify-center overflow-visible px-2 text-black leading-tight",
                                isAdjustingImage ? "z-[80]" : "",
                              )}
                              style={{
                                top: `calc(0.75rem + ${selectedPolaroidSize.previewImageHeightCm}cm)`,
                              }}
                            >
                              {isAdjustingImage ? (
                                <div
                                  className="inline-flex"
                                  style={{
                                    transform: `scale(${1 / selectedPolaroidSize.previewScale})`,
                                  }}
                                >
                                  <Button
                                    type="button"
                                    onClick={() => setIsAdjustingImage(false)}
                                    className="h-9 w-[92px] cursor-pointer rounded-md border border-transparent bg-black px-0 text-sm font-medium text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97]"
                                  >
                                    Pronto
                                  </Button>
                                </div>
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
                                    "w-full rounded-md border border-border bg-paper/90 px-2 py-1 leading-tight text-ink outline-none transition-all duration-200 focus:border-sepia/60 focus:shadow-soft",
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
                                    "inline-block w-full max-w-full cursor-text break-words bg-transparent leading-tight outline-none transition-colors duration-200 hover:text-ink",
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

                          <span
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-cream px-2 text-[11px] font-medium text-muted-foreground"
                            style={{
                              fontSize: `${measurementLabelFontSizePx}px`,
                            }}
                          >
                            {selectedPolaroidSize.widthCm} cm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {draft.photoLocalUrl && !isAdjustingImage && (
                  <div className="criar-fade-up relative z-20 flex shrink-0 flex-col items-center gap-2">
                    <div className="flex justify-center gap-2">
                      <div className="flex w-10 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setMobileCaptionEditing(true)}
                          className="criar-action-button group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-all hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Adicionar texto"
                          title="Adicionar texto"
                        >
                          <Type className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Texto
                        </span>
                      </div>

                      <div className="flex w-10 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              align: nextAlign[d.align],
                            }))
                          }
                          className="criar-action-button group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-all hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Alinhar texto"
                          title="Alinhar texto"
                        >
                          {draft.align === "left" ? (
                            <AlignLeft className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                          ) : draft.align === "center" ? (
                            <AlignJustify className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                          ) : draft.align === "right" ? (
                            <AlignRight className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                          ) : (
                            <AlignCenter className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                          )}
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Alinhar
                        </span>
                      </div>

                      <div className="relative flex w-10 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setFlipMenuOpen((v) => !v)}
                          className="criar-action-button group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-all hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Inverter imagem"
                          title="Inverter imagem"
                        >
                          <FlipHorizontal2 className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Inverter
                        </span>
                        {flipMenuOpen && (
                          <>
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
                          </>
                        )}
                      </div>

                      <div className="flex w-10 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsAdjustingImage(true)}
                          className="criar-action-button group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-all hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Ajustar posição e zoom"
                          title="Ajustar posição e zoom"
                        >
                          <Pencil className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Posição
                        </span>
                      </div>

                      <div className="flex w-10 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={pickFile}
                          className="criar-action-button group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-all hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Trocar Polaroid"
                          title="Trocar Polaroid"
                        >
                          <Upload className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Trocar
                        </span>
                      </div>

                      <div className="flex w-10 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={removerDraftAtual}
                          className="criar-action-button group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-all hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Remover"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
                        </button>
                        <span className="text-center text-[10px] font-medium leading-none text-muted-foreground">
                          Remover
                        </span>
                      </div>

                      <div className="flex w-10 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={concluir}
                          className="criar-action-button group flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#111217] text-zinc-300 shadow-soft transition-all hover:border-[#2a2f3a] hover:bg-[#171923]"
                          aria-label="Salvar Polaroid"
                          title="Salvar Polaroid"
                        >
                          <Save className="h-4 w-4 transition-colors group-hover:text-[#c8a36c]" />
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
          <aside className="criar-fade-up criar-delay-4 order-4 flex flex-col lg:order-3 lg:h-full lg:min-h-0">
            <div className="leather-card criar-plain-card criar-panel-motion flex min-h-0 flex-1 flex-col overflow-hidden p-4 lg:p-4">
              <div>
                <h2 className="font-display text-xl font-medium">Minhas Polaroids</h2>

                {saved.length > 0 && (
                  <div className="mt-3 rounded-xl border border-border/70 bg-cream/55 px-3 py-2 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Adicionadas
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {saved.length} {saved.length === 1 ? "foto" : "fotos"}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-border/60 pt-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Total
                      </span>
                      <span className="text-sm font-bold text-sepia">{totalPedidoFormatado}</span>
                    </div>
                  </div>
                )}
              </div>

              {saved.length === 0 ? (
                <div className="criar-alert-card mt-4 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-paper/50 p-5 text-center">
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

                    const isSelected = item.id === draft.id;

                    return (
                      <div
                        key={item.id}
                        className="criar-saved-card criar-fade-up relative shrink-0"
                        style={{ width: cardWidth }}
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
                              isSelected && "ring-2 ring-ink/40 ring-offset-2 ring-offset-paper",
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
                                style={{
                                  height: `${itemPolaroidSize.imageHeightCm}cm`,
                                }}
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
          </aside>
        </div>
      </main>

      {/* MODAL CONFIRMAÇÃO REMOÇÃO */}
      <Dialog
        open={draftIdPendenteRemocao !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) cancelarRemocaoDraft();
        }}
      >
        <DialogContent className="rounded-2xl border-border bg-[#f1e7da] shadow-polaroid duration-300 ease-out data-[state=open]:slide-in-from-bottom-4 sm:max-w-sm">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="font-display text-2xl font-medium text-ink">
              Apagar Polaroid?
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Tem certeza que quer apagar a Polaroid?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={cancelarRemocaoDraft}
              className="h-10 rounded-full border-border bg-paper/70 px-8 text-ink shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream hover:text-ink hover:shadow-polaroid active:scale-[0.98] sm:min-w-32"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={confirmarRemocaoDraft}
              className="h-10 rounded-full bg-ink px-8 text-paper shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink/90 hover:shadow-polaroid active:scale-[0.98] sm:min-w-32"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL FINALIZAÇÃO */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-2 rounded-2xl border-border bg-[#f1e7da] shadow-polaroid duration-300 ease-out data-[state=open]:slide-in-from-bottom-4 sm:max-w-md">
          <DialogHeader className="space-y-0 text-center sm:text-center">
            <DialogTitle className="font-display text-2xl font-medium text-ink">
              Suas Polaroids estão prontas
            </DialogTitle>
          </DialogHeader>

          <div className="mb-2 mt-0">
            {!carrinhoVazio && (
              <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
                Revise suas Polaroids
              </p>
            )}
            {carrinhoVazio ? (
              <div className="criar-alert-card rounded-2xl border border-dashed border-border bg-paper/55 px-4 py-6 text-center">
                <p className="text-sm font-medium text-ink">Nenhuma Polaroid selecionada.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Feche este modal para criar ou adicionar uma nova Polaroid.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {showPreviewControls && (
                  <button
                    type="button"
                    onClick={handlePrevPreview}
                    disabled={!canGoPrev}
                    className={cn(
                      "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-paper text-ink shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream hover:shadow-polaroid active:scale-[0.97]",
                      !canGoPrev &&
                        "cursor-not-allowed opacity-35 hover:bg-paper hover:shadow-soft active:scale-100",
                    )}
                    aria-label="Polaroid anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                <div
                  className={cn(
                    "overflow-hidden",
                    showPreviewControls && "relative min-w-0 flex-1 rounded-xl",
                  )}
                >
                  {showPreviewControls && (
                    <>
                      <span className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-5 bg-gradient-to-r from-[#f1e7da] to-transparent" />
                      <span className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-5 bg-gradient-to-l from-[#f1e7da] to-transparent" />
                    </>
                  )}

                  <div
                    className={cn(
                      "motion-safe:transition-[margin-left,transform,opacity] motion-safe:duration-500 motion-safe:ease-out",
                      showPreviewControls
                        ? "flex w-full will-change-[margin-left]"
                        : "flex justify-center gap-3 overflow-hidden",
                    )}
                    style={showPreviewControls ? { marginLeft: `${previewStartIndex * -25}%` } : {}}
                  >
                    {saved.map((item, index) => {
                      const itemPolaroidSize =
                        polaroidSizes.find((size) => size.id === item.polaroidSizeId) ??
                        polaroidSizes[0];

                      const itemFontStyle = item.fontStyleId
                        ? fontStyles.find((style) => style.id === item.fontStyleId)
                        : null;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "shrink-0 transition-all duration-300 ease-out",
                            showPreviewControls ? "basis-1/4 px-1" : "w-16 sm:w-20",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => abrirPreviewPolaroid(item.id)}
                            className="group block w-full cursor-pointer rounded-md transition-[box-shadow,filter] duration-200 hover:ring-2 hover:ring-ink/20 hover:ring-offset-2 hover:ring-offset-[#f1e7da] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1e7da]"
                            aria-label={`Abrir prévia da Polaroid ${index + 1}`}
                          >
                            <div className="polaroid w-full !p-1.5 !pb-2 animate-in fade-in-0 zoom-in-95 duration-300 ease-out transition-[box-shadow,filter] group-hover:brightness-[0.98]">
                              <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-paper/95 px-1 py-0.5 text-[8px] font-semibold leading-none text-ink shadow-soft">
                                {itemPolaroidSize.label} cm
                              </span>

                              <div className="aspect-square overflow-hidden bg-muted">
                                {item.photoLocalUrl && (
                                  <img
                                    src={item.photoLocalUrl}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-500 ease-out"
                                    style={{
                                      objectPosition: `${item.imagePosX}% ${item.imagePosY}%`,
                                      transform: getImageTransform(item),
                                    }}
                                  />
                                )}
                              </div>

                              <p
                                className={cn(
                                  "mt-1 flex min-h-[1.15rem] items-center justify-center overflow-hidden text-center text-[8px] leading-[1.15] text-black",
                                  itemFontStyle?.fontClass,
                                )}
                                title={item.caption}
                              >
                                <span className="block max-w-full overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                  {item.caption}
                                </span>
                              </p>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {showPreviewControls && (
                  <button
                    type="button"
                    onClick={handleNextPreview}
                    disabled={!canGoNext}
                    className={cn(
                      "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-paper text-ink shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream hover:shadow-polaroid active:scale-[0.97]",
                      !canGoNext &&
                        "cursor-not-allowed opacity-35 hover:bg-paper hover:shadow-soft active:scale-100",
                    )}
                    aria-label="Próxima Polaroid"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/80 bg-paper/60 p-4 shadow-soft transition-all duration-300 ease-out">
            {carrinhoVazio ? (
              <div className="criar-alert-card rounded-xl border border-dashed border-border bg-paper/70 p-4 text-center">
                <p className="text-sm font-medium text-ink">Nenhuma Polaroid selecionada.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  O botão de pagamento fica indisponível até haver uma Polaroid no carrinho.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Quantidade</span>
                  <span className="font-medium text-ink">
                    {quantidadePolaroids} {quantidadePolaroids === 1 ? "Polaroid" : "Polaroids"}
                  </span>
                </div>

                <div className="mt-4 border-t border-border/70 pt-4">
                  <div className="rounded-2xl border border-border/70 bg-cream/70 p-4 text-center shadow-soft transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Total do pedido
                    </p>

                    <p className="mt-1 text-3xl font-bold tracking-tight text-ink">
                      {totalPedidoFormatado}
                    </p>

                    <p className="mt-1 text-xs font-medium text-sepia">{mensagemEconomia}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border/70 bg-paper/70 p-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Arquivos liberados
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    <li className="flex items-center gap-2 text-sm text-ink">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      PDF completo para impressão
                    </li>
                    <li className="flex items-center gap-2 text-sm text-ink">
                      <FileImage className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      PNG individual de cada Polaroid
                    </li>
                    <li className="flex items-center gap-2 text-sm text-ink">
                      <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      Arquivos em alta resolução
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={iniciarPagamento}
            disabled={carrinhoVazio || isCheckingOut}
            className={cn(
              "h-12 w-full cursor-pointer rounded-full bg-ink text-base font-medium text-paper shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink/90 hover:shadow-polaroid active:scale-[0.98]",
              (carrinhoVazio || isCheckingOut) &&
                "cursor-not-allowed bg-ink/35 text-paper/80 hover:bg-ink/35 hover:shadow-soft active:scale-100",
            )}
          >
            {carrinhoVazio
              ? "Nenhuma Polaroid para pagar"
              : isCheckingOut
                ? "Criando pedido..."
                : `Pagar ${totalPedidoFormatado} e liberar Polaroids`}
          </Button>

          {!carrinhoVazio && (
            <p className="text-center text-xs text-muted-foreground">
              Pagamento seguro. Seus arquivos são liberados após a confirmação.
            </p>
          )}

          {previewPolaroid && (
            <div
              className="absolute inset-0 z-[60] flex items-center justify-center rounded-2xl bg-black/35 p-3 backdrop-blur-[1px] animate-in fade-in-0 duration-200"
              role="dialog"
              aria-modal="true"
              aria-labelledby="polaroid-preview-title"
            >
              <div
                key={previewPolaroid.id}
                className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-[26rem] flex-col overflow-hidden rounded-2xl border border-border bg-[#f1e7da] p-4 shadow-polaroid animate-in zoom-in-95 duration-200 sm:p-5"
              >
                <button
                  type="button"
                  onClick={fecharPreviewPolaroid}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-black text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Fechar prévia"
                >
                  <X className="h-4 w-4" strokeWidth={2.25} />
                </button>

                <div className="pr-10 text-center sm:pr-0">
                  <h3
                    id="polaroid-preview-title"
                    className="font-display text-xl font-medium text-ink"
                  >
                    Prévia da Polaroid
                  </h3>
                </div>

                <div className="mt-4 flex min-h-0 justify-center overflow-auto px-1 py-2">
                  <div
                    className="shrink-0"
                    style={{
                      width: `${previewPolaroidSize.widthCm * modalPreviewScale}cm`,
                      height: `${previewPolaroidSize.heightCm * modalPreviewScale}cm`,
                    }}
                  >
                    <div
                      className="polaroid box-border max-w-none origin-top-left"
                      style={{
                        width: `${previewPolaroidSize.widthCm}cm`,
                        height: `${previewPolaroidSize.heightCm}cm`,
                        transform: `scale(${modalPreviewScale})`,
                      }}
                    >
                      <div
                        className={cn(
                          "relative w-full overflow-hidden bg-muted",
                          previewTemplate.toneClass,
                        )}
                        style={{
                          height: `${previewPolaroidSize.imageHeightCm}cm`,
                        }}
                      >
                        {previewPolaroid.photoLocalUrl && (
                          <img
                            src={previewPolaroid.photoLocalUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition: `${previewPolaroid.imagePosX}% ${previewPolaroid.imagePosY}%`,
                              transform: getImageTransform(previewPolaroid),
                            }}
                          />
                        )}
                      </div>

                      <p
                        className="absolute bottom-0 left-3 right-3 flex items-center justify-center overflow-hidden px-2 text-black leading-tight"
                        style={{
                          top: `calc(0.75rem + ${previewPolaroidSize.imageHeightCm}cm)`,
                        }}
                      >
                        <span
                          className={cn(
                            "inline-block w-full max-w-full break-words leading-tight",
                            alignClass[previewPolaroid.align],
                            previewFontStyle?.fontClass,
                            fontWeightClass[previewPolaroid.fontWeightId ?? "regular"],
                            getCaptionSizeClass(
                              previewPolaroid.polaroidSizeId,
                              previewPolaroid.size,
                            ),
                          )}
                        >
                          {previewPolaroid.caption || " "}
                        </span>
                      </p>

                      <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center overflow-hidden">
                        <span className="-rotate-12 text-5xl font-bold uppercase tracking-[0.28em] text-ink/15 sm:text-6xl">
                          PRÉVIA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                  {previewPolaroidSize.label} cm
                </p>

                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={removerPolaroidSelecionada}
                    className="h-10 rounded-full border-border bg-paper/70 text-ink shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream hover:text-destructive hover:shadow-polaroid active:scale-[0.98] sm:min-w-44"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover do carrinho
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
