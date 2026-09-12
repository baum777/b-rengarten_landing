import { createFileRoute } from "@tanstack/react-router";
import { hours, site } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { images } from "@/lib/site";

export const Route = createFileRoute("/kontakt")({
  component: ContactPage,
  head: () => ({
    meta: [{ title: "Kontakt — Bärengarten Ravensburg" }],
  }),
});

function ContactPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <div className="content-wide grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow text-wine-700">Anreise</p>
          <h1 className="text-display-md mt-3">Kommen Sie vorbei. Oder rufen Sie an.</h1>
          <address className="mt-8 not-italic text-lg">
            {site.name}
            <br />
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
          </address>
          <p className="mt-6">
            <a href={site.phoneHref} className="underline underline-offset-4">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="underline underline-offset-4">
              {site.email}
            </a>
          </p>
          <dl className="mt-10 grid gap-5 text-sm">
            <div>
              <dt className="eyebrow text-charcoal-600">Restaurant</dt>
              <dd className="mt-1">{hours.restaurant}</dd>
            </div>
            <div>
              <dt className="eyebrow text-charcoal-600">Rezeption</dt>
              <dd className="mt-1">{hours.receptionWeek}</dd>
              <dd>{hours.receptionWeekend}</dd>
            </div>
            <div>
              <dt className="eyebrow text-charcoal-600">Check-in / Check-out</dt>
              <dd className="mt-1">
                {hours.checkIn} / {hours.checkOut}
              </dd>
            </div>
          </dl>
          <a
            href={site.googleMapsUrl}
            className="mt-8 inline-flex min-h-control items-center underline underline-offset-4"
          >
            Route in Google Maps
          </a>
        </div>
        <div className="lg:col-span-6">
          <Photo
            src={images.ravensburg}
            alt="Ravensburger Altstadt, Turm im Abendlicht"
            ratio="3 / 2"
            className="rounded-md"
          />
          <p className="mt-4 text-sm text-charcoal-600">
            Wenige Minuten zur Altstadt. Parken vor Ort nach Verfügbarkeit.
            Bahnhof Ravensburg ist zu Fuß erreichbar.
          </p>
        </div>
      </div>
    </main>
  );
}
