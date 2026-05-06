import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase";

const BUCKET = "user-uploads";

const Input = z.object({
  fileName: z.string().min(1).max(260),
  contentType: z.string().regex(/^image\//),
});

export const getUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();

    const ext = data.fileName.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { data: signed, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error) {
      console.error("[upload-polaroid] Supabase Storage retornou erro", {
        bucket: BUCKET,
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
      });
    }

    if (!signed) {
      console.error("[upload-polaroid] Supabase Storage não retornou dados da URL assinada", {
        bucket: BUCKET,
      });
    }

    if (error || !signed) {
      throw new Error("Não foi possível gerar a URL de upload");
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return {
      signedUrl: signed.signedUrl,
      token: signed.token,
      path,
      publicUrl: publicData.publicUrl,
    };
  });
