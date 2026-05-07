import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FINAL_BUCKET = "final-files";
const PT_PER_CM = 72 / 2.54;

const POLAROID_PRINT_SIZES_CM: Record<
  string,
  { widthCm: number; heightCm: number }
> = {
  "7x10": { widthCm: 7, heightCm: 10 },
  "5x8": { widthCm: 5, heightCm: 8 },
  "4x5": { widthCm: 4, heightCm: 5 },
};

function cmToPt(cm: number): number {
  return cm * PT_PER_CM;
}

function getPrintSizeCm(polaroidSizeId: string) {
  return (
    POLAROID_PRINT_SIZES_CM[polaroidSizeId] ?? POLAROID_PRINT_SIZES_CM["7x10"]
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
  const receivedSecret = req.headers.get("X-Internal-Secret");

  if (!internalSecret || receivedSecret !== internalSecret) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let body: { orderId?: string };

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

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id,position,polaroid_size_id,final_png_path")
    .eq("order_id", body.orderId)
    .order("position");

  if (itemsError || !items || items.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, error: "Itens do pedido nao encontrados" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const pdfDoc = await PDFDocument.create();

    pdfDoc.setTitle("Polaroids - pedido");
    pdfDoc.setCreator("EditPolaroids");

    for (const item of items as Array<{
      id: string;
      position: number;
      polaroid_size_id: string;
      final_png_path: string | null;
    }>) {
      if (!item.final_png_path) {
        throw new Error(`PNG ausente para o item ${item.id}`);
      }

      const { data, error } = await supabase.storage
        .from(FINAL_BUCKET)
        .download(item.final_png_path);

      if (error || !data) {
        throw new Error(
          `Download PNG falhou para o item ${item.id}: ${
            error?.message ?? "sem arquivo"
          }`,
        );
      }

      const { widthCm, heightCm } = getPrintSizeCm(item.polaroid_size_id);
      const widthPt = cmToPt(widthCm);
      const heightPt = cmToPt(heightCm);

      const page = pdfDoc.addPage([widthPt, heightPt]);

      const image = await pdfDoc.embedPng(
        new Uint8Array(await data.arrayBuffer()),
      );

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: widthPt,
        height: heightPt,
      });
    }

    const pdfPath = `${body.orderId}/pedido.pdf`;

    const { error: uploadError } = await supabase.storage
      .from(FINAL_BUCKET)
      .upload(pdfPath, await pdfDoc.save(), {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload PDF falhou: ${uploadError.message}`);
    }

    await supabase
      .from("orders")
      .update({
        final_pdf_path: pdfPath,
        files_ready: true,
      })
      .eq("id", body.orderId);

    return new Response(JSON.stringify({ ok: true, pdfPath }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error("[generate-polaroid-pdf] Erro:", message);

    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});