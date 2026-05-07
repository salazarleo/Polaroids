import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Check, Sparkles } from "lucide-react";
import { HeroCarousel } from "../components/HeroCarousel";

export const Route = createFileRoute("/")({
  component: Index,
});

const steps = [
  { n: "01", title: "Faça upload", text: "Suas fotos do celular ou computador, sem complicação." },
  { n: "02", title: "Personalize do seu jeito", text: "Escolha o tamanho, a fonte, a posição da foto e a frase da sua Polaroid." },
  { n: "03", title: "Baixe em alta", text: "PDF e PNG prontos para imprimir." },
];

const benefits = [
  "1 Polaroid por apenas R$ 0,99",
  "Leve 5 por R$ 4,50",
  "Download em alta qualidade",
  "PDF pronto para impressão",
  "PNG em alta qualidade",
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
    <div className="min-h-screen overflow-x-hidden sm:overflow-x-visible">


      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-12 text-center sm:px-6 sm:pt-5 sm:pb-16">
        <div className="landing-fade-up landing-delay-1 mx-auto inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border border-sepia bg-paper px-3 py-1.5 text-sepia sm:px-3.5">
          <Sparkles className="h-3.5 w-3.5 text-sepia" strokeWidth={1.8} />
          <span className="min-w-0 text-center text-xs font-semibold tracking-tight text-sepia sm:text-sm">
           Mais de 1,2 mil pessoas já criaram suas Polaroids
          </span>
        </div>
        <h1 className="landing-fade-up landing-delay-2 mx-auto mt-3 max-w-[360px] font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:max-w-3xl sm:text-5xl md:text-6xl">
          Transforme fotos em{" "}
          <em className="italic text-sepia">Polaroids</em> personalizadas
        </h1>
        <p className="landing-fade-up landing-delay-3 mx-auto mt-6 max-w-[340px] text-base leading-relaxed text-muted-foreground sm:max-w-xl sm:text-lg">
Adicione frases especiais, escolha seu estilo e baixe tudo em alta qualidade para imprimir.
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

        <div className="landing-fade-up landing-delay-5 mt-6 sm:mt-3">
          <HeroCarousel />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="landing-section border-t border-border/60 bg-paper/40">
        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6 sm:py-28">
          <div className="text-center">
            <h2 className="font-display text-2xl font-medium sm:text-4xl">Como funciona</h2>
            <p className="mt-1 font-script text-xl text-sepia sm:mt-3 sm:text-2xl">Três passos. Nada mais.</p>
          </div>

          <div className="mt-5 grid gap-3 sm:mt-16 sm:gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <div key={s.n} className="landing-lift leather-card p-4 text-center sm:p-8">
                <span className="font-display text-3xl italic text-sepia/70 sm:text-5xl">{s.n}</span>
                <h3 className="mt-1.5 font-display text-base font-medium sm:mt-4 sm:text-xl">{s.title}</h3>
                <p className="mx-auto mt-1 max-w-[270px] text-xs leading-snug text-muted-foreground sm:mt-3 sm:max-w-none sm:text-sm sm:leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECO */}
      <section id="preco" className="landing-section border-y border-border/60 bg-paper/40 text-ink">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-28">
          <div className="landing-lift leather-card mx-auto w-full max-w-[360px] rounded-2xl p-5 sm:p-6">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full border border-sepia/40 bg-paper px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-sepia">
                Acesso Antecipado
              </span>
              <h2
                className="mt-3 text-xl font-bold text-ink sm:text-2xl"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Polaroids a partir de
              </h2>
              <div className="mt-3">
                <span
                  className="text-5xl font-bold text-ink"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  R$ 0,99
                </span>
              </div>

            </div>

            <ul className="mt-6 grid gap-2 rounded-xl border border-border/80 bg-paper/55 p-4 sm:p-5">
              {benefits.map((b) => (
                <li key={b} className="landing-benefit flex items-start gap-2.5 px-1 py-0.5 text-ink/90">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sepia/15 text-sepia">
                    <Check className="h-2.5 w-2.5 text-sepia" strokeWidth={2.5} />
                  </span>
                  <span className="text-xs sm:text-sm">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-center">
              <Button
                size="lg"
                className="landing-cta h-11 w-full cursor-pointer rounded-xl border border-transparent bg-black px-6 text-sm font-medium text-white shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-polaroid active:scale-[0.97] sm:text-base"
                asChild
              >
                <Link to="/criar">Criar minhas Polaroids agora</Link>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
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
