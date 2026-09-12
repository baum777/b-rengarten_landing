import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { rooms } from "@/lib/site";

export const Route = createFileRoute("/hotel/zimmer")({
  component: RoomsPage,
  head: () => ({
    meta: [{ title: "Zimmer — Bärengarten Ravensburg" }],
  }),
});

function RoomsPage() {
  return (
    <main className="pt-24 md:pt-28">
      <header className="content-wide pb-12">
        <p className="eyebrow text-wine-700">Hotel</p>
        <h1 className="text-display-md mt-3">Zimmer</h1>
        <p className="mt-4 max-w-xl text-lg text-charcoal-600">
          Drei Typen, damit die Wahl kurz bleibt. Preise nennen wir in der
          Anfrage — nicht als Schaufenster.
        </p>
      </header>
      <div className="content-wide pb-24 grid gap-16">
        {rooms.map((room, index) => (
          <article
            key={room.slug}
            className="grid gap-8 lg:grid-cols-12 lg:items-center"
          >
            <div className={index % 2 ? "lg:col-span-7 lg:order-2" : "lg:col-span-7"}>
              <Photo src={room.image} alt={room.alt} ratio="3 / 2" className="rounded-md" />
            </div>
            <div className="lg:col-span-5">
              <h2 className="font-display text-4xl tracking-tight">{room.name}</h2>
              <p className="mt-3 text-lg text-charcoal-600">{room.subtitle}</p>
              <ul className="mt-6 space-y-2 text-charcoal-900">
                {room.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
              <Link
                to="/hotel/buchen"
                className={buttonVariants({ variant: "wine", className: "mt-8" })}
              >
                Dieses Zimmer anfragen
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
