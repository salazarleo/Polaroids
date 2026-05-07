import { createClient } from "@supabase/supabase-js";
import { getFirstServerEnv, getServerEnv } from "./env";

export function getSupabaseAdmin() {
  const url = getFirstServerEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    console.error("[upload-polaroid] Credenciais do Supabase ausentes", {
      hasUrl: Boolean(url),
      hasServiceKey: Boolean(serviceKey),
    });

    throw new Error("Credenciais do Supabase ausentes no servidor");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
