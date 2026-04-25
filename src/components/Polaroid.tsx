import { cn } from "../lib/utils";

interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  rotate?: number;
  className?: string;
  eager?: boolean;
}

export function Polaroid({ src, alt, caption, rotate = 0, className, eager }: PolaroidProps) {
  return (
    <div
      className={cn("polaroid w-full max-w-[280px] mx-auto", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
      </div>
      {caption && (
        <p className="mt-3 text-center font-script text-2xl text-ink/85 leading-none">
          {caption}
        </p>
      )}
    </div>
  );
}
