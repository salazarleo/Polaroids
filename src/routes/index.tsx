import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Check, Camera, Sparkles } from "lucide-react";
import { HeroCarousel } from "../components/HeroCarousel";
import { Polaroid } from "../components/Polaroid";
import t1 from "../assets/template-1.png";
import t2 from "../assets/template-2.png";
import t3 from "../assets/template-3.png";
import t4 from "../assets/template-4.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const steps = [
  { n: "01", title: "Faça upload", text: "Suas fotos do celular ou computador, sem complicação." },
  { n: "02", title: "Escolha um modelo", text: "Modelos retrô prontos, com fontes e composições selecionadas." },
  { n: "03", title: "Baixe em alta", text: "PDF e PNG prontos para imprimir." },
];

const templates = [
  { src: t1, name: "Amor antigo", rotate: -2 },
  { src: t2, name: "Viagem de verão", rotate: 1.5 },
  { src: t3, name: "Família", rotate: -1.5 },
  { src: t4, name: "Carta curta", rotate: 2 },
];

const benefits = [
  "1 Polaroid por apenas R$ 0,99",
  "Leve 5 por R$ 4,50",
  "A partir de 5, cada extra continua só R$ 0,99",
  "Você economiza R$ 0,45 no pacote com 5",
  "Download em alta qualidade",
  "PDF pronto para impressão",
  "Sem marca d'água após pagamento",
];

const faqs = [
  {
    q: "Preciso pagar antes de editar?",
    a: "Não. Você pode montar e visualizar suas Polaroids antes. O pagamento é feito apenas no final, para liberar o download em alta qualidade.",
  },
  { q: "Posso editar a frase?", a: "Sim. Você pode escolher uma frase pronta ou escrever a sua própria." },
  { q: "Posso imprimir na gráfica?", a: "Sim. Os arquivos são gerados em alta qualidade para facilitar a impressão." },
  { q: "Posso criar várias Polaroids?", a: "Sim. Você pode montar várias Polaroids antes de concluir." },
];

function Index() {
  return (
    <div className="min-h-screen">


      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-6 pb-16 text-center sm:pt-5">
        <div className="landing-fade-up landing-delay-1 mx-auto inline-flex items-center gap-1.5 rounded-full border border-sepia bg-paper px-3.5 py-1.5 text-sepia">
          <Sparkles className="h-3.5 w-3.5 text-sepia" strokeWidth={1.8} />
          <span className="text-xs font-semibold tracking-tight text-sepia sm:text-sm">
            Mais de 1.2K+ pessoas já criaram suas Polaroids
          </span>
        </div>
        <h1 className="landing-fade-up landing-delay-2 mx-auto mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl md:text-6xl">
          Transforme fotos em{" "}
          <em className="italic text-sepia">Polaroids</em> personalizadas
        </h1>
        <p className="landing-fade-up landing-delay-3 mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
Personalize suas fotos com modelos únicos, frases especiais e arquivos em alta qualidade para imprimir.
        </p>
        <div className="landing-fade-up landing-delay-4 mt-5">
          <Button
            size="lg"
            className="landing-cta h-14 min-w-[300px] cursor-pointer rounded-xl border border-transparent bg-black px-12 text-lg font-semibold text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97]"
            asChild
          >
            <Link to="/criar">Criar minhas Polaroids</Link>
          </Button>
        </div>

        <div className="landing-fade-up landing-delay-5 mt-14 sm:mt-3">
          <HeroCarousel />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="landing-section border-t border-border/60 bg-paper/40">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="text-center">
            <h2 className="font-display text-3xl font-medium sm:text-4xl">Como funciona</h2>
            <p className="mt-3 font-script text-2xl text-sepia">Três passos. Nada mais.</p>
          </div>

          <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <div key={s.n} className="landing-lift leather-card p-8 text-center">
                <span className="font-display text-5xl italic text-sepia/70">{s.n}</span>
                <h3 className="mt-4 font-display text-xl font-medium">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECO */}
      <section id="preco" className="landing-section border-y border-border/60 bg-paper/40 text-ink">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="landing-lift leather-card mx-auto w-full max-w-[420px] rounded-3xl p-6 sm:p-8">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full border border-sepia/40 bg-paper px-3 py-1 text-[11px] font-semibold tracking-wide text-sepia">
                Acesso Antecipado
              </span>
              <h2
                className="mt-4 text-2xl font-bold text-ink sm:text-3xl"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Polaroids a partir de
              </h2>
              <div className="mt-5">
                <span
                  className="text-6xl font-bold text-ink"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  R$ 0,99
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-sepia">Leve 5 por R$ 4,50</p>
              <p className="mt-1 text-xs text-muted-foreground">
                A partir de 5, cada extra continua só R$ 0,99
              </p>
            </div>

            <ul className="mt-8 grid gap-3 rounded-2xl border border-border/80 bg-paper/55 p-6 sm:p-8">
              {benefits.map((b) => (
                <li key={b} className="landing-benefit flex items-start gap-3 px-2 py-1 text-ink/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sepia/15 text-sepia">
                    <Check className="h-3 w-3 text-sepia" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="landing-cta h-12 w-full cursor-pointer rounded-xl border border-transparent bg-black px-8 text-base font-medium text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97]"
                asChild
              >
                <Link to="/criar">Criar minhas Polaroids agora</Link>
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Voce so paga ao final, depois de visualizar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="text-center">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Dúvidas</h2>
          <p className="mt-3 font-script text-2xl text-sepia">Perguntas frequentes</p>
        </div>

        <Accordion type="single" collapsible className="mt-10 w-full">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="landing-faq-item rounded-xl border-b border-border/70 px-3"
            >
              <AccordionTrigger className="cursor-pointer py-5 text-left font-display text-lg font-medium transition-colors duration-200 ease-out hover:text-sepia hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground transition-all duration-300 ease-out">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
