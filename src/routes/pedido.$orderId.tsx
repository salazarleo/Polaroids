import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock3, Download, FileText, Loader2, RefreshCw, XCircle } from "lucide-react";
import { z } from "zod";
import { getOrderStatus } from "../server/fns/getOrderStatus";
import { getDownloadUrls } from "../server/fns/getDownloadUrls";
import { triggerFileGeneration } from "../server/fns/triggerFileGeneration";
import type { DownloadUrlItem } from "../server/fns/getDownloadUrls";
import { formatarPrecoCentavos } from "../utils/pricing";

// ─── Rota ─────────────────────────────────────────────────────────────────────

const mpSearchSchema = z.object({
  mp_return: z.enum(["success", "pending", "failure"]).optional(),
  collection_id: z.string().optional(),
  collection_status: z.string().optional(),
  external_reference: z.string().optional(),
  merchant_order_id: z.string().optional(),
  payment_id: z.string().optional(),
  payment_type: z.string().optional(),
  preference_id: z.string().optional(),
  status: z.string().optional(),
});

export const Route = createFileRoute("/pedido/$orderId")({
  validateSearch: mpSearchSchema,
  head: () => ({
    meta: [{ title: "Seu pedido — Polaroids" }],
  }),
  component: PedidoPage,
});

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DBStatus = "pending" | "paid" | "failed" | "expired" | null;
type MPReturn = z.infer<typeof mpSearchSchema>["mp_return"];

function getMPHint(mpReturn: MPReturn): "success" | "pending" | "failed" | null {
  if (mpReturn === "success") return "success";
  if (mpReturn === "pending") return "pending";
  if (mpReturn === "failure") return "failed";
  return null;
}

// ─── Polling ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3_000;
const POLL_MAX_ATTEMPTS = 40; // 2 minutos (aguarda geração dos arquivos)

// ─── Página ───────────────────────────────────────────────────────────────────

