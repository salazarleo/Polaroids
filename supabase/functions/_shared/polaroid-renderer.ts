import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";
import {
  Image,
  TextLayout,
} from "https://deno.land/x/imagescript@1.3.0/mod.ts";

export const PRINT_DPI = 300;
export const PT_PER_CM = 72 / 2.54;

const CSS_DPI = 96;
const REM_PX = (16 / CSS_DPI) * PRINT_DPI;
const FRAME_PADDING_REM = 0.75;
const FRAME_RADIUS_CSS_PX = 4;
const FINAL_BG_TOP = "#fefdf9";
const FINAL_BG_BOTTOM = "#faf6ee";
const PHOTO_BG = "#eee7dc";
const CAPTION_COLOR = "#2a2018";
const PAPER_COLOR = 0xfefdf9ff;
const PHOTO_BG_COLOR = 0xeee7dcff;
const CAPTION_TEXT_COLOR = 0x2a2018ff;

export const POLAROID_PRINT_SIZES_CM = {
  "7x10": { widthCm: 7, heightCm: 10, photoHeightCm: 7.8 },
  "5x8": { widthCm: 5, heightCm: 8, photoHeightCm: 6.2 },
  "4x5": { widthCm: 4, heightCm: 5, photoHeightCm: 3.6 },
} as const;

const CAPTION_FONT_REM: Record<string, Record<string, number>> = {
  "7x10": { sm: 0.95, md: 1.08, lg: 1.2 },
  "5x8": { sm: 0.8, md: 0.92, lg: 1.05 },
  "4x5": { sm: 0.58, md: 0.68, lg: 0.78 },
};

type PrintSizeId = keyof typeof POLAROID_PRINT_SIZES_CM;

type FontConfig = {
  family: string;
  google: string;
  fallback: string;
  ttfUrl: string;
  style?: "normal" | "italic";
  weight?: number;
  widthFactor?: number;
  letterSpacingEm?: number;
};

const GF = "https://cdn.jsdelivr.net/gh/google/fonts@main";

