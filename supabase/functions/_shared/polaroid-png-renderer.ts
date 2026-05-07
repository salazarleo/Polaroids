import {
  Image,
  TextLayout,
} from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const PRINT_DPI = 300;
const CSS_DPI = 96;
const REM_PX = (16 / CSS_DPI) * PRINT_DPI;
const FRAME_PADDING_REM = 0.75;
const PAPER_COLOR = 0xfefdf9ff;
const PHOTO_BG_COLOR = 0xeee7dcff;
const CAPTION_TEXT_COLOR = 0x2a2018ff;

const POLAROID_PRINT_SIZES_CM = {
  "7x10": { widthCm: 7, heightCm: 10, photoHeightCm: 7.9 },
  "5x8": { widthCm: 5, heightCm: 8, photoHeightCm: 6.3 },
  "4x5": { widthCm: 4, heightCm: 5, photoHeightCm: 3.55 },
} as const;

const CAPTION_FONT_REM: Record<string, Record<string, number>> = {
  "7x10": { sm: 0.95, md: 1.08, lg: 1.2 },
  "5x8": { sm: 0.8, md: 0.92, lg: 1.05 },
  "4x5": { sm: 0.58, md: 0.68, lg: 0.78 },
};

type PrintSizeId = keyof typeof POLAROID_PRINT_SIZES_CM;

type FontConfig = {
  google: string;
  weight?: number;
};

const FONT_CONFIG: Record<string, FontConfig> = {
  arimo: { google: "Arimo" },
  "open-sans": { google: "Open+Sans" },
  montserrat: { google: "Montserrat" },
  poppins: { google: "Poppins" },
  anton: { google: "Anton" },
  "league-spartan": { google: "League+Spartan", weight: 700 },
  "glacial-indifference": { google: "Poppins" },
  "canva-sans": { google: "Open+Sans" },
  "archivo-black": { google: "Archivo+Black" },
  questrial: { google: "Questrial" },
  gagalin: { google: "Anton" },
  garet: { google: "Manrope", weight: 800 },
  "bebas-neue": { google: "Bebas+Neue" },
  alice: { google: "Alice" },
  caveat: { google: "Caveat" },
  playfair: { google: "Playfair+Display" },
};

const DEFAULT_FONT_CONFIG = FONT_CONFIG.montserrat;

export interface OrderItemForPngRender {
  id: string;
  order_id?: string;
  position: number;
  photo_url: string;
  caption: string | null;
  template_id?: string | null;
  font_style_id: string | null;
  font_weight_id?: string | null;
  polaroid_size_id: string;
  size: string;
  align: string;
  image_pos_x: number | null;
  image_pos_y: number | null;
}

type PrintLayout = {
  canvasWidthPx: number;
  canvasHeightPx: number;
  paddingPx: number;
  photoX: number;
  photoY: number;
  photoWidth: number;
  photoHeight: number;
  captionX: number;
  captionY: number;
  captionMaxWidth: number;
  captionHeight: number;
  captionFontSize: number;
};

export function cmToPx(cm: number, dpi = PRINT_DPI): number {
  return Math.round((cm / 2.54) * dpi);
}

function getSizeId(sizeId: string): PrintSizeId {
  return sizeId in POLAROID_PRINT_SIZES_CM ? (sizeId as PrintSizeId) : "7x10";
}

function getPrintLayout(
  polaroidSizeId: string,
  captionSize = "md",
): PrintLayout {
  const sizeId = getSizeId(polaroidSizeId);
  const size = POLAROID_PRINT_SIZES_CM[sizeId];
  const canvasWidthPx = cmToPx(size.widthCm);
  const canvasHeightPx = cmToPx(size.heightCm);
  const paddingPx = Math.round(FRAME_PADDING_REM * REM_PX);
  const minCaptionHeightPx = Math.round(canvasHeightPx * 0.17);
  const photoHeight = Math.min(
    cmToPx(size.photoHeightCm),
    canvasHeightPx - paddingPx - minCaptionHeightPx,
  );
  const photoWidth = canvasWidthPx - paddingPx * 2;
  const captionY = paddingPx + photoHeight;
  const captionHeight = canvasHeightPx - captionY;
  const fontRem =
    CAPTION_FONT_REM[sizeId]?.[captionSize] ?? CAPTION_FONT_REM[sizeId].md;

  return {
    canvasWidthPx,
    canvasHeightPx,
    paddingPx,
    photoX: paddingPx,
    photoY: paddingPx,
    photoWidth,
    photoHeight,
    captionX: paddingPx,
    captionY,
    captionMaxWidth: photoWidth - cmToPx(0.18),
    captionHeight,
    captionFontSize: Math.round(fontRem * REM_PX),
  };
}

export function getPhotoTargetSizePx(
  polaroidSizeId: string,
  captionSize = "md",
) {
  const layout = getPrintLayout(polaroidSizeId, captionSize);
  return {
    width: layout.photoWidth,
    height: layout.photoHeight,
  };
}

function clampPercent(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 50;
  return Math.max(0, Math.min(100, value));
}

function getFontConfig(fontStyleId: string | null): FontConfig {
  if (!fontStyleId) return DEFAULT_FONT_CONFIG;
  return FONT_CONFIG[fontStyleId] ?? DEFAULT_FONT_CONFIG;
}

