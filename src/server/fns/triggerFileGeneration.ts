import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase";
import { getFirstServerEnv, getServerEnv } from "../env";

const Input = z.object({
  orderId: z.string().uuid(),
});

export const triggerFileGeneration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const supabaseUrl = (
      getFirstServerEnv("SUPABASE_URL", "VITE_SUPABASE_URL") ?? ""
    ).replace(/\/$/, "");

    const serviceKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");
    const internalSecret = getServerEnv("INTERNAL_FUNCTION_SECRET");

    if (!supabaseUrl || !serviceKey || !internalSecret) {
      throw new Error("Credenciais do servidor ausentes");
    }

    async function callFunction(
      functionName: string,
      payload: Record<string, unknown>,
    ) {
      const url = `${supabaseUrl}/functions/v1/${functionName}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          "X-Internal-Secret": internalSecret,
        },
        body: JSON.stringify({ orderId: data.orderId, ...payload }),
      });

      const body = (await res
        .json()
        .catch(() => ({ ok: false, error: res.statusText }))) as {
        ok: boolean;
        error?: string;
        alreadyReady?: boolean;
      };

      if (!res.ok && !body.ok) {
        throw new Error(
          body.error ?? `Erro ${res.status} na geracao de arquivos`,
        );
      }

      return body;
    }

    const supabase = getSupabaseAdmin();

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("position")
      .eq("order_id", data.orderId)
      .order("position");

    if (itemsError || !items || items.length === 0) {
      throw new Error("Itens do pedido nao encontrados");
    }

    for (const item of items as Array<{ position: number }>) {
      await callFunction("generate-polaroid-png", {
        position: item.position,
      });
    }

    const body = await callFunction("generate-polaroid-pdf", {});

    return {
      ok: body.ok,
      alreadyReady: body.alreadyReady ?? false,
    };
  });