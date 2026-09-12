import { createFileRoute } from "@tanstack/react-router";
import { PageHero, CtaBand } from "@/components/sections/page-hero";
import { EditorialSplit, StatusLine } from "@/components/sections/editorial";
import { ReservationForm } from "@/components/forms/inquiry-forms";
import { Photo } from "@/components/media/photo";
import { hours, images, menuPreview } from "@/lib/site";

export const Route = createFileRoute("/restaurant/")({
  component: RestaurantPage,
  head: () => ({
    meta: [
      { title: "Restaurant — Bärengarten Ravensburg" },
      {
        name: "description",
        content:
          "Restaurant in Ravensburg. Schwäbische Küche, Grill, Tageskarte. Tisch reservieren.",
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
        kicker="Küche mit Herkunft und ohne Umstände. Ein Tisch, der ein Tisch bleibt."
        actions={[
          { to: "/restaurant/reservieren", label: "Tisch reservieren", variant: "wine" },
          { to: "/restaurant/speisekarte", label: "Speisen", variant: "inverse" },
        ]}
      />

      <section className="bg-paper-50">
        <div className="content-wide py-10 flex flex-wrap items-center justify-between gap-4">
          <StatusLine label={`Heute: ${hours.restaurant}`} />
          <p className="text-sm text-charcoal-600">{hours.restaurantNote}</p>
        </div>
      </section>

      <EditorialSplit
        eyebrow="Küche"
        title="Qualität, die man sieht."
        body="Zwiebelrostbraten, Maultaschen, Grill — Teller, die man erkennt. Kein Schaum, keine Vergleiche, die wir nicht belegen."
        image={images.foodRoast}
        alt="Angerichteter Braten mit Saft und Gemüse"
      />

      <section className="bg-paper-50">
        <div className="content-wide section-pad grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Speisen</p>
            <h2 className="text-display-md mt-4">Eine Auswahl. Keine ewige Karte.</h2>
            <p className="mt-4 text-charcoal-600">
              Was wir kochen, hängt vom Tag ab. Die aktuelle Karte liegt im Haus
              und folgt auf Anfrage.
            </p>
          </div>
          <div className="lg:col-span-7 grid gap-10 sm:grid-cols-2">
            {menuPreview.map((group) => (
              <div key={group.group}>
                <h3 className="eyebrow text-charcoal-600">{group.group}</h3>
                <ul className="mt-4 space-y-5">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <p className="font-display text-2xl tracking-tight">{item.name}</p>
                      <p className="text-charcoal-600 mt-1">{item.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EditorialSplit
        eyebrow="Haltung"
        title="Qualität und Ehrlichkeit."
        body="Wir kochen, was wir vertreten können. Herkunft aus der Region, wo sie Sinn ergibt — nicht als Slogan auf jeder Speisekarte."
        image={images.kitchen}
        alt="Küche beim Anrichten von gegrilltem Rind"
        reverse
      />

      <section className="bg-paper-100">
        <div className="content-wide section-pad grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="eyebrow text-wine-700">Reservieren</p>
            <h2 className="text-display-md mt-4">Einen Tisch, keine Wartenummer.</h2>
            <Photo
              src={images.hostService}
              alt="Service am gedeckten Tisch"
              ratio="3 / 4"
              className="mt-8 rounded-md hidden lg:block"
            />
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
