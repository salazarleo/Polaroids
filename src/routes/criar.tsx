import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Camera, Upload, X, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import t1 from "../assets/template-1.png";
import t2 from "../assets/template-2.png";
import t3 from "../assets/template-3.png";
import t4 from "../assets/template-4.png";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Crie suas Polaroids — Polaroids" },
      {
        name: "description",
        content:
          "Envie suas fotos, escolha um modelo retrô e personalize a frase. Monte suas Polaroids antes de finalizar.",
      },
      { property: "og:title", content: "Crie suas Polaroids — Polaroids" },
      {
        property: "og:description",
        content:
          "Editor simples e elegante para criar Polaroids personalizadas com frases e modelos prontos.",
      },
    ],
  }),
  component: CriarPage,
});

type TemplateId = "amor" | "viagem" | "familia" | "carta" | "minimalista" | "album";
type Size = "sm" | "md" | "lg";
type Align = "left" | "center" | "right";

interface TemplateDef {
  id: TemplateId;
  name: string;
  thumb: string;
  fontClass: string;
  defaultSize: Size;
  defaultAlign: Align;
  toneClass: string;
}

const CAPTION_FONT_CLASS = "font-script";
const CAPTION_DEFAULT_SIZE: Size = "md";

const templates: TemplateDef[] = [
  { id: "amor", name: "Amor antigo", thumb: t1, fontClass: CAPTION_FONT_CLASS, defaultSize: CAPTION_DEFAULT_SIZE, defaultAlign: "center", toneClass: "" },
  { id: "viagem", name: "Viagem de verão", thumb: t2, fontClass: CAPTION_FONT_CLASS, defaultSize: CAPTION_DEFAULT_SIZE, defaultAlign: "left", toneClass: "" },
  { id: "familia", name: "Família", thumb: t3, fontClass: CAPTION_FONT_CLASS, defaultSize: CAPTION_DEFAULT_SIZE, defaultAlign: "center", toneClass: "" },
  { id: "carta", name: "Carta curta", thumb: t4, fontClass: CAPTION_FONT_CLASS, defaultSize: CAPTION_DEFAULT_SIZE, defaultAlign: "left", toneClass: "" },
  { id: "minimalista", name: "Minimalista", thumb: t2, fontClass: CAPTION_FONT_CLASS, defaultSize: CAPTION_DEFAULT_SIZE, defaultAlign: "center", toneClass: "" },
  { id: "album", name: "Álbum retrô", thumb: t1, fontClass: CAPTION_FONT_CLASS, defaultSize: CAPTION_DEFAULT_SIZE, defaultAlign: "center", toneClass: "sepia-[0.15]" },
];

interface PolaroidItem {
  id: string;
  photo: string | null;
  caption: string;
  templateId: TemplateId;
  size: Size;
  align: Align;
}

const sizeClass: Record<Size, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function newDraft(templateId: TemplateId = "amor"): PolaroidItem {
  const t = templates.find((x) => x.id === templateId)!;
  return {
    id: crypto.randomUUID(),
    photo: null,
    caption: "",
    templateId,
    size: t.defaultSize,
    align: t.defaultAlign,
  };
}

