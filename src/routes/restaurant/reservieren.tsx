import { createFileRoute } from "@tanstack/react-router";
import { ReservationForm } from "@/components/forms/inquiry-forms";

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
            Sie schreiben uns, wir prüfen und bestätigen persönlich. Größere
            Runden bitte als Anlass anfragen.
          </p>
        </div>
        <div className="lg:col-span-7 rounded-md border border-charcoal-900/12 bg-white p-6 md:p-8">
          <ReservationForm />
        </div>
      </div>
    </main>
  );
}
