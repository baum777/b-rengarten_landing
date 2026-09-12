import { createFileRoute } from "@tanstack/react-router";
import { BookingForm } from "@/components/forms/inquiry-forms";
import { site } from "@/lib/site";
import { z } from "zod";

const searchSchema = z.object({
  anreise: z.string().optional(),
  abreise: z.string().optional(),
  gaeste: z.string().optional(),
});

export const Route = createFileRoute("/hotel/buchen")({
  component: BookingPage,
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Zimmer anfragen — Bärengarten Ravensburg" }],
  }),
});

function BookingPage() {
  const search = Route.useSearch();
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <div className="content-wide grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-wine-700">Hotel</p>
          <h1 className="text-display-md mt-3">Zimmer anfragen</h1>
          <p className="mt-4 text-lg text-charcoal-600">
            Keine anonyme Buchungsmaschine. Sie schreiben uns, wir prüfen und
            bestätigen. Wenn es schnell gehen muss: {site.phone}.
          </p>
        </div>
        <div className="lg:col-span-7 rounded-md border border-charcoal-900/12 bg-white p-6 md:p-8">
          <BookingForm
            defaults={{
              arrival: search.anreise,
              departure: search.abreise,
              guests: search.gaeste,
            }}
          />
        </div>
      </div>
    </main>
  );
}
