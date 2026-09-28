import { useState, type FormEvent } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOccupancy, getOccupancy } from "@/lib/operations/functions";
import { OccupancyTrendChart } from "@/components/internal/dashboard/charts";
import type { OccupancyPage } from "../../../scripts/operations.d.mts";
import {
  formatClock,
  formatDateShort,
  formatPercent,
  percentPointsDelta,
} from "@/lib/dashboard/model";

export const Route = createFileRoute("/intern/auslastung")({
  head: () => ({
    meta: [{ title: "Auslastung — Bärengarten Betrieb" }],
  }),
  loader: () => getOccupancy(),
  component: OccupancyPageView,
});

/** Headline state for the current day — or the most recent capture. */
function SnapshotHeadline({ page }: { page: OccupancyPage }) {
  const s = page.today_snapshot ?? page.latest_snapshot;
  if (!s) {
    return (
      <p className="mt-3 text-sm text-charcoal-600">
        Noch keine Belegungswerte erfasst.
      </p>
    );
  }
  if (page.today_snapshot) {
    return (
      <p className="mt-3 text-sm text-charcoal-600">
        Heute erfasst · {formatClock(page.today_snapshot.captured_at)} Uhr
      </p>
    );
  }
  return (
    <p className="mt-3 text-sm text-charcoal-600">
      Für heute noch nicht erfasst · letzter Wert vom{" "}
      {formatDateShort(s.date)}
    </p>
  );
}

function SnapshotCard({ page }: { page: OccupancyPage }) {
  const s = page.today_snapshot ?? page.latest_snapshot;
  if (!s) {
    return (
      <p className="mt-8 rounded-xl border border-charcoal-900/10 bg-card p-6 text-sm text-charcoal-600">
        Für heute ist noch kein Belegungswert erfasst. Erfassen Sie den
        Tageswert unten — der Trend entsteht, sobald Tage vorliegen.
      </p>
    );
  }
  const isToday = page.today_snapshot !== null;
  return (
    <div className="mt-8 rounded-xl border border-charcoal-900/10 bg-card p-6">
      <p className="micro text-charcoal-600">
        {isToday ? "Heute" : `Letzter erfasster Tag · ${formatDateShort(s.date)}`}
      </p>
      <p className="mt-2 text-display-lg text-charcoal-900">
        {formatPercent(s.occupancy_rate)}
      </p>
      <p className="mt-2 text-sm text-charcoal-600">
        {s.rooms_occupied} von {s.rooms_total} Zimmern belegt · {s.rooms_free}{" "}
        frei · Anreisen {s.arrivals ?? "–"} · Abreisen {s.departures ?? "–"}
      </p>
      <p className="micro mt-2 text-charcoal-600">
        Erfasst {formatClock(s.captured_at)} Uhr · Quelle{" "}
        {s.source === "manual" ? "manuell" : s.source}
      </p>
    </div>
  );
}

function TrendSection({ page }: { page: OccupancyPage }) {
  if (page.days.length === 0) return null;
  const points = page.days.map((d) => ({ date: d.date, value: d.occupancy_rate }));
  const delta = percentPointsDelta(page.compare.current_avg, page.compare.previous_avg);
  return (
    <>
      <h2 className="eyebrow mt-10 text-charcoal-600">Verlauf · 30 Tage</h2>
      <div className="mt-3 rounded-xl border border-charcoal-900/10 bg-card p-5">
        <OccupancyTrendChart points={points} />
        <p className="micro mt-3 text-charcoal-600">
          Ø 30 Tage: {formatPercent(page.compare.current_avg)} · Ø vorherige 30
          Tage: {formatPercent(page.compare.previous_avg)}
          {delta ? ` (${delta} %-Punkte)` : ""}
        </p>
      </div>
    </>
  );
}