const FONT_CONFIG: Record<string, FontConfig> = {
  arimo: {
    family: "Arimo",
    google: "Arimo",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/apache/arimo/static/Arimo-Regular.ttf`,
  },
  "open-sans": {
    family: "Open Sans",
    google: "Open+Sans",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/apache/opensans/static/OpenSans-Regular.ttf`,
  },
  montserrat: {
    family: "Montserrat",
    google: "Montserrat",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/ofl/montserrat/static/Montserrat-Regular.ttf`,
  },
  poppins: {
    family: "Poppins",
    google: "Poppins",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/ofl/poppins/Poppins-Regular.ttf`,
  },
  anton: {
    family: "Anton",
    google: "Anton",
    fallback: "Impact, sans-serif",
    ttfUrl: `${GF}/ofl/anton/Anton-Regular.ttf`,
    widthFactor: 0.5,
  },
  "league-spartan": {
    family: "League Spartan",
    google: "League+Spartan",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/ofl/leaguespartan/static/LeagueSpartan-Bold.ttf`,
    weight: 700,
  },
  "glacial-indifference": {
    family: "Poppins",
    google: "Poppins",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/ofl/poppins/Poppins-Regular.ttf`,
  },
  "canva-sans": {
    family: "Open Sans",
    google: "Open+Sans",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/apache/opensans/static/OpenSans-Regular.ttf`,
  },
  "archivo-black": {
    family: "Archivo Black",
    google: "Archivo+Black",
    fallback: "Arial Black, sans-serif",
    ttfUrl: `${GF}/ofl/archivoblack/ArchivoBlack-Regular.ttf`,
    widthFactor: 0.62,
  },
  questrial: {
    family: "Questrial",
    google: "Questrial",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/ofl/questrial/Questrial-Regular.ttf`,
  },
  gagalin: {
    family: "Anton",
    google: "Anton",
    fallback: "Impact, sans-serif",
    ttfUrl: `${GF}/ofl/anton/Anton-Regular.ttf`,
    style: "italic",
    widthFactor: 0.5,
    letterSpacingEm: 0.03,
  },
  garet: {
    family: "Manrope",
    google: "Manrope",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/ofl/manrope/static/Manrope-ExtraBold.ttf`,
    weight: 800,
  },
  "bebas-neue": {
    family: "Bebas Neue",
    google: "Bebas+Neue",
    fallback: "Arial, sans-serif",
    ttfUrl: `${GF}/ofl/bebasnuee/BebasNeue-Regular.ttf`,
    widthFactor: 0.45,
    letterSpacingEm: 0.02,
  },
  alice: {
    family: "Alice",
    google: "Alice",
    fallback: "Georgia, serif",
    ttfUrl: `${GF}/ofl/alice/Alice-Regular.ttf`,
    widthFactor: 0.58,
  },
  caveat: {
    family: "Caveat",
    google: "Caveat",
    fallback: "cursive",
    ttfUrl: `${GF}/ofl/caveat/static/Caveat-Regular.ttf`,
    widthFactor: 0.46,
  },
  playfair: {
    family: "Playfair Display",
    google: "Playfair+Display",
    fallback: "Georgia, serif",
    ttfUrl: `${GF}/ofl/playfairdisplay/static/PlayfairDisplay-Regular.ttf`,
    widthFactor: 0.58,
  },
};

const DEFAULT_FONT_CONFIG = FONT_CONFIG.montserrat;

export interface OrderItemForRender {
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
  final_png_path?: string | null;
}

export interface PrintLayout {
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
  borderRadius: number;
  widthCm: number;
  heightCm: number;
}

type PhotoPlacement = {
  mime: string;
  sourceWidth: number | null;
  sourceHeight: number | null;
  posXPercent: number;
  posYPercent: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number | null;
  preserveAspectRatio: string;
  fallback: boolean;
};

export async function initPolaroidRenderer() {
  // Kept as an explicit warmup hook for callers. ImageScript loads lazily.
}

export function cmToPx(cm: number, dpi = PRINT_DPI): number {
  return Math.round((cm / 2.54) * dpi);
}

export function cmToPt(cm: number): number {
  return cm * PT_PER_CM;
}

function cssPxToPrintPx(px: number): number {
  return Math.round((px / CSS_DPI) * PRINT_DPI);
}

function getSizeId(sizeId: string): PrintSizeId {
  return sizeId in POLAROID_PRINT_SIZES_CM ? (sizeId as PrintSizeId) : "7x10";
}

export function getPrintLayout(
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
    borderRadius: cssPxToPrintPx(FRAME_RADIUS_CSS_PX),
    widthCm: size.widthCm,
    heightCm: size.heightCm,
  };
}

export function getPrintSizeCm(polaroidSizeId: string): {
  widthCm: number;
  heightCm: number;
} {
  const size = POLAROID_PRINT_SIZES_CM[getSizeId(polaroidSizeId)];
  return { widthCm: size.widthCm, heightCm: size.heightCm };
}

export function getPhotoMime(bytes: Uint8Array): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

export function getImageDimensions(
  bytes: Uint8Array,
): { w: number; h: number } | null {
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { w: view.getUint32(16), h: view.getUint32(20) };
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    while (i < bytes.length - 8) {
      if (bytes[i] !== 0xff) {
        i += 1;
        continue;
      }

      const marker = bytes[i + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { w: view.getUint16(i + 7), h: view.getUint16(i + 5) };
      }

      if (i + 3 >= bytes.length) break;
      const segmentLength = (bytes[i + 2] << 8) | bytes[i + 3];
      i += 2 + segmentLength;
    }
  }

  return null;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 32768;

  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }

  return btoa(binary);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  item: OrderItemForRender,
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

  // Try direct CDN URL first (avoids CSS parsing that breaks with woff2-only responses)
  if (fontConfig.ttfUrl) {
    try {
      const res = await fetch(fontConfig.ttfUrl);
      if (res.ok) {
        const bytes = new Uint8Array(await res.arrayBuffer());
        console.log("[polaroid-renderer] Fonte baixada via CDN direto", {
          fontStyleId,
          resolvedFamily: fontConfig.family,
          ttfUrl: fontConfig.ttfUrl,
          bytes: bytes.byteLength,
        });
        return bytes;
      }
      console.warn("[polaroid-renderer] CDN direto retornou erro", {
        fontStyleId,
        ttfUrl: fontConfig.ttfUrl,
        status: res.status,
      });
    } catch (err) {
      console.warn("[polaroid-renderer] Falha na requisicao CDN direto", {
        fontStyleId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Fallback: Google Fonts CSS API (extended regex: ttf, otf, woff2, woff)
  const weight = fontWeightId === "bold" ? 700 : (fontConfig.weight ?? 400);
  try {
    const cssUrl = `https://fonts.googleapis.com/css?family=${fontConfig.google}:${weight}`;
    const css = await fetch(cssUrl, {
      headers: {
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)",
      },
    }).then((r) => {
      if (!r.ok) throw new Error(`Google Fonts CSS retornou ${r.status}`);
      return r.text();
    });

    const ttfMatch = css.match(/url\((['"]?)([^'")\s]+\.(?:ttf|otf))\1\)/i);
    if (ttfMatch) {
      const fontUrl = ttfMatch[2];
      const fontRes = await fetch(fontUrl);
      if (fontRes.ok) {
        const bytes = new Uint8Array(await fontRes.arrayBuffer());
        console.log("[polaroid-renderer] Fonte baixada via Google Fonts CSS", {
          fontStyleId,
          resolvedFamily: fontConfig.family,
          bytes: bytes.byteLength,
        });
        return bytes;
      }
    }

    console.warn("[polaroid-renderer] URL TTF/OTF nao encontrada na CSS Google Fonts", {
      fontStyleId,
      cssUrl,
    });
  } catch (err) {
    console.warn("[polaroid-renderer] Falha no fallback Google Fonts CSS", {
      fontStyleId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  console.warn("[polaroid-renderer] Fonte nao carregada, texto sem fonte customizada", {
    fontStyleId,
    resolvedFamily: fontConfig.family,
  });
  return null;
}

function wrapText(text: string, maxChars: number): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const lines: string[] = [];
  let current = "";

  for (const rawWord of normalized.split(" ")) {
    let word = rawWord;

    while (word.length > maxChars) {
      const part = word.slice(0, maxChars);
      word = word.slice(maxChars);

      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(part);
    }

    if (!current || current.length + 1 + word.length <= maxChars) {
      current = current ? `${current} ${word}` : word;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function getCaptionLines(
  caption: string,
  layout: PrintLayout,
  fontConfig: FontConfig,
): { lines: string[]; fontSize: number; lineHeight: number } {
  let fontSize = layout.captionFontSize;
  const minFontSize = Math.max(10, Math.round(layout.captionFontSize * 0.55));
  const widthFactor = fontConfig.widthFactor ?? 0.56;

  while (fontSize >= minFontSize) {
    const maxChars = Math.max(
      8,
      Math.floor(layout.captionMaxWidth / (fontSize * widthFactor)),
    );
    const lines = wrapText(caption, maxChars);
    const lineHeight = Math.round(fontSize * 1.24);
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= layout.captionHeight * 0.78) {
      return { lines, fontSize, lineHeight };
    }

    fontSize = Math.floor(fontSize * 0.92);
  }

  const maxChars = Math.max(
    8,
    Math.floor(layout.captionMaxWidth / (minFontSize * widthFactor)),
  );
  return {
    lines: wrapText(caption, maxChars),
    fontSize: minFontSize,
    lineHeight: Math.round(minFontSize * 1.2),
  };
}

function getCaptionRenderDebug(item: OrderItemForRender, layout: PrintLayout) {
  const caption = item.caption?.trim() ?? "";
  const fontConfig = getFontConfig(item.font_style_id);
  const fontWeight = getFontWeight(item, fontConfig);
  const hasCaption = caption.length > 0;
  const { lines, fontSize, lineHeight } = hasCaption
    ? getCaptionLines(caption, layout, fontConfig)
    : {
        lines: [] as string[],
        fontSize: layout.captionFontSize,
        lineHeight: Math.round(layout.captionFontSize * 1.24),
      };
  const alignResolved = item.align === "default" ? "center" : item.align;
  const textAnchor =
    alignResolved === "left"
      ? "start"
      : alignResolved === "right"
        ? "end"
        : "middle";
  const textX =
    alignResolved === "left"
      ? layout.captionX + cmToPx(0.1)
      : alignResolved === "right"
        ? layout.captionX + layout.photoWidth - cmToPx(0.1)
        : layout.canvasWidthPx / 2;
  const totalHeight = lines.length * lineHeight;
  const captionCenterY = layout.captionY + layout.captionHeight / 2;
  const firstY = captionCenterY - totalHeight / 2 + fontSize * 0.82;

  return {
    hasCaption,
    captionLength: caption.length,
    align: item.align,
    size: item.size,
    font_style_id: item.font_style_id,
    font_weight_id: item.font_weight_id,
    resolvedFontFamily: fontConfig.family,
    resolvedFontWeight: fontWeight,
    fontSize,
    lineHeight,
    lineCount: lines.length,
    textAnchor,
    textX: Number(textX.toFixed(2)),
    firstY: Number(firstY.toFixed(2)),
    captionBox: {
      x: layout.captionX,
      y: layout.captionY,
      width: layout.photoWidth,
      height: layout.captionHeight,
      maxWidth: layout.captionMaxWidth,
    },
  };
}

function buildCaptionSvg(
  item: OrderItemForRender,
  layout: PrintLayout,
): string {
  const caption = item.caption?.trim();
  if (!caption) return "";

  const fontConfig = getFontConfig(item.font_style_id);
  const { lines, fontSize, lineHeight } = getCaptionLines(
    caption,
    layout,
    fontConfig,
  );
  if (lines.length === 0) return "";

  const alignResolved = item.align === "default" ? "center" : item.align;
  const textAnchor =
    alignResolved === "left"
      ? "start"
      : alignResolved === "right"
        ? "end"
        : "middle";
  const textX =
    alignResolved === "left"
      ? layout.captionX + cmToPx(0.1)
      : alignResolved === "right"
        ? layout.captionX + layout.photoWidth - cmToPx(0.1)
        : layout.canvasWidthPx / 2;
  const totalHeight = lines.length * lineHeight;
  const captionCenterY = layout.captionY + layout.captionHeight / 2;
  const firstY = captionCenterY - totalHeight / 2 + fontSize * 0.82;
  const fontWeight = getFontWeight(item, fontConfig);
  const letterSpacing = fontConfig.letterSpacingEm
    ? ` letter-spacing="${(fontConfig.letterSpacingEm * fontSize).toFixed(2)}"`
    : "";

  const tspans = lines
    .map((line, index) =>
      index === 0
        ? `<tspan x="${textX.toFixed(1)}" y="${firstY.toFixed(1)}">${xmlEscape(line)}</tspan>`
        : `<tspan x="${textX.toFixed(1)}" dy="${lineHeight}">${xmlEscape(line)}</tspan>`,
    )
    .join("");
  const fontFamily = `'${xmlEscape(fontConfig.family)}', ${fontConfig.fallback}`;

  return `<text clip-path="url(#captionClip)" text-anchor="${textAnchor}" font-family="${fontFamily}" font-size="${fontSize}" font-style="${
    fontConfig.style ?? "normal"
  }" font-weight="${fontWeight}" fill="${CAPTION_COLOR}"${letterSpacing}>${tspans}</text>`;
}

function buildFontFace(
  fontBytes: Uint8Array | null,
  item: OrderItemForRender,
): string {
  if (!fontBytes) return "";

  const fontConfig = getFontConfig(item.font_style_id);
  const fontWeight = getFontWeight(item, fontConfig);

  return `@font-face{font-family:'${fontConfig.family}';src:url('data:font/truetype;base64,${bytesToBase64(
    fontBytes,
  )}') format('truetype');font-style:${fontConfig.style ?? "normal"};font-weight:${fontWeight};}`;
}

function getPhotoPlacement(
  item: OrderItemForRender,
  photoBytes: Uint8Array,
  layout: PrintLayout,
): PhotoPlacement {
  const mime = getPhotoMime(photoBytes);
  const dimensions = getImageDimensions(photoBytes);
  const posXPercent = clampPercent(item.image_pos_x);
  const posYPercent = clampPercent(item.image_pos_y);
  const posX = posXPercent / 100;
  const posY = posYPercent / 100;

  if (dimensions && dimensions.w > 0 && dimensions.h > 0) {
    const scale = Math.max(
      layout.photoWidth / dimensions.w,
      layout.photoHeight / dimensions.h,
    );
    const renderedWidth = dimensions.w * scale;
    const renderedHeight = dimensions.h * scale;
    const x = layout.photoX + (layout.photoWidth - renderedWidth) * posX;
    const y = layout.photoY + (layout.photoHeight - renderedHeight) * posY;

    return {
      mime,
      sourceWidth: dimensions.w,
      sourceHeight: dimensions.h,
      posXPercent,
      posYPercent,
      x,
      y,
      width: renderedWidth,
      height: renderedHeight,
      scale,
      preserveAspectRatio: "none",
      fallback: false,
    };
  }

  return {
    mime,
    sourceWidth: null,
    sourceHeight: null,
    posXPercent,
    posYPercent,
    x: layout.photoX,
    y: layout.photoY,
    width: layout.photoWidth,
    height: layout.photoHeight,
    scale: null,
    preserveAspectRatio: "xMidYMid slice",
    fallback: true,
  };
}

function buildPhotoSvg(
  item: OrderItemForRender,
  photoBytes: Uint8Array,
  layout: PrintLayout,
): string {
  const base64 = bytesToBase64(photoBytes);
  const placement = getPhotoPlacement(item, photoBytes, layout);
  const filter =
    item.template_id === "album" ? ` filter="url(#sepiaTone)"` : "";

  return `<g clip-path="url(#photoClip)"><image href="data:${placement.mime};base64,${base64}" xlink:href="data:${placement.mime};base64,${base64}" x="${placement.x.toFixed(
    2,
  )}" y="${placement.y.toFixed(2)}" width="${placement.width.toFixed(2)}" height="${placement.height.toFixed(
    2,
  )}" preserveAspectRatio="${placement.preserveAspectRatio}"${filter}/></g>`;
}

function getPhotoPlacementDebug(
  placement: PhotoPlacement,
  layout: PrintLayout,
) {
  return {
    sourceWidth: placement.sourceWidth,
    sourceHeight: placement.sourceHeight,
    image_pos_x: placement.posXPercent,
    image_pos_y: placement.posYPercent,
    renderX: Number(placement.x.toFixed(2)),
    renderY: Number(placement.y.toFixed(2)),
    renderWidth: Number(placement.width.toFixed(2)),
    renderHeight: Number(placement.height.toFixed(2)),
    scale: placement.scale === null ? null : Number(placement.scale.toFixed(6)),
    preserveAspectRatio: placement.preserveAspectRatio,
    fallback: placement.fallback,
    photoBox: {
      x: layout.photoX,
      y: layout.photoY,
      width: layout.photoWidth,
      height: layout.photoHeight,
    },
  };
}

async function buildPhotoBitmap(
  item: OrderItemForRender,
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

function getCaptionHorizontalAlign(align: string): "left" | "center" | "right" {
  if (align === "left") return "left";
  if (align === "right") return "right";
  return "center";
}

function getCaptionBitmapX(
  item: OrderItemForRender,
  layout: PrintLayout,
  captionWidth: number,
): number {
  const alignResolved = item.align === "default" ? "center" : item.align;
  const inset = cmToPx(0.1);

  if (alignResolved === "left") return layout.captionX + inset;
  if (alignResolved === "right") {
    return layout.captionX + layout.photoWidth - captionWidth - inset;
  }

  return layout.captionX + (layout.photoWidth - captionWidth) / 2;
}

function makeCaptionLayout(
  horizontalAlign: "left" | "center" | "right",
  maxWidth: number,
  maxHeight: number,
): TextLayout {
  return new TextLayout({
    maxWidth,
    maxHeight,
    wrapStyle: "word",
    horizontalAlign,
    verticalAlign: "top",
  });
}

function renderCaptionBitmap(
  item: OrderItemForRender,
  layout: PrintLayout,
  fontBytes: Uint8Array | null,
) {
  const caption = item.caption?.trim();
  if (!caption || !fontBytes) return null;

  const alignResolved = item.align === "default" ? "center" : item.align;
  const horizontalAlign = getCaptionHorizontalAlign(alignResolved);
  const maxHeight = Math.round(layout.captionHeight * 0.84);

  let fontSize = layout.captionFontSize;
  const minFontSize = Math.max(10, Math.round(layout.captionFontSize * 0.55));

  while (fontSize >= minFontSize) {
    try {
      const bitmap = Image.renderText(
        fontBytes,
        fontSize,
        caption,
        CAPTION_TEXT_COLOR,
        makeCaptionLayout(horizontalAlign, layout.captionMaxWidth, maxHeight),
      );

      if (bitmap.height <= maxHeight) {
        return bitmap;
      }
    } catch {
      // font may not support all glyphs — try smaller
    }

    fontSize = Math.floor(fontSize * 0.92);
  }

  try {
    return Image.renderText(
      fontBytes,
      minFontSize,
      caption,
      CAPTION_TEXT_COLOR,
      makeCaptionLayout(horizontalAlign, layout.captionMaxWidth, maxHeight),
    );
  } catch {
    return null;
  }
}

async function renderPolaroidBitmap(
  item: OrderItemForRender,
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

  logRenderDebug(
    item,
    layout,
    getPhotoPlacement(item, photoBytes, layout),
    fontBytes,
  );

  return canvas.encode();
}

function logRenderDebug(
  item: OrderItemForRender,
  layout: PrintLayout,
  photoPlacement: PhotoPlacement,
  fontBytes: Uint8Array | null,
) {
  console.log("[polaroid-renderer] Compondo PNG final", {
    orderId: item.order_id,
    order_item_id: item.id,
    position: item.position,
    caption: item.caption ?? "",
    align: item.align,
    size: item.size,
    font_style_id: item.font_style_id,
    font_weight_id: item.font_weight_id,
    image_pos_x: item.image_pos_x,
    image_pos_y: item.image_pos_y,
    template_id: item.template_id,
    polaroid_size_id: item.polaroid_size_id,
    hasEmbeddedFont: Boolean(fontBytes),
    layout: {
      canvasWidthPx: layout.canvasWidthPx,
      canvasHeightPx: layout.canvasHeightPx,
      widthCm: layout.widthCm,
      heightCm: layout.heightCm,
      paddingPx: layout.paddingPx,
    },
    photo: getPhotoPlacementDebug(photoPlacement, layout),
    captionRender: getCaptionRenderDebug(item, layout),
  });
}

export function buildPolaroidSvg(
  item: OrderItemForRender,
  photoBytes: Uint8Array,
  fontBytes: Uint8Array | null,
): string {
  const layout = getPrintLayout(item.polaroid_size_id, item.size);
  const photoSvg = buildPhotoSvg(item, photoBytes, layout);
  const captionSvg = buildCaptionSvg(item, layout);
  const fontFace = buildFontFace(fontBytes, item);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${layout.canvasWidthPx}" height="${layout.canvasHeightPx}" viewBox="0 0 ${layout.canvasWidthPx} ${layout.canvasHeightPx}">
<defs>
  <style>${fontFace}</style>
  <linearGradient id="paperBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${FINAL_BG_TOP}"/>
    <stop offset="100%" stop-color="${FINAL_BG_BOTTOM}"/>
  </linearGradient>
  <filter id="sepiaTone">
    <feColorMatrix type="matrix" values="0.92 0.08 0.04 0 0 0.05 0.90 0.05 0 0 0.03 0.07 0.88 0 0 0 0 0 1 0"/>
  </filter>
  <clipPath id="photoClip" clipPathUnits="userSpaceOnUse">
    <rect x="${layout.photoX}" y="${layout.photoY}" width="${layout.photoWidth}" height="${layout.photoHeight}"/>
  </clipPath>
  <clipPath id="captionClip" clipPathUnits="userSpaceOnUse">
    <rect x="${layout.captionX}" y="${layout.captionY}" width="${layout.photoWidth}" height="${layout.captionHeight}"/>
  </clipPath>
</defs>
<rect x="0" y="0" width="${layout.canvasWidthPx}" height="${layout.canvasHeightPx}" rx="${layout.borderRadius}" ry="${layout.borderRadius}" fill="url(#paperBg)"/>
<rect x="${layout.photoX}" y="${layout.photoY}" width="${layout.photoWidth}" height="${layout.photoHeight}" fill="${PHOTO_BG}"/>
${photoSvg}
${captionSvg}
</svg>`;
}

export async function svgToPng(svg: string): Promise<Uint8Array> {
  await initPolaroidRenderer();

  const image = await Image.renderSVG(svg);
  return image.encode();
}

export async function renderPolaroidPng(
  item: OrderItemForRender,
  photoBytes: Uint8Array,
  fontBytes: Uint8Array | null,
): Promise<Uint8Array> {
  return renderPolaroidBitmap(item, photoBytes, fontBytes);
}

export async function buildPolaroidPdf(
  items: OrderItemForRender[],
  pngBuffers: Uint8Array[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("Polaroids - pedido");
  pdfDoc.setCreator("EditPolaroids");

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const { widthCm, heightCm } = getPrintSizeCm(item.polaroid_size_id);
    const widthPt = cmToPt(widthCm);
    const heightPt = cmToPt(heightCm);
    const page = pdfDoc.addPage([widthPt, heightPt]);
    const image = await pdfDoc.embedPng(pngBuffers[index]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt,
    });
  }

  return pdfDoc.save();
}
