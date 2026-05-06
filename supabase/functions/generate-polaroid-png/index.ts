import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  fetchPolaroidFont,
  getPhotoTargetSizePx,
  renderPolaroidPng,
  type OrderItemForPngRender,
} from "../_shared/polaroid-png-renderer.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FINAL_BUCKET = "final-files";

const ORDER_ITEM_SELECT =
  "id,order_id,position,photo_url,caption,template_id,font_style_id,font_weight_id,polaroid_size_id,size,align,image_pos_x,image_pos_y";

async function getFontBytes(item: OrderItemForPngRender) {
  let fontBytes = await fetchPolaroidFont(
    item.font_style_id,
    item.font_weight_id,
  );
  if (!fontBytes && item.font_style_id) {
    fontBytes = await fetchPolaroidFont(null, item.font_weight_id);
  }
  return fontBytes;
}

function getStorageTransformUrl(item: OrderItemForPngRender): string {
  const { width, height } = getPhotoTargetSizePx(
    item.polaroid_size_id,
    item.size,
  );
  const transformScale = 1.6;

  try {
    const url = new URL(item.photo_url);
    const publicObjectPath = "/storage/v1/object/public/";
    const publicPathIndex = url.pathname.indexOf(publicObjectPath);

    if (publicPathIndex === -1) return item.photo_url;

    const filePath = url.pathname.slice(
      publicPathIndex + publicObjectPath.length,
    );
    url.pathname = `/storage/v1/render/image/public/${filePath}`;
    url.searchParams.set("width", String(Math.ceil(width * transformScale)));
    url.searchParams.set("height", String(Math.ceil(height * transformScale)));
    url.searchParams.set("resize", "contain");
    url.searchParams.set("quality", "92");

    return url.toString();
  } catch {
    return item.photo_url;
  }
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

  let body: { orderId?: string; position?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Body invalido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.orderId || typeof body.orderId !== "string") {
    return new Response(
      JSON.stringify({ ok: false, error: "orderId obrigatorio" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (typeof body.position !== "number") {
    return new Response(
      JSON.stringify({ ok: false, error: "position obrigatorio" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status")
    .eq("id", body.orderId)
    .single();

  if (orderError || !order) {
    return new Response(
      JSON.stringify({ ok: false, error: "Pedido nao encontrado" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  if (order.status !== "paid") {
    return new Response(
      JSON.stringify({ ok: false, error: "Pedido nao esta pago" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: item, error: itemError } = await supabase
    .from("order_items")
    .select(ORDER_ITEM_SELECT)
    .eq("order_id", body.orderId)
    .eq("position", body.position)
    .single();

  if (itemError || !item) {
    return new Response(
      JSON.stringify({ ok: false, error: "Item nao encontrado" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const renderItem = item as OrderItemForPngRender;
    console.log("[generate-polaroid-png] Compondo item", {
      orderId: body.orderId,
      order_item_id: renderItem.id,
      caption: renderItem.caption ?? "",
      align: renderItem.align,
      size: renderItem.size,
      font_style_id: renderItem.font_style_id,
      font_weight_id: renderItem.font_weight_id,
      image_pos_x: renderItem.image_pos_x,
      image_pos_y: renderItem.image_pos_y,
      template_id: renderItem.template_id,
      polaroid_size_id: renderItem.polaroid_size_id,
    });

    const photoUrl = getStorageTransformUrl(renderItem);
    console.log("[generate-polaroid-png] Foto para composicao", {
      orderId: body.orderId,
      order_item_id: renderItem.id,
      transformed: photoUrl !== renderItem.photo_url,
    });

    const photoRes = await fetch(photoUrl);
    if (!photoRes.ok) throw new Error(`Foto retornou ${photoRes.status}`);

    const png = await renderPolaroidPng(
      renderItem,
      new Uint8Array(await photoRes.arrayBuffer()),
      await getFontBytes(renderItem),
    );
    const pngPath = `${body.orderId}/polaroid-${renderItem.position + 1}.png`;

    const { error: uploadError } = await supabase.storage
      .from(FINAL_BUCKET)
      .upload(pngPath, png, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError)
      throw new Error(`Upload PNG falhou: ${uploadError.message}`);

    await supabase
      .from("order_items")
      .update({ final_png_path: pngPath })
      .eq("id", renderItem.id);

    return new Response(JSON.stringify({ ok: true, pngPath }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-polaroid-png] Erro:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
