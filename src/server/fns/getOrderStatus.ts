import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase";

const Input = z.object({
  orderId: z.string().uuid(),
});

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, quantity, total_centavos, files_ready")
      .eq("id", data.orderId)
      .single();

    if (error || !order) {
      throw new Error("Pedido não encontrado");
    }

    if (order.status !== "paid") {
      return {
        status: order.status as string,
        quantity: order.quantity as number,
        totalCentavos: order.total_centavos as number,
        filesReady: false,
        items: null,
      };
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("id, position, caption, polaroid_size_id")
      .eq("order_id", data.orderId)
      .order("position");

    if (itemsError) throw new Error("Erro ao buscar itens do pedido");

    return {
      status: order.status as string,
      quantity: order.quantity as number,
      totalCentavos: order.total_centavos as number,
      filesReady: (order.files_ready as boolean) ?? false,
      items: items.map((i) => ({
        id: i.id as string,
        position: i.position as number,
        caption: i.caption as string,
        polaroidSizeId: i.polaroid_size_id as string,
      })),
    };
  });