function PedidoPage() {
  const { orderId } = Route.useParams();
  const search = Route.useSearch();
  const mpHint = getMPHint(search.mp_return);

  const [dbStatus, setDbStatus] = useState<DBStatus>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [totalCentavos, setTotalCentavos] = useState<number | null>(null);
  const [filesReady, setFilesReady] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  // URLs de download (obtidas uma só vez quando filesReady = true)
  const [pngUrls, setPngUrls] = useState<DownloadUrlItem[] | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingUrls, setLoadingUrls] = useState(false);

  // Geração manual (dev/retry)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlsFetchedRef = useRef(false);

  // Buscar signed URLs ao confirmar que os arquivos estão prontos
  useEffect(() => {
    if (!filesReady || urlsFetchedRef.current) return;
    urlsFetchedRef.current = true;

    setLoadingUrls(true);
    getDownloadUrls({ data: { orderId } })
      .then((result) => {
        setPngUrls(result.pngUrls);
        setPdfUrl(result.pdfUrl);
      })
      .catch((err) => console.error("[pedido] Erro ao buscar download URLs:", err))
      .finally(() => setLoadingUrls(false));
  }, [filesReady, orderId]);

  // Dispara geração manual via Edge Function (dev/retry)
  async function handleTriggerGeneration() {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await triggerFileGeneration({ data: { orderId } });
      // Reinicia polling para capturar files_ready = true
      attemptsRef.current = 0;
      setPollTimedOut(false);
      setRetryKey((k) => k + 1);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsGenerating(false);
    }
  }

  // Polling de status
  useEffect(() => {
    if (mpHint === "failed") return;

    // Resetar estado de timeout a cada nova tentativa (retryKey)
    attemptsRef.current = 0;
    setPollTimedOut(false);

    async function poll() {
      if (attemptsRef.current >= POLL_MAX_ATTEMPTS) {
        setPollTimedOut(true);
        return;
      }
      attemptsRef.current += 1;

      try {
        const result = await getOrderStatus({ data: { orderId } });

        setDbStatus(result.status as DBStatus);
        setQuantity(result.quantity);
        setTotalCentavos(result.totalCentavos);

        if (result.status === "paid") {
          setFilesReady(result.filesReady);
          // Se arquivos ainda não estão prontos, continua polling
          if (!result.filesReady) {
            timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
            return;
          }
          // Arquivos prontos — para o polling
          return;
        }

        if (result.status === "failed" || result.status === "expired") return;

        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId, mpHint, retryKey]);

  // ─── Pago + arquivos prontos ───────────────────────────────────────────────

  if (dbStatus === "paid" && filesReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Cabeçalho */}
          <div className="rounded-2xl border border-border bg-paper p-8 text-center shadow-soft">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="font-display text-2xl font-medium text-ink">Pagamento confirmado!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Suas Polaroids estão prontas para download.
            </p>
            {quantity != null && totalCentavos != null && (
              <div className="mt-4 flex items-center justify-center gap-6 rounded-xl border border-border/70 bg-cream/60 px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  {quantity} {quantity === 1 ? "Polaroid" : "Polaroids"}
                </span>
                <span className="font-semibold text-ink">
                  {formatarPrecoCentavos(totalCentavos)}
                </span>
              </div>
            )}
          </div>

          {/* Botão PDF */}
          {pdfUrl && (
            <div className="mt-4">
              <a
                href={pdfUrl}
                download="polaroids.pdf"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-ink px-5 py-3.5 text-sm font-semibold text-paper shadow-soft transition-all hover:bg-ink/90 active:scale-[0.98]"
              >
                <FileText className="h-4 w-4" />
                Baixar PDF completo (todas as Polaroids)
              </a>
            </div>
          )}

          {/* Lista de PNGs individuais */}
          {loadingUrls ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border bg-paper p-5 text-sm text-muted-foreground shadow-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparando links de download…
            </div>
          ) : pngUrls && pngUrls.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-border bg-paper p-5 shadow-soft">
              <h2 className="font-display text-lg font-medium text-ink">Download individual</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Cada PNG está em alta resolução (300 DPI), pronto para impressão.
              </p>

              <div className="mt-4 space-y-3">
                {pngUrls.map((item) => (
                  <div
                    key={item.position}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-cream/40 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-ink">
                      Polaroid {item.position + 1}
                    </p>
                    <a
                      href={item.signedUrl}
                      download={`polaroid-${item.position + 1}.png`}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-paper px-3 py-2 text-xs font-medium text-ink shadow-soft transition-all hover:bg-cream active:scale-[0.97]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PNG
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Criar mais Polaroids
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pago mas arquivos ainda sendo gerados ────────────────────────────────

  if (dbStatus === "paid" && !filesReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-paper p-8 text-center shadow-soft">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>

          <h1 className="font-display text-2xl font-medium text-ink">Pagamento confirmado!</h1>

          {isGenerating ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Gerando seus arquivos em alta resolução…
              </p>
              <div className="mt-5 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </>
          ) : pollTimedOut ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Os arquivos ainda não foram gerados. Clique abaixo para preparar suas Polaroids agora.
              </p>
              {generationError && (
                <p className="mt-2 text-xs text-destructive">{generationError}</p>
              )}
              <button
                type="button"
                onClick={handleTriggerGeneration}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper shadow-soft transition-all hover:bg-ink/90 active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" />
                Preparar arquivos agora
              </button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Estamos montando suas Polaroids em alta resolução…
              </p>

              {generationError ? (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-left">
                  <p className="text-xs font-medium text-destructive">Erro na geração:</p>
                  <p className="mt-0.5 break-all text-xs text-destructive/80">{generationError}</p>
                  <button
                    type="button"
                    onClick={handleTriggerGeneration}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-destructive underline-offset-4 hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-5 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerGeneration}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Forçar geração manual
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Falhou ────────────────────────────────────────────────────────────────

  if (dbStatus === "failed" || dbStatus === "expired" || mpHint === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-paper p-8 text-center shadow-soft">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-7 w-7 text-red-600" />
          </div>

          <h1 className="font-display text-2xl font-medium text-ink">Pagamento não aprovado</h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Não foi possível processar seu pagamento. Você pode tentar novamente.
          </p>

          <OrderRef orderId={orderId} paymentId={search.payment_id} />

          <Link
            to="/criar"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-paper shadow-soft transition-all hover:bg-ink/90 active:scale-[0.98]"
          >
            Tentar novamente
          </Link>
        </div>
      </div>
    );
  }

  // ─── Aguardando / Verificando ──────────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-paper p-8 text-center shadow-soft">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
          <Clock3 className="h-7 w-7 text-yellow-600" />
        </div>

        <h1 className="font-display text-2xl font-medium text-ink">
          {mpHint === "pending" ? "Pagamento em análise" : "Verificando pagamento…"}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {mpHint === "pending"
            ? "Seu pagamento está sendo processado. Assim que for aprovado, seus arquivos serão liberados aqui."
            : pollTimedOut
              ? "Ainda aguardando confirmação. Se você já pagou, recarregue a página em alguns instantes."
              : "Confirmando com o banco…"}
        </p>

        {!pollTimedOut && mpHint !== "pending" && (
          <div className="mt-5 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        <OrderRef orderId={orderId} paymentId={search.payment_id} />

        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-border bg-paper px-6 text-sm font-medium text-ink shadow-soft transition-all hover:bg-cream active:scale-[0.98]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

function OrderRef({ orderId, paymentId }: { orderId: string; paymentId?: string }) {
  return (
    <div className="mt-4 space-y-1.5 rounded-lg bg-cream/70 px-3 py-3 text-left text-xs text-muted-foreground">
      <p className="font-mono">Pedido: {orderId}</p>
      {paymentId && <p className="font-mono">Pagamento MP: {paymentId}</p>}
    </div>
  );
}
