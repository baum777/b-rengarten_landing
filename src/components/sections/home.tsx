import { Link } from "@tanstack/react-router";
import { GardenFrame } from "@/components/brand/garden-frame";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { images, site } from "@/lib/site";

export function RestaurantEditorial() {
  return (
    <section className="bg-paper-50">
      <div className="content-wide section-pad">
        <p className="eyebrow text-wine-700">Restaurant</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="text-display-lg lg:col-span-8">
            Qualität, die auf den Teller gehört.
          </h2>
          <p className="lg:col-span-4 text-lg text-charcoal-600 lg:pb-1">
            Hohe Speisenqualität und guter Service gehören für uns zusammen.
            Anspruch an jeden Abend — nicht als große Geste.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <GardenFrame className="lg:col-span-8">
            <Photo
              src={images.foodRoast}
              alt="Zwiebelrostbraten mit Gemüse auf cremefarbener Keramik"
              className="aspect-[4/5] lg:aspect-[5/4]"
            />
          </GardenFrame>
          <div className="lg:col-span-4 flex flex-col justify-end gap-8 lg:pb-2">
            <Photo
              src={images.foodMaultaschen}
              alt="Maultaschen in der Brühe, angerichtet"
              ratio="1 / 1"
              className="max-w-xs rounded-md lg:max-w-none"
            />
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/restaurant"
                className={buttonVariants({ variant: "green" })}
              >
                Restaurant entdecken
              </Link>
              <Link
                to="/restaurant/reservieren"
                className={buttonVariants({ variant: "secondary" })}
              >
                Tisch reservieren
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const hotelJobs = [
  {
    title: "Ankommen",
    body: "Unkompliziert anreisen und einchecken.",
  },
  {
    title: "Übernachten",
    body: "Saubere Zimmer für einen verlässlichen Aufenthalt.",
  },
  {
    title: "Weiter",
    body: "Ein Ausgangspunkt für berufliche Termine und Aufenthalte in der Region.",
  },
] as const;

export function HotelUtility() {
  return (
    <section className="bg-paper-50">
      <div className="content-wide section-pad">
        <p className="eyebrow text-wine-700">Hotel</p>
        <h2 className="text-display-md mt-4 max-w-2xl">
          Ankommen muss nicht kompliziert sein.
        </h2>
        <ul className="mt-16 grid gap-10 md:grid-cols-3 md:gap-12 border-t border-charcoal-900/16 pt-10">
          {hotelJobs.map((job) => (
            <li key={job.title}>
              <h3 className="eyebrow text-charcoal-600">{job.title}</h3>
              <p className="mt-3 text-lg text-charcoal-900">{job.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link
            to="/hotel/zimmer"
            className={buttonVariants({ variant: "secondary" })}
          >
            Zimmer ansehen
          </Link>
          <Link
            to="/hotel/buchen"
            className={buttonVariants({ variant: "wine" })}
          >
            Verfügbarkeit prüfen
          </Link>
        </div>
        <Photo
          src={images.roomDesk}
          alt="Hotelzimmer mit Schreibtisch am Fenster"
          ratio="2 / 1"
          className="mt-16 rounded-md"
        />
      </div>
    </section>
  );
}

export function HostManifesto() {
  return (
    <section className="bg-paper-100">
      <div className="content-wide section-pad grid gap-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-wine-700">Qualität & Ehrlichkeit</p>
          <h2 className="text-display-lg mt-5">
            Ein Gast ist keine
            <br />
            Buchungsnummer.
          </h2>
          <p className="mt-6 max-w-lg text-lg text-charcoal-600">
            Persönliche Gastgeberpräsenz, hohe Servicequalität und ehrliche
            Kommunikation gehören für uns zusammen.
          </p>
        </div>
        <GardenFrame className="lg:col-span-5">
          <Photo
            src={images.hostService}
            alt="Service am Tisch: ein Teller wird gereicht"
            ratio="4 / 5"
            className="max-h-[36rem]"
          />
        </GardenFrame>
      </div>
    </section>
  );
}

export function GardenFeature() {
  return (
    <section className="relative isolate min-h-[70vh] md:min-h-[78vh] flex items-end overflow-hidden bg-green-950 text-paper-50">
      <Photo
        src={images.gardenDay}
        alt="Biergarten unter Kastanien bei Tageslicht, Tische zwischen den Bäumen"
        className="absolute inset-0 h-full w-full"
        imgClassName="object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-green-950/25 to-transparent" />
      <div className="relative content-wide py-20 md:py-28">
        <p className="eyebrow text-paper-50/70">Biergarten</p>
        <h2 className="text-display-md mt-4 max-w-3xl">
          Draußen zusammensitzen.
        </h2>
        <p className="mt-4 max-w-lg text-paper-50/85">
          Biergarten, Restaurant und Gastgeber gehören hier zum selben Haus.
        </p>
        <Link
          to="/biergarten"
          className={buttonVariants({ variant: "inverse", className: "mt-8" })}
        >
          Biergarten entdecken
        </Link>
      </div>
    </section>
  );
}

export function LocationSection() {
  return (
    <section className="bg-paper-50">
      <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow text-wine-700">Ravensburg</p>
          <h2 className="text-display-md mt-4">
            In Ravensburg.
            <br />
            Gut erreichbar.
          </h2>
          <p className="mt-5 text-lg text-charcoal-600">
            {site.address.street}, {site.address.zip} {site.address.city}.
          </p>
          <a
            href={site.googleMapsUrl}
            className={buttonVariants({
              variant: "secondary",
              className: "mt-8",
            })}
          >
            Route öffnen
          </a>
        </div>
        <GardenFrame className="lg:col-span-7" corner="bl">
          <Photo
            src={images.ravensburg}
            alt="Gasse in der Ravensburger Altstadt mit Turm im Abendlicht"
            ratio="3 / 2"
          />
        </GardenFrame>
      </div>
    </section>
  );
}

const principles = [
  {
    title: "Sauber ankommen.",
    body: "Saubere Zimmer und ein gepflegtes Haus gehören für uns zur Grundlage guter Gastfreundschaft.",
  },
  {
    title: "Gut essen.",
    body: "Qualität bei Speisen und Service geht vor bloßer Menge.",
  },
  {
    title: "Persönlich behandelt werden.",
    body: "Ein Gast ist für uns keine Buchungsnummer.",
  },
] as const;

export function ProofPrinciples() {
  return (
    <section className="bg-paper-100">
      <div className="content-wide section-pad">
        <p className="eyebrow text-wine-700">Was uns wichtig ist</p>
        <h2 className="text-display-md mt-4">Was Sie von uns erwarten dürfen.</h2>
        <ul className="mt-12 grid gap-12 lg:grid-cols-3">
          {principles.map((item) => (
            <li
              key={item.title}
              className="border-t border-charcoal-900/16 pt-6"
            >
              <h3 className="font-display text-2xl tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-charcoal-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
