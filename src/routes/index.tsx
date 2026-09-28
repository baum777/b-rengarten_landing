import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/media/photo";
import { CtaBand } from "@/components/sections/page-hero";
import { FactStrip } from "@/components/sections/fact-strip";
import { Timeline } from "@/components/sections/timeline";
import { buttonVariants } from "@/components/ui/button";
import { publicContent } from "@/content/public";
import { images } from "@/lib/site";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Unvernünftige Gastfreundschaft — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Bärengarten Ravensburg — ein Haus in der Schützenstraße: Hotel mit Restaurant und Biergarten unter alten Kastanien.",
      },
    ],
  }),
});

/**
 * R3: die Startseite ist ein fortlaufender redaktioneller Beitrag —
 * HAUS / GARTEN / TISCH als Erzählbogen. Alle Fakten ausschließlich über die
 * R2-Public-Projektion (`@/content/public`); keine Betriebsdaten, keine
 * HOLD/HIDDEN-Fakten. Design + Layout only — Content-Truth liegt in der SOT.
 */
function Home() {
  return (
    <main>
      <HomeHero />
      <HouseStatement />
      <FactBand />
      <GardenSection />
      <HotelSection />
      <TableSection />
      <GatherBand />
      <ArchitectureSection />
      <RutenfestBand />
      <StoryTimeline />
      <LocationSection />
      <CtaBand />
    </main>
  );
}

/** 01 — Marken-Held: Emotion und Orientierung, keine Fakten, keine Widgets. */
function HomeHero() {
  return (
    <section className="relative isolate flex min-h-svh items-end bg-green-950 text-paper-50">
      <Photo
        src={images.heroGarden}
        alt="Abendlicher Biergarten unter alten Kastanien, gedeckte Tische im warmen Licht"
        priority
        className="absolute inset-0 h-full w-full"
        imgClassName="object-[center_42%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/85 via-green-950/40 to-green-950/30" />
      <div className="relative content-wide pb-16 pt-36 md:pb-24">
        <p className="eyebrow text-paper-50/80">
          {publicContent.name} · {publicContent.location}
        </p>
        <h1 className="mt-5 max-w-4xl text-display-lg md:text-display-xl">
          {publicContent.tagline}.
        </h1>
        <p className="mt-5 text-lg text-paper-50/85">{publicContent.descriptor}</p>
        <div className="mt-12 flex items-center gap-4" aria-hidden>
          <span className="h-px w-14 bg-paper-50/50" />
          <p className="micro text-paper-50/70">Kommen Sie herein.</p>
        </div>
      </div>
    </section>
  );
}

/** 02 — Vom Marken-Ton zur Haus-Realität. */
function HouseStatement() {
  return (
    <section className="bg-paper-50 text-charcoal-900">
      <div className="content-reading section-pad">
        <p className="eyebrow text-wine-700">{publicContent.name}</p>
        <h2 className="mt-6 text-display-lg">Ein Haus in Ravensburg.</h2>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-charcoal-600">
          Hotel, Restaurant und Biergarten teilen sich Mauern, Garten und
          Geschichte. Wer bei uns ankommt, kommt in einem Haus an — nicht in
          drei Abteilungen.
        </p>
        <p className="mt-10 font-display text-2xl italic text-green-950 md:text-3xl">
          „{publicContent.manifesto}“
        </p>
      </div>
    </section>
  );
}

/** 03 — Der Faktstreifen: belegte Zahlen, redaktionell gesetzt. */
function FactBand() {
  return (
    <section className="border-y border-charcoal-900/10 bg-paper-100 text-charcoal-900">
      <div className="content-wide section-pad">
        <h2 className="sr-only">Das Haus in Zahlen</h2>
        <p className="eyebrow text-wine-700">Das Haus in Zahlen</p>
        <FactStrip items={publicContent.factStrip} className="mt-12" />
      </div>
    </section>
  );
}