function HistorySection({ page }: { page: OccupancyPage }) {
  const rows = page.days.slice(-14).reverse();
  if (rows.length === 0) return null;
  return (
    <>
      <h2 className="eyebrow mt-10 text-charcoal-600">Historie</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((d) => (
          <li
            key={d.date}
            className="rounded-lg border border-charcoal-900/10 bg-card px-4 py-3 text-sm"
          >
            <span className="font-medium">{formatDateShort(d.date)}</span>
            <span className="text-charcoal-600">
              {" · "}
              {formatPercent(d.occupancy_rate)}
              {" · "}
              {d.rooms_occupied}/{d.rooms_total} belegt
              {" · An "}
              {d.arrivals ?? "–"}
              {" / Ab "}
              {d.departures ?? "–"}
              {" · "}
              {formatClock(d.captured_at)} Uhr
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Daily capture form over the existing audited writer (recordOccupancy):
 * strict server-side validation (whole numbers, free + occupied ≤ total,
 * total ≥ 1) is mirrored here only to fail fast — the server stays the gate.
 */
function CaptureForm({ page }: { page: OccupancyPage }) {
  const router = useRouter();
  const capacity = String(
    (page.today_snapshot ?? page.latest_snapshot)?.rooms_total ?? "",
  );
  const [date, setDate] = useState(page.today);
  const [total, setTotal] = useState(capacity);
  const [free, setFree] = useState("");
  const [occupied, setOccupied] = useState("");
  const [arrivals, setArrivals] = useState("");
  const [departures, setDepartures] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function requireInt(value: string): number | string {
    if (value.trim() === "") return "Bitte alle Zimmerzahlen angeben.";
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) return "Bitte ganze Zahlen ab 0 eingeben.";
    return n;
  }

  function optionalInt(value: string): number | null | string {
    if (value.trim() === "") return null;
    return requireInt(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setSaved("");
    const roomsTotal = requireInt(total);
    const roomsAvailable = requireInt(free);
    const roomsOccupied = requireInt(occupied);
    const arr = optionalInt(arrivals);
    const dep = optionalInt(departures);
    if (typeof roomsTotal === "string") return setError(roomsTotal);
    if (typeof roomsAvailable === "string") return setError(roomsAvailable);
    if (typeof roomsOccupied === "string") return setError(roomsOccupied);
    if (typeof arr === "string") return setError(arr);
    if (typeof dep === "string") return setError(dep);
    if (roomsTotal < 1) {
      return setError("Zimmer gesamt muss mindestens 1 sein.");
    }
    if (roomsAvailable + roomsOccupied > roomsTotal) {
      return setError(
        "Zimmer frei plus Zimmer belegt darf Zimmer gesamt nicht überschreiten.",
      );
    }
    setBusy(true);
    try {
      await addOccupancy({
        data: {
          date,
          roomsTotal,
          roomsAvailable,
          roomsOccupied,
          arrivals: arr,
          departures: dep,
        },
      });
      setSaved(`Tageswert für ${formatDateShort(date)} erfasst.`);
      await router.invalidate();
    } catch {
      setError(
        "Der Tageswert konnte nicht gespeichert werden. Bitte erneut versuchen.",
      );
    } finally {
      setBusy(false);
    }
  }

  const numberField = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    optional = false,
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{optional ? `${label} (optional)` : label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        required={!optional}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="occ-date">Datum</Label>
          <Input
            id="occ-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {numberField("occ-total", "Zimmer gesamt", total, setTotal)}
        {numberField("occ-free", "Zimmer frei", free, setFree)}
        {numberField("occ-occupied", "Zimmer belegt", occupied, setOccupied)}
        {numberField("occ-arrivals", "Anreisen", arrivals, setArrivals, true)}
        {numberField("occ-departures", "Abreisen", departures, setDepartures, true)}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-green-800">
          {saved}
        </p>
      ) : null}
      <div>
        <Button type="submit" variant="green" disabled={busy}>
          {busy ? "Wird erfasst…" : "Tageswert erfassen"}
        </Button>
      </div>
    </form>
  );
}

function OccupancyPageView() {
  const page = Route.useLoaderData();
  return (
    <section className="max-w-3xl">
      <p className="eyebrow text-wine-700">Betrieb</p>
      <h1 className="text-display-md mt-3">Auslastung</h1>
      <SnapshotHeadline page={page} />

      <SnapshotCard page={page} />
      <TrendSection page={page} />
      <HistorySection page={page} />

      <h2 className="eyebrow mt-10 text-charcoal-600">Tageswert erfassen</h2>
      <p className="mt-2 text-sm text-charcoal-600">
        Ein neuer Wert für dasselbe Datum ersetzt die Anzeige des Tages —
        erfasst wird zusätzlich, korrigiert wird nie.
      </p>
      <CaptureForm page={page} />
    </section>
  );
}