function CriarPage() {
  const [draft, setDraft] = useState<PolaroidItem>(() => newDraft());
  const [saved, setSaved] = useState<PolaroidItem[]>([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const perPage = 4;
  const totalPages = Math.ceil(templates.length / perPage);
  const visibleTemplates = templates.slice(page * perPage, page * perPage + perPage);

  const tpl = templates.find((t) => t.id === draft.templateId)!;

  function pickFile() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => ({ ...d, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function selectTemplate(id: TemplateId) {
    const t = templates.find((x) => x.id === id)!;
    setDraft((d) => ({ ...d, templateId: id, size: d.size ?? t.defaultSize, align: d.align ?? t.defaultAlign }));
  }

  function concluir() {
    if (!draft.photo) return;
    setSaved((s) => {
      const idx = s.findIndex((x) => x.id === draft.id);
      if (idx >= 0) {
        const next = [...s];
        next[idx] = draft;
        return next;
      }
      return [...s, draft];
    });
    setDraft(newDraft(draft.templateId));
  }

  function adicionarOutra() {
    if (draft.photo) concluir();
    else setDraft(newDraft(draft.templateId));
  }

  function editarSalva(item: PolaroidItem) {
    setDraft({ ...item });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removerSalva(id: string) {
    setSaved((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen">

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid items-stretch gap-8 lg:grid-cols-[300px_1fr_300px]">
          {/* ESQUERDA - MODELOS */}
          <aside className="order-2 lg:order-1 lg:h-full">
            <div className="leather-card flex h-full flex-col p-5">
              <h2 className="font-display text-xl font-medium">Modelos prontos</h2>
              <p className="mt-1 font-script text-lg text-sepia">Escolha um estilo</p>

              <div className="mt-5 flex-1">
                <div className="grid min-h-[340px] grid-cols-2 content-start gap-3">
                  {visibleTemplates.map((t) => {
                    const active = t.id === draft.templateId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => selectTemplate(t.id)}
                        className={cn(
                          "group rounded-lg border bg-paper p-2 text-left shadow-soft transition-all",
                          active
                            ? "border-ink ring-2 ring-ink/80"
                            : "border-border hover:border-ink/40 hover:shadow-md",
                        )}
                      >
                        <div className="polaroid !p-1.5 !pb-4">
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img
                              src={t.thumb}
                              alt={t.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                        <p className="mt-2 px-1 text-center text-xs font-medium text-ink">
                          {t.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
                <button
                  onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper text-ink shadow-soft transition-colors hover:bg-cream"
                  aria-label="Modelos anteriores"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-script text-base text-sepia">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => (p + 1) % totalPages)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper text-ink shadow-soft transition-colors hover:bg-cream"
                  aria-label="Próximos modelos"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* CENTRO - PREVIEW */}
          <section className="order-1 lg:order-2 lg:h-full">
            <div className="leather-card flex h-full flex-col items-center justify-center p-5">
              <div className="flex w-full max-w-sm flex-col">
                <div className="polaroid mx-auto">
                  {draft.photo ? (
                    <div className={cn("aspect-square overflow-hidden bg-muted", tpl.toneClass)}>
                      <img
                        src={draft.photo}
                        alt="Sua foto"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={pickFile}
                      className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <Upload className="h-7 w-7" strokeWidth={1.5} />
                      <span className="font-display text-lg">Adicionar foto</span>
                      <span className="text-xs">JPG ou PNG</span>
                    </button>
                  )}

                  <p
                    className={cn(
                      "mt-4 px-2 text-ink/85 leading-tight",
                      tpl.fontClass,
                      sizeClass[draft.size],
                      alignClass[draft.align],
                    )}
                  >
                    {draft.caption || (
                      <span className="text-muted-foreground/60">sua frase aqui</span>
                    )}
                  </p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />

                {draft.photo && (
                  <div className="mt-5 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pickFile}
                      className="rounded-full border-border bg-paper text-ink hover:bg-cream"
                    >
                      Trocar foto
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDraft((d) => ({ ...d, photo: null }))}
                      className="rounded-full text-muted-foreground hover:bg-muted hover:text-ink"
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* DIREITA - PERSONALIZAR */}
          <aside className="order-3 lg:h-full">
            <div className="leather-card flex h-full flex-col p-5">
              <h2 className="font-display text-xl font-medium">Personalizar</h2>
              <p className="mt-1 font-script text-lg text-sepia">Detalhes da sua Polaroid</p>

              <div className="mt-5 space-y-5">
                <div>
                  <Label htmlFor="frase" className="text-sm font-medium text-ink">
                    Frase da Polaroid
                  </Label>
                  <Input
                    id="frase"
                    value={draft.caption}
                    onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))}
                    placeholder="Escreva uma frase especial"
                    maxLength={60}
                    className="mt-1.5 rounded-lg border-border bg-paper"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {draft.caption.length}/60
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-ink">Tamanho do texto</Label>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {(["sm", "md", "lg"] as Size[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setDraft((d) => ({ ...d, size: s }))}
                        className={cn(
                          "rounded-md border px-2 py-2 text-xs transition-colors",
                          draft.size === s
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-paper text-ink hover:bg-cream",
                        )}
                      >
                        {s === "sm" ? "Pequeno" : s === "md" ? "Médio" : "Grande"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-ink">Alinhamento</Label>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {(["left", "center", "right"] as Align[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setDraft((d) => ({ ...d, align: a }))}
                        className={cn(
                          "rounded-md border px-2 py-2 text-xs transition-colors",
                          draft.align === a
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-paper text-ink hover:bg-cream",
                        )}
                      >
                        {a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-2.5">
                <Button
                  onClick={concluir}
                  disabled={!draft.photo}
                  className="h-11 w-full rounded-full bg-ink text-sm font-medium text-paper hover:bg-ink/90"
                >
                  Concluir Polaroid
                </Button>
                <Button
                  onClick={adicionarOutra}
                  variant="outline"
                  className="h-11 w-full rounded-full border-border bg-paper text-sm font-medium text-ink hover:bg-cream"
                >
                  Adicionar outra imagem
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* MINHAS POLAROIDS */}
        <section className="mt-14 border-t border-border/60 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-medium">Minhas Polaroids</h2>
              <p className="mt-1 font-script text-lg text-sepia">
                {saved.length > 0
                  ? `${saved.length} ${saved.length === 1 ? "memória" : "memórias"} no álbum`
                  : "Seu álbum começa aqui"}
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              disabled={saved.length === 0}
              className="h-11 rounded-full bg-ink px-6 text-sm font-medium text-paper hover:bg-ink/90"
            >
              Salvar e finalizar
            </Button>
          </div>

          {saved.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-paper/50 p-10 text-center">
              <p className="text-muted-foreground">Nenhuma Polaroid criada ainda.</p>
            </div>
          ) : (
            <div className="mt-6 flex gap-5 overflow-x-auto pb-4">
              {saved.map((item) => {
                const it = templates.find((t) => t.id === item.templateId)!;
                return (
                  <div key={item.id} className="group relative shrink-0 w-[170px]">
                    <div className="polaroid">
                      <div className="aspect-square overflow-hidden bg-muted">
                        {item.photo && (
                          <img src={item.photo} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-2 px-1 leading-tight text-ink/85",
                          it.fontClass,
                          item.size === "sm" ? "text-xs" : item.size === "md" ? "text-sm" : "text-base",
                          alignClass[item.align],
                        )}
                      >
                        {item.caption || " "}
                      </p>
                    </div>
                    <div className="absolute inset-x-0 -bottom-2 flex justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => editarSalva(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper shadow-soft hover:bg-ink/90"
                        aria-label="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removerSalva(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink shadow-soft hover:bg-cream"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL FINALIZAÇÃO */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl border-border bg-paper sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="font-display text-2xl font-medium text-ink">
              Suas Polaroids estão prontas
            </DialogTitle>
            <DialogDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
              Revise suas imagens e libere o download em alta qualidade após o pagamento.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 flex flex-wrap justify-center gap-3">
            {saved.slice(0, 6).map((item) => (
              <div key={item.id} className="polaroid !p-1.5 !pb-3 w-20">
                <div className="aspect-square overflow-hidden bg-muted">
                  {item.photo && <img src={item.photo} alt="" className="h-full w-full object-cover" />}
                </div>
              </div>
            ))}
            {saved.length === 0 && draft.photo && (
              <div className="polaroid !p-1.5 !pb-3 w-20">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={draft.photo} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <Button className="h-12 w-full rounded-full bg-ink text-base font-medium text-paper hover:bg-ink/90">
            Finalizar e liberar download
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Você só paga depois de visualizar.
          </p>

          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-ink"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
