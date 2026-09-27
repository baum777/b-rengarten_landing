import { cn } from "@/lib/utils";

export type FactItem = { value: string; label: string };

/**
 * Editorieller Faktstreifen: große Display-Ziffern mit Mono-Labels.
 * Bewusst keine KPI-/Dashboard-Optik — Whitespace statt Karten, horizontal
 * auf dem Desktop, 2×2 auf Mobile.
 */
export function FactStrip({
  items,
  className,
}: {
  items: readonly FactItem[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label}>
          <p className="font-display text-6xl leading-none tracking-tight md:text-7xl">
            {item.value}
          </p>
          <p className="micro mt-3 text-charcoal-600">{item.label}</p>
        </li>
      ))}
    </ul>
  );
}
