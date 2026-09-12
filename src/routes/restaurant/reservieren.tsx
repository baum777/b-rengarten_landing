import { createFileRoute } from "@tanstack/react-router";
import { ReservationForm } from "@/components/forms/inquiry-forms";
import { hours, site } from "@/lib/site";

export const Route = createFileRoute("/restaurant/reservieren")({
  component: ReservePage,
  head: () => ({
    meta: [{ title: "Tisch reservieren — Bärengarten Ravensburg" }],
  }),
});

function ReservePage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <div className="content-wide grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-wine-700">Restaurant</p>
          <h1 className="text-display-md mt-3">Tisch reservieren</h1>
          <p className="mt-4 text-lg text-charcoal-600">
            {hours.restaurant}. {hours.restaurantNote} Größere Runden bitte als
            Anlass anfragen.
          </p>
          <p className="mt-6 text-sm text-charcoal-600">
            Telefon{" "}
            <a href={site.phoneHref} className="underline underline-offset-4">
              {site.phone}
            </a>
          </p>
        </div>
        <div className="lg:col-span-7 rounded-md border border-charcoal-900/12 bg-white p-6 md:p-8">
          <ReservationForm />
        </div>
      </div>
    </main>
  );
}
