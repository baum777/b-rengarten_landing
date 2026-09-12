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
        <ellipse cx="12.15" cy="8.05" rx="2.6" ry="2.9" />
        <ellipse cx="20.05" cy="7.9" rx="2.6" ry="2.9" />
        <path
          fillRule="evenodd"
          d="M9 8.45h10.05c3.5 0 5.7 2.15 5.7 5.15 0 2.15-1.2 3.65-3.15 4.4 2.25.7 3.7 2.3 3.7 4.85C25.3 26.15 22.4 28.1 18.15 28.1H9Z M12.85 11.2h5.15c1.7 0 2.7.95 2.7 2.35s-1 2.35-2.7 2.35h-5.15Z M12.85 19.55h5.9c1.85 0 2.95 1.05 2.95 2.55s-1.1 2.55-2.95 2.55h-5.9Z"
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
