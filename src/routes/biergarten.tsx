import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/sections/page-hero";
import { EditorialSplit, StatusLine } from "@/components/sections/editorial";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { hours, images, site } from "@/lib/site";

export const Route = createFileRoute("/biergarten")({
  component: GardenPage,
  head: () => ({
    meta: [
      { title: "Biergarten — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Biergarten unter Kastanien in Ravensburg. Essen, Familien, offene Abende. Wetterabhängig.",
      },
    ],
  }),
});

function GardenPage() {
  return (
    <main>
      <PageHero
        image={images.heroGarden}
        alt="Abendlicher Biergarten unter Kastanien mit warmem Licht"
        eyebrow="Garden"
        title="Unter den Bäumen. In der Stadt."
        kicker="Kein Festzelt, kein Kostüm. Ein Garten zum Sitzen, Essen und Bleiben."
        actions={[
          { to: "/restaurant/reservieren", label: "Tisch im Haus", variant: "inverse" },
          { to: "/kontakt", label: "Heute nachfragen", variant: "wine" },
        ]}
      />

      <section className="bg-paper-50">
        <div className="content-wide py-10 flex flex-wrap items-center justify-between gap-4">
          <StatusLine label={`Saison & Wetter: ${hours.garden}`} />
          <a href={site.phoneHref} className="text-sm underline underline-offset-4">
            Heute anrufen
          </a>
        </div>
      </section>

      <EditorialSplit
        eyebrow="Atmosphäre"
        title="Schatten, Kies, lange Tische."
        body="Alte Kastanien, Platz zum Atmen, Teller und Gläser im Zusammenhang. Familien gehören dazu. Lederhosen nicht."
        image={images.gardenDay}
        alt="Biergarten am Tag, Tische unter Bäumen"
      />

      <section className="bg-paper-50">
        <div className="content-wide section-pad grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Photo
              src={images.gardenGlasses}
              alt="Glas Weizenbier und Weinglas auf einem Gartentisch im Sonnenlicht"
              ratio="1 / 1"
              className="rounded-md"
            />
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow text-wine-700">Essen & Trinken</p>
            <h2 className="text-display-md mt-4">Dieselbe Küche. Mehr Luft.</h2>
            <p className="mt-5 text-lg text-charcoal-600">
              Was innen gekocht wird, steht auch außen — soweit das Wetter mitspielt.
              Bier vom Fass, Wein zum Essen, kein Themenpark.
            </p>
            <Link
              to="/restaurant/speisekarte"
              className={buttonVariants({ variant: "green", className: "mt-8" })}
            >
              Speisen ansehen
            </Link>
          </div>
        </div>
      </section>

      <EditorialSplit
        eyebrow="Praktisch"
        title="Finden Sie uns in der Schützenstraße."
        body={`${site.address.street}, ${site.address.zip} ${site.address.city}. Der Garten folgt der Küche. Bei Regen bleibt das Haus offen.`}
        image={images.entrance}
        alt="Abendlicher Eingang des Hauses mit warmem Licht"
        reverse
        cta={{ to: "/kontakt", label: "Anfahrt & Kontakt" }}
      />
    </main>
  );
}
