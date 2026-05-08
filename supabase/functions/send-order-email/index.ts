import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SupabaseAny = any;

interface OrderForEmail {
  id: string;
  status: string;
  files_ready: boolean | null;
  customer_email: string | null;
  order_url: string | null;
  email_sent_at: string | null;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function saveEmailError(
  supabase: SupabaseAny,
  orderId: string,
  message: string,
) {
  await supabase
    .from("orders")
    .update({ email_error: message.slice(0, 2000) })
    .eq("id", orderId);
}

async function sendResendEmail(order: OrderForEmail) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY ausente");
  }

  if (!RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL ausente");
  }

  const orderUrl = order.order_url!;
  const safeOrderUrl = escapeHtml(orderUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [order.customer_email],
      subject: "Suas Polaroids estão prontas 🎉",
      text: `Seu pagamento foi confirmado e suas Polaroids estão prontas.\n\nAcesse seu pedido: ${orderUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #231f20; line-height: 1.5;">
          <p>Seu pagamento foi confirmado e suas Polaroids estão prontas.</p>
          <p>
            <a href="${safeOrderUrl}" style="display: inline-block; background: #231f20; color: #ffffff; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700;">
              Acessar minhas Polaroids
            </a>
          </p>
          <p style="font-size: 14px; color: #6f665d;">
            Se o botão não abrir, acesse este link:<br />
            <a href="${safeOrderUrl}" style="color: #231f20;">${safeOrderUrl}</a>
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    throw new Error(
      `Resend retornou ${response.status}: ${responseBody || response.statusText}`,
    );
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method Not Allowed" }, 405);
  }

  const receivedSecret = req.headers.get("X-Internal-Secret");

  if (!INTERNAL_FUNCTION_SECRET || receivedSecret !== INTERNAL_FUNCTION_SECRET) {
    return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
  }

  let body: { orderId?: unknown };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "Body invalido" }, 400);
  }

  if (typeof body.orderId !== "string" || !UUID_REGEX.test(body.orderId)) {
    return jsonResponse({ ok: false, error: "orderId invalido" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const orderId = body.orderId;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,status,files_ready,customer_email,order_url,email_sent_at",
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return jsonResponse({ ok: false, error: "Pedido nao encontrado" }, 404);
  }

  const typedOrder = order as OrderForEmail;

  if (typedOrder.email_sent_at) {
    return jsonResponse({ ok: true, alreadySent: true });
  }

  if (typedOrder.status !== "paid") {
    return jsonResponse({ ok: false, error: "Pedido nao esta pago" }, 409);
  }

  if (typedOrder.files_ready !== true) {
    return jsonResponse({ ok: false, error: "Arquivos ainda nao estao prontos" }, 409);
  }

  if (!typedOrder.customer_email) {
    const message = "Pedido sem customer_email";
    await saveEmailError(supabase, orderId, message);
    return jsonResponse({ ok: false, error: message }, 400);
  }

  if (!typedOrder.order_url) {
    const message = "Pedido sem order_url";
    await saveEmailError(supabase, orderId, message);
    return jsonResponse({ ok: false, error: message }, 400);
  }

  try {
    await sendResendEmail(typedOrder);
  } catch (error) {
    const message = getErrorMessage(error);

    console.error("[send-order-email] Erro ao enviar e-mail", {
      orderId,
      error: message,
    });

    await saveEmailError(supabase, orderId, message);
    return jsonResponse({ ok: false, error: message }, 500);
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      email_sent_at: new Date().toISOString(),
      email_error: null,
    })
    .eq("id", orderId);

  if (updateError) {
    const message = `E-mail enviado, mas falha ao atualizar pedido: ${updateError.message}`;
    console.error("[send-order-email] Erro ao atualizar pedido", {
      orderId,
      error: message,
    });
    return jsonResponse({ ok: false, error: message }, 500);
  }

  return jsonResponse({ ok: true, alreadySent: false });
});
