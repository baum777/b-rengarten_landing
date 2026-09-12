import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/media/photo";
import { HomeHero, CtaBand } from "@/components/sections/page-hero";
import { PortalGrid } from "@/components/sections/portals";
import {
  EditorialSplit,
  Manifesto,
  ReviewBand,
} from "@/components/sections/editorial";
import { images, site } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Bärengarten Ravensburg — Hotel, Restaurant, Biergarten" },
      {
        name: "description",
        content:
          "Ein zeitgenössischer Gastgeber in Ravensburg: ruhige Zimmer, Küche mit Haltung, Biergarten unter alten Bäumen.",
      },
    ],
  }),
});

function Home() {
  return (
    <main>
      <HomeHero />
      <PortalGrid />
      <Manifesto />
      <EditorialSplit
        eyebrow="Tisch"
        title="Gut essen. Gute Menschen. Gute Zeit."
        body="Die Küche steht im Haus. Regionale Herkunft, klare Teller, kein Theater. Reservieren Sie einen Tisch — wir kochen, was der Tag hergibt."
        image={images.foodRoast}
        alt="Zwiebelrostbraten mit Gemüse auf cremefarbener Keramik"
        cta={{ to: "/restaurant", label: "Zur Küche" }}
      />
      <EditorialSplit
        eyebrow="Stay"
        title="Ankommen muss nicht kompliziert sein."
        body="Helle Zimmer, saubere Betten, ein Schreibtisch, der wirklich ein Schreibtisch ist. In der Stadt, nicht im Lärm der Stadt."
        image={images.roomComfort}
        alt="Ruhiges Hotelzimmer mit Tageslicht und Leinenbett"
        reverse
        cta={{ to: "/hotel", label: "Zu den Zimmern" }}
      />
      <EditorialSplit
        eyebrow="Host"
        title="Ein Ort für echte Gäste. Nicht für Buchungsnummern."
        body="Wir sind da. Am Tisch, an der Tür, wenn etwas nicht stimmt. Gastfreundschaft ist groß — die Bedienung bleibt klein und präzise."
        image={images.hostService}
        alt="Service am Tisch: ein Teller wird gereicht, Gespräch, kein Pose-Porträt"
        cta={{ to: "/ueber-uns", label: "Das Haus" }}
      />
      <section className="relative isolate min-h-[70vh] flex items-end overflow-hidden bg-green-950 text-paper-50">
        <Photo
          src={images.gardenDay}
          alt="Biergarten unter Kastanien bei Tageslicht, Tische zwischen den Bäumen"
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-green-950/25 to-transparent" />
        <div className="relative content-wide py-20 md:py-28">
          <p className="eyebrow text-paper-50/70">Garten</p>
          <h2 className="text-display-md mt-4 max-w-3xl">
            Unter den Bäumen sitzen, nicht posieren.
          </h2>
          <p className="mt-4 max-w-lg text-paper-50/85">
            Der Biergarten ist ein städtischer Freiraum — Familien, Kollegen,
            der lange Abend. Wetter macht den Rest.
          </p>
          <Link
            to="/biergarten"
            className={buttonVariants({ variant: "inverse", className: "mt-8" })}
          >
            Den Garten entdecken
          </Link>
        </div>
      </section>
      <section className="bg-paper-50">
        <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Ravensburg</p>
            <h2 className="text-display-md mt-4">In der Stadt. Nicht daneben.</h2>
            <p className="mt-5 text-lg text-charcoal-600">
              {site.address.street}, wenige Minuten zur Altstadt. Ein Haus zum
              Ankommen, wenn die Türme schon in Sicht sind.
            </p>
            <a
              href={site.googleMapsUrl}
              className={buttonVariants({ variant: "secondary", className: "mt-8" })}
            >
              Route
            </a>
          </div>
          <div className="lg:col-span-7">
            <Photo
              src={images.ravensburg}
              alt="Gasse in der Ravensburger Altstadt mit Turm im Abendlicht"
              ratio="3 / 2"
              className="rounded-md"
            />
          </div>
        </div>
      </section>
      <ReviewBand />
      <CtaBand />
    </main>
  );
}
