import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, CtaBand } from "@/components/sections/page-hero";
import { EditorialSplit } from "@/components/sections/editorial";
import { BookingBar } from "@/components/forms/inquiry-forms";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/lib/site";

export const Route = createFileRoute("/hotel/")({
  component: HotelPage,
  head: () => ({
    meta: [
      { title: "Hotel — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Zimmer in Ravensburg. Das historische Haus bietet 12 Zimmer und eine Suite. Verfügbarkeit persönlich anfragen.",
      },
    ],
  }),
});

function HotelPage() {
  return (
    <main>
      <PageHero
        image={images.roomComfort}
        alt="Helles Hotelzimmer mit Leinenbett"
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
        <div className="content-wide pb-20 md:pb-28 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Zimmer</p>
            <h2 className="text-display-md mt-3">12 Zimmer. Eine Suite.</h2>
            <p className="mt-4 text-charcoal-600">
              Das Haus ist klein und überschaubar. Welches Zimmer zu Ihrem
              Aufenthalt passt, klären wir in der Anfrage — persönlich statt
              mit Typen-Schubladen.
            </p>
            <Link
              to="/hotel/zimmer"
              className={buttonVariants({ variant: "secondary", className: "mt-8" })}
            >
              Zimmer ansehen
            </Link>
          </div>
          <Photo
            src={images.roomDesk}
            alt="Hotelzimmer mit Schreibtisch am Fenster"
            ratio="3 / 2"
            className="lg:col-span-7 rounded-md"
          />
        </div>
      </section>

      <section className="bg-paper-100">
        <div className="content-wide section-pad grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Anreise</p>
            <h2 className="text-display-md mt-4">
              Unkompliziert ankommen.
            </h2>
            <p className="mt-5 text-charcoal-600">
              Sagen Sie uns in Ihrer Anfrage, wann Sie ankommen. Alles Weitere
              — Anreisezeit, Zimmer, Wünsche — stimmen wir persönlich ab,
              bevor Sie reisen.
            </p>
          </div>
          <div className="lg:col-span-7 flex items-center">
            <p className="text-lg text-charcoal-600 border-l-2 border-wine-700 pl-6">
              Check-in, Check-out und Öffnungszeiten nennen wir Ihnen mit der
              persönlichen Bestätigung Ihrer Anfrage.
            </p>
          </div>
        </div>
      </section>

      <EditorialSplit
        eyebrow="Im Haus"
        title="Unten essen. Oben schlafen."
        body="Das Restaurant und der Garten gehören zum Haus. Wer bleibt, muss nicht lange suchen — und wer nur isst, ist ebenso Gast."
        image={images.restaurantInterior}
        alt="Restaurantinnenraum mit Eichentischen"
        cta={{ to: "/restaurant", label: "Zum Restaurant" }}
      />

      <CtaBand />
    </main>
  );
}
