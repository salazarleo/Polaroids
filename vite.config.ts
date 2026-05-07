// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// cloudflare is disabled here (cloudflare: false) so the build targets Node.js/Vercel instead.
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const baseConfig = defineConfig({ cloudflare: false });

export default async (envArg: {
  mode: string;
  command: string;
  isSsrBuild?: boolean;
  isPreview?: boolean;
}) => {
  const env = loadEnv(envArg.mode, process.cwd(), "");

  if (env.VITE_SUPABASE_URL) {
    process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL;
  }

  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (env.MP_ACCESS_TOKEN) {
    process.env.MP_ACCESS_TOKEN = env.MP_ACCESS_TOKEN;
  }

  if (env.MERCADO_PAGO_ACCESS_TOKEN) {
    process.env.MERCADO_PAGO_ACCESS_TOKEN = env.MERCADO_PAGO_ACCESS_TOKEN;
  }

  return baseConfig(envArg);
};
