import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/lib/site";
import { publicContent } from "@/content/public";

export const Route = createFileRoute("/hotel/zimmer")({
  component: RoomsPage,
  head: () => ({
    meta: [{ title: "Zimmer — Bärengarten Ravensburg" }],
  }),
});

function RoomsPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <header className="content-wide pb-12 grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-wine-700">Hotel</p>
          <h1 className="text-display-md mt-3">{publicContent.roomHeadline}</h1>
          <p className="mt-4 max-w-xl text-lg text-charcoal-600">
            Das Haus ist überschaubar — das macht den Aufenthalt ruhig. Welches
            Zimmer zu Ihnen passt, und was es kostet, klären wir in der Anfrage
            — persönlich statt mit Typen-Schubladen.
          </p>
        </div>
        <div className="lg:col-span-5">
          <Photo
            src={images.roomArrival}
            alt="Hotelzimmer mit gemachtem Doppelbett"
            ratio="4 / 3"
            className="rounded-md"
          />
        </div>
      </header>
      <div className="content-wide grid gap-8 lg:grid-cols-2">
        <Photo
          src={images.roomComfort}
          alt="Helles Hotelzimmer mit Leinenbett"
          ratio="4 / 3"
          className="rounded-md"
        />
        <Photo
          src={images.roomDesk}
          alt="Hotelzimmer mit Schreibtisch am Fenster"
          ratio="4 / 3"
          className="rounded-md"
        />
      </div>
      <div className="content-reading mt-12">
        <Link
          to="/hotel/buchen"
          className={buttonVariants({ variant: "wine" })}
        >
          Verfügbarkeit anfragen
        </Link>
      </div>
    </main>
  );
}
