import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;
const MP_WEBHOOK_SECRET = Deno.env.get("MP_WEBHOOK_SECRET");
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");

const ORDER_ITEM_SELECT =
  "id,position,caption,template_id,font_style_id,font_weight_id,polaroid_size_id,size,align,image_pos_x,image_pos_y";

interface MPPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
}

interface OrderItemForWebhook {
  id: string;
  position: number;
  caption: string | null;
  template_id: string | null;
  font_style_id: string | null;
  font_weight_id: string | null;
  polaroid_size_id: string;
  size: string;
  align: string;
  image_pos_x: number | null;
  image_pos_y: number | null;
}

function getOrderItemLog(orderId: string, item: OrderItemForWebhook) {
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

async function verifySignature(req: Request, dataId: string): Promise<boolean> {
  if (!MP_WEBHOOK_SECRET) {
    console.warn("[mp-webhook] MP_WEBHOOK_SECRET ausente - validacao pulada");
    return true;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    console.error("[mp-webhook] Headers x-signature ou x-request-id ausentes");
    return false;
  }

  const parts: Record<string, string> = {};

  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key && value) parts[key.trim()] = value.trim();
  }

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) return false;

  const message = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(MP_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const computed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  const computedHex = Array.from(new Uint8Array(computed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (computedHex !== v1) {
    console.error("[mp-webhook] Assinatura nao confere");
    return false;
  }

  return true;
}

async function fetchPayment(paymentId: string): Promise<MPPayment> {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`MP /v1/payments/${paymentId} retornou ${response.status}`);
  }

  return response.json() as Promise<MPPayment>;
}

async function callGenerationFunction(
  functionName: string,
  orderId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!INTERNAL_FUNCTION_SECRET) {
    throw new Error("INTERNAL_FUNCTION_SECRET ausente no mp-webhook");
  }

  const response = await fetch(
    `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "X-Internal-Secret": INTERNAL_FUNCTION_SECRET,
      },
      body: JSON.stringify({ orderId, ...payload }),
    },
  );

  const body = (await response
    .json()
    .catch(() => ({ ok: false, error: response.statusText }))) as {
    ok: boolean;
    error?: string;
  };

  if (!response.ok && !body.ok) {
    throw new Error(
      body.error ?? `${functionName} retornou ${response.status}`,
    );
  }
}

async function generateOrderFiles(orderId: string): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(ORDER_ITEM_SELECT)
    .eq("order_id", orderId)
    .order("position");

  if (itemsError || !items || items.length === 0) {
    console.error("[generate] Itens nao encontrados para o pedido", {
      orderId,
      itemsError,
    });
    return;
  }

  const orderItems = items as OrderItemForWebhook[];

  console.log("[generate] Dados lidos de order_items", {
    orderId,
    count: orderItems.length,
    items: orderItems.map((item) => getOrderItemLog(orderId, item)),
  });

  for (const item of orderItems) {
    console.log("[generate] Solicitando PNG", getOrderItemLog(orderId, item));

    await callGenerationFunction("generate-polaroid-png", orderId, {
      position: item.position,
    });
  }

  await callGenerationFunction("generate-polaroid-pdf", orderId, {});

  console.log("[generate] Arquivos finais solicitados com sucesso", {
    orderId,
  });
}

function runInBackground(task: Promise<unknown>) {
  const runtime = globalThis as {
    EdgeRuntime?: { waitUntil: (promise: Promise<unknown>) => void };
  };

  if (runtime.EdgeRuntime?.waitUntil) {
    runtime.EdgeRuntime.waitUntil(task);
    return;
  }

  task.catch((error) =>
    console.error("[mp-webhook] Background task falhou:", error),
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let rawBody: string;

  try {
    rawBody = await req.text();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  let body: { action?: string; type?: string; data?: { id: string } };

  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const isPaymentEvent =
    body.type === "payment" ||
    body.action === "payment.created" ||
    body.action === "payment.updated";

  if (!isPaymentEvent) {
    return new Response("OK", { status: 200 });
  }

  const paymentId = body.data?.id;

  if (!paymentId) {
    return new Response("OK", { status: 200 });
  }

  const valid = await verifySignature(req, paymentId);

  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payment: MPPayment;

  try {
    payment = await fetchPayment(paymentId);
  } catch (error) {
    console.error("[mp-webhook] Erro ao buscar pagamento", error);
    return new Response("Internal Server Error", { status: 500 });
  }

  if (payment.status !== "approved") {
    console.log(
      `[mp-webhook] Pagamento ${paymentId} com status '${payment.status}' - ignorando`,
    );

    return new Response("OK", { status: 200 });
  }

  const orderId = payment.external_reference;

  if (!orderId) {
    console.error("[mp-webhook] external_reference ausente", paymentId);
    return new Response("OK", { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, files_ready")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    console.error("[mp-webhook] Pedido nao encontrado", {
      orderId,
      fetchError,
    });

    return new Response("Not Found", { status: 404 });
  }

  if (order.status === "paid") {
    console.log(
      `[mp-webhook] Pedido ${orderId} ja esta pago - duplicata ignorada`,
    );

    if (!order.files_ready) {
      runInBackground(
        generateOrderFiles(orderId).catch((error) =>
          console.error("[mp-webhook] Erro na geracao de arquivos:", error),
        ),
      );
    }

    return new Response("OK", { status: 200 });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      mp_payment_id: String(payment.id),
    })
    .eq("id", orderId)
    .eq("status", "pending");

  if (updateError) {
    console.error("[mp-webhook] Erro ao atualizar pedido", updateError);
    return new Response("Internal Server Error", { status: 500 });
  }

  console.log(
    `[mp-webhook] Pedido ${orderId} marcado como pago (payment ${paymentId})`,
  );

  runInBackground(
    generateOrderFiles(orderId).catch((error) =>
      console.error("[mp-webhook] Erro na geracao de arquivos:", error),
    ),
  );

  return new Response("OK", { status: 200 });
});