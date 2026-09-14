import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, CtaBand } from "@/components/sections/page-hero";
import { EditorialSplit } from "@/components/sections/editorial";
import { BookingBar } from "@/components/forms/inquiry-forms";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { hours, images, rooms } from "@/lib/site";
import {
  ArrivalIcon,
  BreakfastIcon,
  ClockIcon,
} from "@/components/brand/icons";

export const Route = createFileRoute("/hotel/")({
  component: HotelPage,
  head: () => ({
    meta: [
      { title: "Hotel — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Zimmer in Ravensburg. Klare Fakten zu Anreise, Check-in und Frühstück. Verfügbarkeit persönlich anfragen.",
      },
    ],
  }),
});

function HotelPage() {
  return (
    <main>
      <PageHero
        image={images.roomComfort}
        alt="Helles Komfortzimmer mit Leinenbett und Schreibtisch"
        eyebrow="Stay"
        title="Ankommen muss nicht kompliziert sein."
        kicker="Saubere Zimmer für Ankommen, Übernachten und Weiterziehen."
        actions={[
          { to: "/hotel/zimmer", label: "Zimmer ansehen", variant: "inverse" },
          { to: "/hotel/buchen", label: "Verfügbarkeit prüfen", variant: "wine" },
        ]}
      />

      <section className="bg-paper-50">
        <div className="content-wide py-10 md:py-14">
          <BookingBar />
        </div>
      </section>

      <section className="bg-paper-50">
        <div className="content-wide pb-20 md:pb-28">
          <p className="eyebrow text-wine-700">Zimmer</p>
          <h2 className="text-display-md mt-3">Weniger Typen, klarer Überblick.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.slug} className="flex flex-col">
                <Photo
                  src={room.image}
                  alt={room.alt}
                  ratio="3 / 2"
                  className="rounded-md"
                />
                <h3 className="font-display text-2xl mt-5 tracking-tight">
                  {room.name}
                </h3>
                <p className="mt-1 text-charcoal-600">{room.subtitle}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {room.facts.map((fact) => (
                    <li
                      key={fact}
                      className="micro rounded-sm border border-charcoal-900/16 px-2 py-1 text-charcoal-600"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <Link
            to="/hotel/zimmer"
            className={buttonVariants({ variant: "secondary", className: "mt-10" })}
          >
            Alle Zimmer
          </Link>
        </div>
      </section>

      <section className="bg-paper-100">
        <div className="content-wide section-pad grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Anreise</p>
            <h2 className="text-display-md mt-4">
              Unkomplizierter Check-in.
            </h2>
            <p className="mt-5 text-charcoal-600">
              Sagen Sie uns, wann Sie da sind. Die Rezeption ist tagsüber
              besetzt; spätere Ankunft klären wir vorher — wir versprechen
              hier kein rund-um-die-Uhr-System, das wir nicht belegen können.
            </p>
          </div>
          <dl className="lg:col-span-7 grid gap-6 sm:grid-cols-2 text-sm">
            <div>
              <dt className="eyebrow text-charcoal-600 flex items-center gap-2">
                <ArrivalIcon className="h-4 w-4" />
                Check-in
              </dt>
              <dd className="mt-2 text-lg">{hours.checkIn}</dd>
            </div>
            <div>
              <dt className="eyebrow text-charcoal-600 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Check-out
              </dt>
              <dd className="mt-2 text-lg">{hours.checkOut}</dd>
            </div>
            <div>
              <dt className="eyebrow text-charcoal-600 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Rezeption
              </dt>
              <dd className="mt-2">{hours.receptionWeek}</dd>
              <dd className="text-charcoal-600">{hours.receptionWeekend}</dd>
            </div>
            <div>
              <dt className="eyebrow text-charcoal-600 flex items-center gap-2">
                <BreakfastIcon className="h-4 w-4" />
                Frühstück
              </dt>
              <dd className="mt-2">{hours.breakfastWeek}</dd>
              <dd className="text-charcoal-600">{hours.breakfastWeekend}</dd>
            </div>
          </dl>
        </div>
      </section>

      <EditorialSplit
        eyebrow="Im Haus"
        title="Unten essen. Oben schlafen."
        body="Das Restaurant und der Garten gehören zum Haus. Wer bleibt, muss nicht lange suchen — und wer nur isst, ist ebenso Gast."
        image={images.breakfast}
        alt="Frühstückstisch mit Brot, Ei und Kaffee im Morgenlicht"
        cta={{ to: "/restaurant", label: "Zum Restaurant" }}
      />

      <CtaBand />
    </main>
  );
}
