import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Polaroid } from "./Polaroid";
import p1 from "../assets/polaroid-1.jpg";
import p2 from "../assets/polaroid-2.jpg";
import p3 from "../assets/polaroid-3.jpg";
import p4 from "../assets/polaroid-4.jpg";

const slides = [
  { src: p1, alt: "Memórias reais em uma polaroid", caption: "memórias reais", rotate: -2 },
  { src: p2, alt: "Preview do editor", caption: "no editor", rotate: 1.5 },
  { src: p3, alt: "Casal em uma moldura polaroid", caption: "amor em papel", rotate: -1 },
  { src: p4, alt: "Pilha de polaroids em álbum retrô", caption: "álbum retrô", rotate: 2 },
];

export function HeroCarousel() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-2">
      <Carousel
        opts={{ loop: true, align: "center" }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {slides.map((s, i) => (
            <CarouselItem
              key={i}
              className="pl-4 basis-[78%] sm:basis-1/2 lg:basis-1/4"
            >
              <div className="py-6">
                <Polaroid
                  src={s.src}
                  alt={s.alt}
                  caption={s.caption}
                  rotate={s.rotate}
                  eager={i < 2}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-2 bg-paper border-border text-ink hover:bg-cream" />
        <CarouselNext className="hidden md:flex -right-2 bg-paper border-border text-ink hover:bg-cream" />
      </Carousel>
    </div>
  );
}
