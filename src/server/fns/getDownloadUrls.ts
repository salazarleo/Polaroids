import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase";

const FINAL_BUCKET = "final-files";
const SIGNED_URL_EXPIRES = 60 * 60; // 1 hora

const Input = z.object({
  orderId: z.string().uuid(),
});

export interface DownloadUrlItem {
  position: number;
  signedUrl: string;
}

export const getDownloadUrls = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    // Só libera para pedidos pagos com arquivos prontos
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, files_ready, final_pdf_path")
      .eq("id", data.orderId)
      .single();

    if (orderErr || !order) throw new Error("Pedido não encontrado");
    if (order.status !== "paid") throw new Error("Pedido não está pago");
    if (!order.files_ready) throw new Error("Arquivos ainda não estão prontos");

    // Buscar paths dos PNGs
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("position, final_png_path")
      .eq("order_id", data.orderId)
      .order("position");

    if (itemsErr || !items) throw new Error("Itens do pedido não encontrados");

    // Gerar signed URLs para cada PNG
    const pngUrls: DownloadUrlItem[] = [];
    for (const item of items) {
      if (!item.final_png_path) continue;

      const { data: signed, error: signErr } = await supabase.storage
        .from(FINAL_BUCKET)
        .createSignedUrl(item.final_png_path, SIGNED_URL_EXPIRES, {
          download: `polaroid-${(item.position as number) + 1}.png`,
        });

      if (signErr || !signed) continue;
      pngUrls.push({ position: item.position as number, signedUrl: signed.signedUrl });
    }

    // Signed URL para o PDF
    let pdfUrl: string | null = null;
    if (order.final_pdf_path) {
      const { data: signed, error: signErr } = await supabase.storage
        .from(FINAL_BUCKET)
        .createSignedUrl(order.final_pdf_path, SIGNED_URL_EXPIRES, {
          download: "polaroids.pdf",
        });
      if (!signErr && signed) pdfUrl = signed.signedUrl;
    }

    return { pngUrls, pdfUrl };
  });
