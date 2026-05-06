import { MercadoPagoConfig, Preference } from "mercadopago";
import type { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";

interface MPPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

function getServerEnv(name: string) {
  const metaEnv = import.meta.env as Record<string, string | undefined>;
  const processEnv =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {};

  return metaEnv[name] ?? processEnv[name];
}

function getMPAccessToken(): string {
  const token = getServerEnv("MP_ACCESS_TOKEN") ?? getServerEnv("MERCADO_PAGO_ACCESS_TOKEN");

  if (!token) {
    console.error("[mercadopago] Access token ausente", {
      hasMPAccessToken: Boolean(getServerEnv("MP_ACCESS_TOKEN")),
      hasMercadoPagoAccessToken: Boolean(getServerEnv("MERCADO_PAGO_ACCESS_TOKEN")),
    });

    throw new Error("MP_ACCESS_TOKEN não configurado no servidor");
  }

  return token;
}

export async function createMPPreference(
  input: PreferenceRequest,
): Promise<MPPreferenceResponse> {
  const client = new MercadoPagoConfig({ accessToken: getMPAccessToken() });
  const preference = new Preference(client);

  try {
    const response = await preference.create({ body: input });

    if (!response.id || !response.init_point || !response.sandbox_init_point) {
      console.error("[mercadopago] Preferência criada com resposta incompleta", {
        hasId: Boolean(response.id),
        hasInitPoint: Boolean(response.init_point),
        hasSandboxInitPoint: Boolean(response.sandbox_init_point),
      });

      throw new Error("Mercado Pago retornou uma preferência incompleta");
    }

    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    };
  } catch (error) {
    console.error("[mercadopago] Erro ao criar preferência", error);
    throw error;
  }
}
