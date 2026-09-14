import { createFileRoute, Link } from "@tanstack/react-router";
import { HostIcon } from "@/components/brand/icons";
import { ProofPrinciples } from "@/components/sections/home";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/lib/site";

export const Route = createFileRoute("/ueber-uns")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "Über uns — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Persönlich geführtes Haus in Ravensburg. Qualität, Ehrlichkeit und unvernünftige Gastfreundschaft.",
      },
    ],
  }),
});

function AboutPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <header className="content-wide grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow text-wine-700 flex items-center gap-2">
            <HostIcon className="h-4 w-4" />
            Über uns
          </p>
          <h1 className="text-display-md mt-3">
            Unvernünftige Gastfreundschaft
          </h1>
          <p className="mt-6 text-lg text-charcoal-600">
            Hotel, Restaurant, Biergarten — ein Haus, persönlich geführt.
            Qualität vor Quantität, klare Sprache, unkomplizierter Aufenthalt.
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
          es unbequem ist. Das ist die Richtung, in die wir das Haus führen —
          keine operative Garantie für Rundum-Service.
        </p>
        <p>
          Der Bär im Namen bleibt ein Hinweis, kein Maskottchen. Ein städtisches
          Haus mit Küche, Garten und Betten.
        </p>
      </section>

      <div className="mt-16">
        <ProofPrinciples />
      </div>

      <div className="content-reading mt-16">
        <Link
          to="/kontakt"
          className={buttonVariants({ variant: "green" })}
        >
          Kontakt
        </Link>
      </div>
    </main>
  );
}
