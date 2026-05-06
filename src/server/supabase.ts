import { createClient } from "@supabase/supabase-js";

function getServerEnv(name: string) {
  const metaEnv = import.meta.env as Record<string, string | undefined>;
  const processEnv =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {};

  return metaEnv[name] ?? processEnv[name];
}

export function getSupabaseAdmin() {
  const url = getServerEnv("VITE_SUPABASE_URL");
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
