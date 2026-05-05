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
        <CarouselPrevious className="!-left-6 !top-1/2 flex h-8 w-8 shrink-0 !-translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-border bg-paper text-ink shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream hover:shadow-polaroid active:!-translate-y-1/2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:!-translate-y-1/2 disabled:hover:bg-paper disabled:hover:shadow-soft disabled:active:scale-100 sm:!-left-10" />
        <CarouselNext className="!-right-6 !top-1/2 flex h-8 w-8 shrink-0 !-translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-border bg-paper text-ink shadow-soft transition-[background-color,box-shadow,transform,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream hover:shadow-polaroid active:!-translate-y-1/2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:!-translate-y-1/2 disabled:hover:bg-paper disabled:hover:shadow-soft disabled:active:scale-100 sm:!-right-10" />
      </Carousel>
    </div>
  );
}
