import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/restaurant/speisekarte")({
  component: MenuPage,
  head: () => ({
    meta: [{ title: "Speisekarte — Bärengarten Ravensburg" }],
  }),
});

function MenuPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <header className="content-reading pb-12">
        <p className="eyebrow text-wine-700">Restaurant</p>
        <h1 className="text-display-md mt-3">Speisekarte</h1>
        <p className="mt-4 max-w-xl text-lg text-charcoal-600">
          Unsere Karte entsteht derzeit neu. Aktuelle Informationen folgen —
          und bis dahin sagen wir Ihnen mit der Bestätigung Ihrer Anfrage, was
          die Küche macht.
        </p>
      </header>
      <div className="content-reading">
        <Link
          to="/restaurant/reservieren"
          className={buttonVariants({ variant: "green" })}
        >
          Tisch anfragen
        </Link>
      </div>
    </main>
  );
}