function getFontWeight(
  item: OrderItemForPngRender,
  fontConfig: FontConfig,
): number {
  if (item.font_weight_id === "bold") return 700;
  if (item.font_weight_id === "medium") return 500;
  if (item.font_weight_id === "light") return 300;
  return fontConfig.weight ?? 400;
}

export async function fetchPolaroidFont(
  fontStyleId: string | null,
  fontWeightId?: string | null,
): Promise<Uint8Array | null> {
  const fontConfig = getFontConfig(fontStyleId);
  const weight =
    fontWeightId === "bold"
      ? 700
      : getFontWeight(
          { font_weight_id: fontWeightId } as OrderItemForPngRender,
          fontConfig,
        );

  try {
    const cssUrl = `https://fonts.googleapis.com/css?family=${fontConfig.google}:${weight}`;
    const css = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7",
      },
    }).then((response) => response.text());

    const match = css.match(/url\(([^)]+)\)/i);
    if (!match) return null;

    const fontUrl = match[1].replace(/['"]/g, "");
    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) return null;

    return new Uint8Array(await fontResponse.arrayBuffer());
  } catch (error) {
    console.warn(
      "[polaroid-png-renderer] Fonte nao carregada, usando fallback",
      {
        fontStyleId,
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return null;
  }
}

async function buildPhotoBitmap(
  item: OrderItemForPngRender,
  photoBytes: Uint8Array,
  layout: PrintLayout,
) {
  const source = await Image.decode(photoBytes);
  const posX = clampPercent(item.image_pos_x) / 100;
  const posY = clampPercent(item.image_pos_y) / 100;
  const scale = Math.max(
    layout.photoWidth / source.width,
    layout.photoHeight / source.height,
  );
  const renderedWidth = Math.max(1, Math.round(source.width * scale));
  const renderedHeight = Math.max(1, Math.round(source.height * scale));
  const rendered = source.resize(renderedWidth, renderedHeight);
  const cropX = Math.max(
    0,
    Math.round((renderedWidth - layout.photoWidth) * posX),
  );
  const cropY = Math.max(
    0,
    Math.round((renderedHeight - layout.photoHeight) * posY),
  );

  return rendered.crop(cropX, cropY, layout.photoWidth, layout.photoHeight);
}

function getCaptionHorizontalAlign(align: string) {
  if (align === "left") return "left";
  if (align === "right") return "right";
  return "center";
}

function getCaptionBitmapX(
  item: OrderItemForPngRender,
  layout: PrintLayout,
  captionWidth: number,
) {
  const inset = cmToPx(0.1);
  if (item.align === "left") return layout.captionX + inset;
  if (item.align === "right") {
    return layout.captionX + layout.photoWidth - captionWidth - inset;
  }
  return layout.captionX + (layout.photoWidth - captionWidth) / 2;
}

function renderCaptionBitmap(
  item: OrderItemForPngRender,
  layout: PrintLayout,
  fontBytes: Uint8Array | null,
) {
  const caption = item.caption?.trim();
  if (!caption || !fontBytes) return null;

  let fontSize = layout.captionFontSize;
  const minFontSize = Math.max(10, Math.round(layout.captionFontSize * 0.55));
  const verticalAlign = getCaptionHorizontalAlign(item.align);

  while (fontSize >= minFontSize) {
    const bitmap = Image.renderText(
      fontBytes,
      fontSize,
      caption,
      CAPTION_TEXT_COLOR,
      new TextLayout({
        maxWidth: layout.captionMaxWidth,
        maxHeight: Math.round(layout.captionHeight * 0.84),
        wrapStyle: "word",
        verticalAlign,
        horizontalAlign: "middle",
      }),
    );

    if (
      bitmap.width <= layout.captionMaxWidth &&
      bitmap.height <= layout.captionHeight * 0.84
    ) {
      return bitmap;
    }

    fontSize = Math.floor(fontSize * 0.92);
  }

  return Image.renderText(
    fontBytes,
    minFontSize,
    caption,
    CAPTION_TEXT_COLOR,
    new TextLayout({
      maxWidth: layout.captionMaxWidth,
      maxHeight: Math.round(layout.captionHeight * 0.84),
      wrapStyle: "word",
      verticalAlign,
      horizontalAlign: "middle",
    }),
  );
}

export async function renderPolaroidPng(
  item: OrderItemForPngRender,
  photoBytes: Uint8Array,
  fontBytes: Uint8Array | null,
): Promise<Uint8Array> {
  const layout = getPrintLayout(item.polaroid_size_id, item.size);
  const canvas = new Image(layout.canvasWidthPx, layout.canvasHeightPx);

  canvas.fill(PAPER_COLOR);
  canvas.drawBox(
    layout.photoX,
    layout.photoY,
    layout.photoWidth,
    layout.photoHeight,
    PHOTO_BG_COLOR,
  );

  const photo = await buildPhotoBitmap(item, photoBytes, layout);
  canvas.composite(photo, layout.photoX, layout.photoY);

  const caption = renderCaptionBitmap(item, layout, fontBytes);
  if (caption) {
    const captionX = getCaptionBitmapX(item, layout, caption.width);
    const captionY =
      layout.captionY + (layout.captionHeight - caption.height) / 2;
    canvas.composite(caption, Math.round(captionX), Math.round(captionY));
  }

  return canvas.encode();
}