/** 04 — Das Herzstück: der Garten, groß und asymmetrisch. */
function GardenSection() {
  return (
    <section className="bg-paper-50 text-charcoal-900">
      <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <Photo
            src={images.gardenDay}
            alt="Biergarten unter alten Kastanien: Holztische und Bänke, dahinter die Ravensburger Altstadt"
            ratio="4 / 5"
            className="rounded-md"
          />
        </div>
        <div className="flex flex-col justify-center lg:col-span-4">
          <p className="eyebrow text-wine-700">Der Garten</p>
          <h2 className="mt-4 text-display-md">Unter alten Kastanien.</h2>
          <p className="mt-5 text-lg leading-relaxed text-charcoal-600">
            {publicContent.gardenStory}
          </p>
          <Link
            to="/biergarten"
            className={buttonVariants({
              variant: "secondary",
              className: "mt-8 self-start",
            })}
          >
            Zum Biergarten
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 05 — Das Hotel: leiser als der Garten, Forst-Fläche, Zahlen aus der SOT. */
function HotelSection() {
  return (
    <section className="bg-green-800 text-paper-50">
      <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow text-paper-50/70">Hotel</p>
          <h2 className="mt-4 text-display-md">
            Ein kleines Stadthotel in Ravensburg.
          </h2>
          <p className="mt-8 font-display text-3xl tracking-tight md:text-4xl">
            {publicContent.roomHeadline}
          </p>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-paper-50/85">
            So klein, dass man am Empfang ein Gesicht hat und keine
            Buchungsnummer — mitten in der Stadt, an der Schützenstraße.
          </p>
          <Link
            to="/hotel"
            className={buttonVariants({
              variant: "inverse",
              className: "mt-8",
            })}
          >
            Zum Hotel
          </Link>
        </div>
        <div className="lg:col-span-7">
          <Photo
            src={images.roomArrival}
            alt="Helles Doppelzimmer in ruhigen Beigetönen mit Holzakzenten"
            ratio="3 / 2"
            className="rounded-md"
          />
        </div>
      </div>
    </section>
  );
}

/** 06 — Der Tisch: Raum statt Küchen-Versprechen; Karte bleibt neutral. */
function TableSection() {
  return (
    <section className="bg-paper-50 text-charcoal-900">
      <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:order-2 lg:col-span-7">
          <Photo
            src={images.restaurantInterior}
            alt="Restaurantinnenraum mit Eichentischen und Blick in den Garten"
            ratio="3 / 2"
            className="rounded-md"
          />
        </div>
        <div className="lg:order-1 lg:col-span-5">
          <p className="eyebrow text-wine-700">Der Tisch</p>
          <h2 className="mt-4 text-display-md">
            Restaurant und Garten gehören zusammen.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-charcoal-600">
            Große Fenster, Eichentische, und der Blick geht direkt in die
            Bäume. Die neue Karte entsteht noch — was heute auf den Tisch
            kommt, erzählen wir Ihnen gern beim Platznehmen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/restaurant/reservieren"
              className={buttonVariants({ variant: "wine" })}
            >
              Tisch reservieren
            </Link>
            <Link
              to="/restaurant/speisekarte"
              className={buttonVariants({ variant: "secondary" })}
            >
              Zur Speisekarte
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 07 — Zusammenkommen: Anlässe als Haltung, nicht als Produktraster. */
function GatherBand() {
  return (
    <section className="border-y border-charcoal-900/10 bg-paper-100 text-charcoal-900">
      <div className="content-standard section-pad">
        <p className="eyebrow text-wine-700">Zusammenkommen</p>
        <h2 className="mt-4 max-w-2xl text-display-md">
          Ein Haus für Runden, die länger dauern.
        </h2>
        <p className="mt-8 font-display text-3xl tracking-tight text-green-950 md:text-5xl">
          Familien · Freunde · Gruppen · Kultur
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-charcoal-600">
          Manche Abende wollen einfach nicht enden. Ob festliche Runde oder
          kleiner Anlass: Dafür haben wir Garten, Stuben und die Erfahrung
          langer Festtage.
        </p>
        <Link
          to="/anlaesse"
          className={buttonVariants({
            variant: "secondary",
            className: "mt-8",
          })}
        >
          Anlass anfragen
        </Link>
      </div>
    </section>
  );
}

/** 08 — Architektur: die Materialsprache des Hauses als Differenzierung. */
function ArchitectureSection() {
  return (
    <section className="bg-paper-50 text-charcoal-900">
      <div className="content-wide section-pad">
        <div className="max-w-3xl">
          <p className="eyebrow text-wine-700">Architektur</p>
          <h2 className="mt-4 text-display-md">
            Ein Haus, das innen und außen verbindet.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-charcoal-600">
            {publicContent.architectureStory}
          </p>
        </div>
        <Photo
          src={images.eventsTable}
          alt="Langer Eichentisch für Zusammenkünfte, mit Messingleuchter und Blick in den Garten"
          ratio="16 / 9"
          className="mt-12 rounded-md"
        />
      </div>
    </section>
  );
}

/** 09 — Bewusste Unterbrechung: Rutenfest als Orts-Geschichte (keine Event-Claims). */
function RutenfestBand() {
  return (
    <section className="bg-wine-700 text-paper-50">
      <div className="content-reading section-pad text-center">
        <p className="eyebrow text-paper-50/70">Rutenfest Ravensburg</p>
        <h2 className="mx-auto mt-6 max-w-2xl text-display-lg">
          Ein Ort mit Geschichte.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper-50/85">
          {publicContent.rutenfestStory}
        </p>
      </div>
    </section>
  );
}

/** 10 — Vom Wandel des Hauses, nur mit belegten Epochen. */
function StoryTimeline() {
  return (
    <section className="bg-paper-50 text-charcoal-900">
      <div className="content-wide section-pad">
        <p className="eyebrow text-wine-700">Geschichte</p>
        <h2 className="mt-4 max-w-2xl text-display-md">Das Haus im Wandel.</h2>
        <Timeline entries={publicContent.timeline} className="mt-12" />
      </div>
    </section>
  );
}

/** 11 — Lage: große Typografie, belegte Adresse, sichere Karten-Links. */
function LocationSection() {
  return (
    <section className="border-y border-charcoal-900/10 bg-paper-100 text-charcoal-900">
      <div className="content-wide section-pad grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow text-wine-700">{publicContent.location}</p>
          <h2 className="mt-4 text-display-lg">{publicContent.address.street}.</h2>
          <p className="mt-6 text-xl text-charcoal-600">
            {publicContent.address.zip} {publicContent.address.city}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={publicContent.googleMapsUrl}
              className={buttonVariants({ variant: "wine" })}
            >
              Route planen
            </a>
            <a
              href={publicContent.mapsUrl}
              className={buttonVariants({ variant: "secondary" })}
            >
              In OpenStreetMap
            </a>
            <Link
              to="/kontakt"
              className={buttonVariants({ variant: "secondary" })}
            >
              Kontakt
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5">
          <Photo
            src={images.ravensburg}
            alt="Ravensburger Altstadt mit historischem Stadtturm im Abendlicht"
            ratio="4 / 3"
            className="rounded-md"
          />
        </div>
      </div>
    </section>
  );
}
