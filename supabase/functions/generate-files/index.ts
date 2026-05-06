/**
 * Edge Function: generate-files
 *
 * Gera os PNGs finais e o PDF de um pedido pago.
 * Para caber no limite do Edge Runtime remoto, tambem aceita:
 * - mode: "png" + position: gera um PNG individual
 * - mode: "pdf": monta o PDF a partir dos PNGs ja gerados
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildPolaroidPdf,
  fetchPolaroidFont,
  initPolaroidRenderer,
  renderPolaroidPng,
  type OrderItemForRender,
} from "../_shared/polaroid-renderer.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FINAL_BUCKET = "final-files";
const EMBED_FONTS = Deno.env.get("POLAROID_EMBED_FONTS") !== "false";

const ORDER_ITEM_SELECT =
  "id,order_id,position,photo_url,caption,template_id,font_style_id,font_weight_id,polaroid_size_id,size,align,image_pos_x,image_pos_y,final_png_path";

type GenerateMode = "all" | "png" | "pdf";

type GenerateResult = {
  ok: boolean;
  error?: string;
  pngPath?: string;
  pdfPath?: string;
};

type SupabaseAny = any;

function getOrderItemLog(orderId: string, item: OrderItemForRender) {
  return {
    orderId,
    order_item_id: item.id,
    caption: item.caption ?? "",
    align: item.align,
    size: item.size,
    font_style_id: item.font_style_id,
    font_weight_id: item.font_weight_id,
    image_pos_x: item.image_pos_x,
    image_pos_y: item.image_pos_y,
    template_id: item.template_id,
    polaroid_size_id: item.polaroid_size_id,
  };
}

async function fetchOrderItems(
  supabase: SupabaseAny,
  orderId: string,
): Promise<OrderItemForRender[]> {
  const { data: items, error } = await supabase
    .from("order_items")
    .select(ORDER_ITEM_SELECT)
    .eq("order_id", orderId)
    .order("position");

  if (error || !items || items.length === 0) {
    throw new Error("Itens do pedido nao encontrados");
  }

  return items as OrderItemForRender[];
}

async function getFontBytes(
  item: OrderItemForRender,
  fontCache: Map<string, Uint8Array | null>,
): Promise<Uint8Array | null> {
  if (!EMBED_FONTS) return null;

  const fontKey = `${item.font_style_id ?? "__none__"}:${item.font_weight_id ?? "__none__"}`;
  if (!fontCache.has(fontKey)) {
    let fontBytes = await fetchPolaroidFont(
      item.font_style_id,
      item.font_weight_id,
    );

    if (!fontBytes && item.font_style_id) {
      fontBytes = await fetchPolaroidFont(null, item.font_weight_id);
    }

    fontCache.set(fontKey, fontBytes);
  }

  return fontCache.get(fontKey) ?? null;
}

async function generatePngForItem(
  supabase: SupabaseAny,
  orderId: string,
  item: OrderItemForRender,
  fontCache: Map<string, Uint8Array | null>,
): Promise<{ item: OrderItemForRender; png: Uint8Array; pngPath: string }> {
  console.log(
    "[generate-files] Usando item para composicao",
    getOrderItemLog(orderId, item),
  );

  const photoRes = await fetch(item.photo_url);
  if (!photoRes.ok) throw new Error(`Foto retornou ${photoRes.status}`);

  const photoBytes = new Uint8Array(await photoRes.arrayBuffer());
  const png = await renderPolaroidPng(
    item,
    photoBytes,
    await getFontBytes(item, fontCache),
  );
  const pngPath = `${orderId}/polaroid-${item.position + 1}.png`;

  const { error: uploadError } = await supabase.storage
    .from(FINAL_BUCKET)
    .upload(pngPath, png, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload PNG falhou: ${uploadError.message}`);

  await supabase
    .from("order_items")
    .update({ final_png_path: pngPath })
    .eq("id", item.id);

  console.log(`[generate-files] PNG OK: ${pngPath}`);
  return { item: { ...item, final_png_path: pngPath }, png, pngPath };
}

async function buildPdfFromStoredPngs(
  supabase: SupabaseAny,
  orderId: string,
  items: OrderItemForRender[],
): Promise<GenerateResult> {
  const pngBuffers: Uint8Array[] = [];

  for (const item of items) {
    if (!item.final_png_path) {
      return {
        ok: false,
        error: `PNG ausente para o item ${item.id}`,
      };
    }

    const { data, error } = await supabase.storage
      .from(FINAL_BUCKET)
      .download(item.final_png_path);

    if (error || !data) {
      return {
        ok: false,
        error: `Download PNG falhou para o item ${item.id}: ${error?.message ?? "sem arquivo"}`,
      };
    }

    pngBuffers.push(new Uint8Array(await data.arrayBuffer()));
  }

  const pdfBytes = await buildPolaroidPdf(items, pngBuffers);
  const pdfPath = `${orderId}/pedido.pdf`;

  const { error: pdfError } = await supabase.storage
    .from(FINAL_BUCKET)
    .upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (pdfError) {
    return { ok: false, error: `Upload PDF falhou: ${pdfError.message}` };
  }

  await supabase
    .from("orders")
    .update({ final_pdf_path: pdfPath, files_ready: true })
    .eq("id", orderId);

  console.log(`[generate-files] PDF OK: ${pdfPath}`);
  return { ok: true, pdfPath };
}

async function generateOrderFiles(
  orderId: string,
  mode: GenerateMode,
  position?: number,
): Promise<GenerateResult> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const items = await fetchOrderItems(supabase, orderId);

  console.log("[generate-files] Dados lidos de order_items", {
    orderId,
    count: items.length,
    mode,
    position,
    items: items.map((item) => getOrderItemLog(orderId, item)),
  });

  if (mode === "pdf") {
    return buildPdfFromStoredPngs(supabase, orderId, items);
  }

  await initPolaroidRenderer();

  const fontCache = new Map<string, Uint8Array | null>();

  if (mode === "png") {
    const item = items.find((candidate) => candidate.position === position);
    if (!item) return { ok: false, error: "Item do pedido nao encontrado" };

    const { pngPath } = await generatePngForItem(
      supabase,
      orderId,
      item,
      fontCache,
    );

    return { ok: true, pngPath };
  }

  const pngBuffers: Uint8Array[] = [];
  const processedItems: OrderItemForRender[] = [];

  for (const item of items) {
    try {
      const processed = await generatePngForItem(
        supabase,
        orderId,
        item,
        fontCache,
      );
      pngBuffers.push(processed.png);
      processedItems.push(processed.item);
    } catch (error) {
      console.error(`[generate-files] Erro no item ${item.id}:`, error);
    }
  }

  if (pngBuffers.length === 0) {
    return { ok: false, error: "Nenhum PNG foi gerado com sucesso" };
  }

  const pdfBytes = await buildPolaroidPdf(processedItems, pngBuffers);
  const pdfPath = `${orderId}/pedido.pdf`;
  const { error: pdfError } = await supabase.storage
    .from(FINAL_BUCKET)
    .upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (pdfError) {
    return { ok: false, error: `Upload PDF falhou: ${pdfError.message}` };
  }

  await supabase
    .from("orders")
    .update({ final_pdf_path: pdfPath, files_ready: true })
    .eq("id", orderId);

  console.log(`[generate-files] PDF OK: ${pdfPath}`);
  return { ok: true, pdfPath };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || token !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { orderId?: string; mode?: GenerateMode; position?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Body invalido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const orderId = body.orderId;
  if (!orderId || typeof orderId !== "string") {
    return new Response(
      JSON.stringify({ ok: false, error: "orderId obrigatorio" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const mode: GenerateMode =
    body.mode === "png" || body.mode === "pdf" ? body.mode : "all";

  if (mode === "png" && typeof body.position !== "number") {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "position obrigatorio para mode=png",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, status, files_ready")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return new Response(
      JSON.stringify({ ok: false, error: "Pedido nao encontrado" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (order.status !== "paid") {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Pedido nao esta pago - geracao bloqueada",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  if (order.files_ready === true && mode === "all") {
    return new Response(JSON.stringify({ ok: true, alreadyReady: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let result: GenerateResult;
  try {
    result = await generateOrderFiles(orderId, mode, body.position);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-files] Excecao nao capturada:", message);
    result = { ok: false, error: message };
  }

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
});
