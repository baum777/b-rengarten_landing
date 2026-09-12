import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/lib/site";

export const Route = createFileRoute("/ueber-uns")({
  component: AboutPage,
  head: () => ({
    meta: [{ title: "Über uns — Bärengarten Ravensburg" }],
  }),
});

function AboutPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <header className="content-wide grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow text-wine-700">Host</p>
          <h1 className="text-display-md mt-3">
            Ein zeitgenössischer Gastgeber in Ravensburg.
          </h1>
          <p className="mt-6 text-lg text-charcoal-600">
            Hotel, Restaurant, Biergarten — ein Haus, keine Kulisse. Wir führen
            es persönlich: Qualität vor Quantität, klare Sprache, unkomplizierter
            Aufenthalt.
          </p>
        </div>
        <div className="lg:col-span-6">
          <Photo
            src={images.hostService}
            alt="Gastgeber am Tisch beim Servieren"
            ratio="3 / 4"
            className="rounded-md max-h-[36rem]"
          />
        </div>
      </header>

      <section className="content-reading mt-20 space-y-6 text-lg text-charcoal-600">
        <p>
          Unvernünftige Gastfreundschaft heißt für uns: jemand ist da, auch wenn
          es unbequem ist. Es ist keine operative Garantie und kein Werbespruch
          für Rundum-Service — es ist die Richtung, in die wir das Haus führen.
        </p>
        <p>
          Der Bär im Namen bleibt ein Hinweis, kein Maskottchen. Kein Zoo, kein
          Themenpark. Ein städtisches Haus mit Küche, Garten und Betten.
        </p>
        <Link to="/kontakt" className={buttonVariants({ variant: "green", className: "mt-4" })}>
          Kontakt
        </Link>
      </section>
    </main>
  );
}
