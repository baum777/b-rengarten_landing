import { createFileRoute } from "@tanstack/react-router";
import { PageHero, CtaBand } from "@/components/sections/page-hero";
import { EditorialSplit } from "@/components/sections/editorial";
import { ReservationForm } from "@/components/forms/inquiry-forms";
import { images } from "@/lib/site";

export const Route = createFileRoute("/restaurant/")({
  component: RestaurantPage,
  head: () => ({
    meta: [
      { title: "Restaurant — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Restaurant und Biergarten im Bärengarten Ravensburg. Restaurant und Garten gehören zusammen. Tisch persönlich anfragen.",
      },
    ],
  }),
});

function RestaurantPage() {
  return (
    <main>
      <PageHero
        image={images.restaurantInterior}
        alt="Restaurantinnenraum mit Eichentischen und Blick in den Garten"
        eyebrow="Table"
        title="Gut essen. Gut bleiben. Gern wiederkommen."
        kicker="Restaurant und Garten gehören zum selben Haus. Ein Tisch im Haus."
        actions={[
          { to: "/restaurant/reservieren", label: "Tisch reservieren", variant: "wine" },
          { to: "/restaurant/speisekarte", label: "Speisekarte", variant: "inverse" },
        ]}
      />

      <EditorialSplit
        eyebrow="Im Haus"
        title="Restaurant und Garten gehören zusammen."
        body="Große Öffnungen verbinden den Gastraum mit dem Garten. Die Küche liegt zentral zwischen den Bereichen des Hauses."
        image={images.gardenDay}
        alt="Biergarten unter Kastanien bei Tageslicht"
      />

      <section className="bg-paper-50">
        <div className="content-wide section-pad grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Speisen</p>
            <h2 className="text-display-md mt-4">Die Karte entsteht neu.</h2>
            <p className="mt-4 text-charcoal-600">
              Unsere Karte ist gerade im Aufbau. Was aktuell am Tag serviert
              wird, sagen wir Ihnen gern mit der Bestätigung Ihrer Anfrage.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper-100">
        <div className="content-wide section-pad grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Reservieren</p>
            <h2 className="text-display-md mt-4">Einen Tisch im Haus.</h2>
            <p className="mt-4 text-charcoal-600">
              Anfragen werden persönlich geprüft und bestätigt.
            </p>
          </div>
          <div className="lg:col-span-7 rounded-md border border-charcoal-900/12 bg-white p-6 md:p-8">
            <ReservationForm />
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
