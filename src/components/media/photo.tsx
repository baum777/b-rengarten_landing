import { cn } from "@/lib/utils";

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  ratio?: string;
};

export function Photo({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
  ratio,
}: PhotoProps) {
  return (
    <div
      className={cn("overflow-hidden bg-paper-100", className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", imgClassName)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
