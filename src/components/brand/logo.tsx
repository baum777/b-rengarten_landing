import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <ellipse cx="12.5" cy="7.55" rx="1.55" ry="1.7" />
        <ellipse cx="19.7" cy="7.45" rx="1.55" ry="1.7" />
        <path
          fillRule="evenodd"
          d="M8.7 7.35h10.3c3.55 0 5.85 2.15 5.85 5.2 0 2.1-1.15 3.55-3.15 4.35 2.35.7 3.85 2.35 3.85 5.05C25.55 26.3 22.45 28.4 18.05 28.4H8.7Z M12.55 10.4h5.15c1.7 0 2.75.95 2.75 2.35s-1.05 2.35-2.75 2.35h-5.15Z M12.55 19.15h5.9c1.9 0 3 1.1 3 2.6s-1.1 2.6-3 2.6h-5.9Z"
        />
      </g>
    </svg>
  );
}

export function Wordmark({
  inverted = false,
  compact = false,
  className,
}: {
  inverted?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <Monogram
        className={cn("h-9 w-9", inverted ? "text-paper-50" : "text-green-800")}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.15rem] tracking-[-0.03em] font-medium",
            inverted ? "text-paper-50" : "text-charcoal-900",
          )}
        >
          BÄRENGARTEN
        </span>
        {!compact ? (
          <span
            className={cn(
              "eyebrow mt-1 text-[0.625rem]",
              inverted ? "text-paper-50/70" : "text-charcoal-600",
            )}
          >
            Ravensburg
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function BrandLink({
  inverted = false,
  compact = false,
}: {
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      aria-label="Bärengarten Ravensburg — zur Startseite"
      className="inline-flex rounded-sm focus-visible:outline-none"
    >
      <Wordmark inverted={inverted} compact={compact} />
    </Link>
  );
}
