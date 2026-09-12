import { createFileRoute } from "@tanstack/react-router";
import { faqs } from "@/lib/site";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [{ title: "FAQ — Bärengarten Ravensburg" }],
  }),
});

function FaqPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <header className="content-reading">
        <p className="eyebrow text-wine-700">Orientierung</p>
        <h1 className="text-display-md mt-3">Häufige Fragen</h1>
      </header>
      <div className="content-reading mt-12 divide-y divide-charcoal-900/12">
        {faqs.map((item) => (
          <details key={item.q} className="group py-6">
            <summary className="cursor-pointer font-display text-2xl tracking-tight list-none flex items-center justify-between gap-4 min-h-12">
              {item.q}
              <span className="text-charcoal-600 text-lg group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-charcoal-600 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
