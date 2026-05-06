import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase";

const Input = z.object({
  orderId: z.string().uuid(),
});

function getServerEnv(name: string): string | undefined {
  const metaEnv = import.meta.env as Record<string, string | undefined>;
  const processEnv =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {};
  return metaEnv[name] ?? processEnv[name];
}

export const triggerFileGeneration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const supabaseUrl = (getServerEnv("VITE_SUPABASE_URL") ?? "").replace(
      /\/$/,
      "",
    );
    const serviceKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
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
      await callFunction("generate-polaroid-png", { position: item.position });
    }

    const body = await callFunction("generate-polaroid-pdf", {});

    return { ok: body.ok, alreadyReady: body.alreadyReady ?? false };
  });
