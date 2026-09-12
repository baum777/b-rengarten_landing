import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/sections/page-hero";
import { OccasionForm } from "@/components/forms/inquiry-forms";
import { Photo } from "@/components/media/photo";
import { images, occasions } from "@/lib/site";

export const Route = createFileRoute("/anlaesse")({
  component: EventsPage,
  head: () => ({
    meta: [
      { title: "Anlässe — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Feiern, Familien, kleine Firmenrunden. Innen bis 200, Garten bis 400 Plätze. Anfrage an das Haus.",
      },
    ],
  }),
});

function EventsPage() {
  return (
    <main>
      <PageHero
        image={images.eventsTable}
        alt="Langer gedeckter Tisch für eine Feier im Restaurant"
        eyebrow="Together"
        title="Zusammenkommen, ohne Großevent."
        kicker="Familienfeste, Firmenessen, der wichtige Abend. Wir sagen ehrlich, was das Haus kann."
        compact
      />

      <section className="bg-paper-50">
        <div className="content-wide section-pad grid gap-8 md:grid-cols-3">
          {occasions.map((item) => (
            <article key={item.title} className="border-t border-charcoal-900/16 pt-6">
              <h2 className="font-display text-3xl tracking-tight">{item.title}</h2>
              <p className="mt-3 text-charcoal-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-paper-100">
        <div className="content-wide section-pad grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Anfrage</p>
            <h2 className="text-display-md mt-4">Sagen Sie uns den Anlass.</h2>
            <p className="mt-4 text-charcoal-600">
              Wir prüfen Küche, Raum und Datum und antworten persönlich. Kein
              Online-Konfigurator.
            </p>
            <Photo
              src={images.restaurantInterior}
              alt="Restaurant mit Blick in den Garten"
              ratio="3 / 2"
              className="mt-8 rounded-md"
            />
          </div>
          <div className="lg:col-span-7 rounded-md border border-charcoal-900/12 bg-white p-6 md:p-8">
            <OccasionForm />
          </div>
        </div>
      </section>
    </main>
  );
}
