import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Polaroid } from "./Polaroid";
import p1 from "../assets/polaroid-1.png";
import p2 from "../assets/polaroid-2.png";
import p3 from "../assets/polaroid-3.png";
import p4 from "../assets/polaroid-4.png";
import p5 from "../assets/polaroid-5.png";
import p6 from "../assets/polaroid-6.png";

const slides = [
  { src: p1, alt: "Polaroid memory 1" },
  { src: p2, alt: "Polaroid memory 2" },
  { src: p3, alt: "Polaroid memory 3" },
  { src: p4, alt: "Polaroid memory 4" },
  { src: p5, alt: "Polaroid memory 5" },
  { src: p6, alt: "Polaroid memory 6" },
];

export function HeroCarousel() {
  return (
    <div className="relative mx-auto w-full max-w-6xl px-2">
      <Carousel
        opts={{ loop: true, align: "start", slidesToScroll: 1, duration: 35 }}
        className="w-full pb-4"
      >
        <CarouselContent className="-ml-3">
          {slides.map((s, i) => (
            <CarouselItem key={i} className="pl-3 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <div className="py-3">
                <Polaroid
                  src={s.src}
                  alt={s.alt}
                  className="max-w-[248px] !rounded-xl !bg-black !p-1.5 border border-white/10 overflow-hidden after:content-none"
                  imageWrapperClassName="aspect-[4/5] rounded-[10px] bg-black"
                  imageClassName="object-contain scale-140 hover:scale-[1.50]"
                  eager={i < 2}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="!left-1/2 !top-full !-translate-x-[120%] !translate-y-0 bg-paper border-border text-ink transition-all duration-300 hover:bg-cream active:scale-95" />
        <CarouselNext className="!left-1/2 !top-full !translate-x-[20%] !translate-y-0 bg-paper border-border text-ink transition-all duration-300 hover:bg-cream active:scale-95" />
      </Carousel>
    </div>
  );
}
