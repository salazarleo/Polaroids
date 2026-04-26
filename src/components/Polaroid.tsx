import { cn } from "../lib/utils";

interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  rotate?: number;
  className?: string;
  imageWrapperClassName?: string;
  imageClassName?: string;
  captionClassName?: string;
  eager?: boolean;
}

export function Polaroid({
  src,
  alt,
  caption,
  rotate = 0,
  className,
  imageWrapperClassName,
  imageClassName,
  captionClassName,
  eager,
}: PolaroidProps) {
  return (
    <div
      className={cn("polaroid w-full max-w-[280px] mx-auto", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className={cn("aspect-square overflow-hidden bg-muted", imageWrapperClassName)}>
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform",
            imageClassName,
          )}
        />
      </div>
      {caption && (
        <p className={cn("mt-3 text-center font-script text-2xl text-ink/85 leading-none", captionClassName)}>
          {caption}
        </p>
      )}
    </div>
  );
}
