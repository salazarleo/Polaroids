import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase";
import { createMPPreference } from "../mercadopago";
import { getFirstServerEnv } from "../env";
import { calcularPrecoPolaroidsCentavos } from "../../utils/pricing";

const CheckoutItemSchema = z.object({
  photoUrl: z.string().url(),
  caption: z.string().max(60).default(""),
  templateId: z.string().min(1),
  fontStyleId: z.string().nullable(),
  fontWeightId: z.string().min(1),
  polaroidSizeId: z.string().min(1),
  size: z.enum(["sm", "md", "lg"]),
  align: z.enum(["default", "left", "center", "right"]),
  imagePosX: z.number().min(0).max(100),
  imagePosY: z.number().min(0).max(100),
});

const Input = z.object({
  items: z.array(CheckoutItemSchema).min(1).max(20),
  customerEmail: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
});

function getSiteUrl() {
  const configuredUrl = getFirstServerEnv(
    "SITE_URL",
    "VITE_SITE_URL",
    "VERCEL_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  );
  const siteUrl = configuredUrl || "http://localhost:8080";
  const withProtocol = /^https?:\/\//.test(siteUrl)
    ? siteUrl
    : `https://${siteUrl}`;

  return withProtocol.replace(/\/$/, "");
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const quantity = data.items.length;
    const totalCentavos = calcularPrecoPolaroidsCentavos(quantity);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        quantity,
        total_centavos: totalCentavos,
        customer_email: data.customerEmail,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[create-checkout] Erro ao criar pedido", orderError);
      throw new Error("Não foi possível criar o pedido");
    }

    const orderItems = data.items.map((item, i) => ({
      order_id: order.id,
      position: i,
      photo_url: item.photoUrl,
      caption: item.caption,
      template_id: item.templateId,
      font_style_id: item.fontStyleId,
      font_weight_id: item.fontWeightId,
      polaroid_size_id: item.polaroidSizeId,
      size: item.size,
      align: item.align,
      image_pos_x: item.imagePosX,
      image_pos_y: item.imagePosY,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error(
        "[create-checkout] Erro ao salvar itens, revertendo pedido",
        itemsError,
      );
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error("Não foi possível salvar os itens do pedido");
    }

    const siteUrl = getSiteUrl();
    const isLocalhost = /localhost|127\.0\.0\.1/.test(siteUrl);

    // URL da Edge Function no Supabase (sempre pública)
    const supabaseUrl = getFirstServerEnv(
      "SUPABASE_URL",
      "VITE_SUPABASE_URL",
    )?.replace(/\/$/, "");

    if (!supabaseUrl) {
      throw new Error("URL do Supabase ausente no servidor");
    }

    const notificationUrl = `${supabaseUrl}/functions/v1/mp-webhook`;

    let preference: Awaited<ReturnType<typeof createMPPreference>>;
    try {
      preference = await createMPPreference({
        items: [
          {
            id: "polaroids-digitais",
            title: `${quantity} Polaroid${quantity > 1 ? "s" : ""} personalizada${quantity > 1 ? "s" : ""}`,
            description: `Pedido de ${quantity} Polaroid${quantity > 1 ? "s" : ""} digitais em alta qualidade`,
            quantity: 1,
            unit_price: totalCentavos / 100,
            currency_id: "BRL",
          },
        ],
        external_reference: order.id,
        back_urls: {
          success: `${siteUrl}/pedido/${order.id}?mp_return=success`,
          failure: `${siteUrl}/pedido/${order.id}?mp_return=failure`,
          pending: `${siteUrl}/pedido/${order.id}?mp_return=pending`,
        },
        notification_url: notificationUrl,
        // auto_return requer URL pública — desabilitado em localhost
        ...(isLocalhost ? {} : { auto_return: "approved" as const }),
      });
    } catch (mpError) {
      console.error(
        "[create-checkout] Erro ao criar preferência MP, revertendo",
        mpError,
      );
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error("Não foi possível iniciar o pagamento. Tente novamente.");
    }

    const orderUrl = `${siteUrl}/pedido/${order.id}`;

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        mp_preference_id: preference.id,
        order_url: orderUrl,
      })
      .eq("id", order.id);

    if (orderUpdateError) {
      console.error("[create-checkout] Erro ao atualizar pedido", orderUpdateError);
      throw new Error("Não foi possível atualizar o pedido");
    }

    const isSandbox =
      getFirstServerEnv("MP_SANDBOX", "VITE_MP_SANDBOX") === "true";

    const checkoutUrl = isSandbox
      ? preference.sandbox_init_point
      : preference.init_point;

    if (!checkoutUrl) {
      throw new Error("URL de checkout do Mercado Pago não retornada");
    }

    return {
      orderId: order.id as string,
      preferenceId: preference.id,
      totalCentavos,
      checkoutUrl,
      orderUrl,
    };
  });
