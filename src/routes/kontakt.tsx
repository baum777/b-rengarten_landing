import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/media/photo";
import { images, site } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";

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
          <p className="eyebrow text-wine-700">Anfahrt</p>
          <h1 className="text-display-md mt-3">Kommen Sie vorbei.</h1>
          <address className="mt-8 not-italic text-lg">
            {site.name}
            <br />
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
          </address>
          <p className="mt-6 text-charcoal-600">
            Zimmer-, Tisch- und Anlassanfragen gehen über die Formulare auf
            dieser Seite — wir bestätigen persönlich.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/hotel/buchen"
              className={buttonVariants({ variant: "secondary" })}
            >
              Zimmeranfrage
            </Link>
            <Link
              to="/restaurant/reservieren"
              className={buttonVariants({ variant: "secondary" })}
            >
              Tischanfrage
            </Link>
          </div>
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
        </div>
      </div>
    </main>
  );
}
