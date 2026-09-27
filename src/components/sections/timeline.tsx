import { cn } from "@/lib/utils";

export type TimelineEntry = { era: string; text: string };

/**
 * Restrained Zeitleiste: horizontal auf dem Desktop, vertikal auf Mobile.
 * Haarlinien statt Karten, Epochen in Display-Schrift, Laufnummern in Mono.
 */
export function Timeline({
  entries,
  className,
}: {
  entries: readonly TimelineEntry[];
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-10 md:grid-cols-4 md:gap-8", className)}>
      {entries.map((entry, index) => (
        <li key={entry.era} className="border-t border-charcoal-900/25 pt-5">
          <p className="micro text-wine-700">
            {String(index + 1).padStart(2, "0")}
          </p>
          <p className="mt-3 font-display text-2xl tracking-tight">{entry.era}</p>
          <p className="mt-3 leading-relaxed text-charcoal-600">{entry.text}</p>
        </li>
      ))}
    </ol>
  );
}
