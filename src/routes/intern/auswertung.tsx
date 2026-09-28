import { z } from "zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getEvaluation } from "@/lib/operations/functions";
import type {
  EvaluationInquiries,
  EvaluationOccupancy,
  EvaluationPage,
  EvaluationTasks,
} from "../../../scripts/operations.d.mts";
import {
  departmentLabel,
  formatClock,
  formatDateShort,
  formatDuration,
  formatPercent,
  inquiryStatusLabel,
  inquiryTypeLabel,
} from "@/lib/dashboard/model";

const searchSchema = z.object({
  // non-numeric ids: TanStack JSON-roundtrips search params, so a plain
  // "30" would come back as the number 30 and fail the string enum
  days: z.enum(["30tage", "90tage"]).default("30tage"),
});

export const Route = createFileRoute("/intern/auswertung")({
  head: () => ({
    meta: [{ title: "Auswertung — Bärengarten Betrieb" }],
  }),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ days: search.days }),
  loader: ({ deps }) => getEvaluation({ data: { days: deps.days } }),
  component: EvaluationPageView,
});

const RANGES = [
  { id: "30tage", label: "30 Tage" },
  { id: "90tage", label: "90 Tage" },
] as const;

const num = (n: number, digits = 1): string =>
  n.toLocaleString("de-DE", { maximumFractionDigits: digits });

function RangeSwitch({ active }: { active: "30tage" | "90tage" }) {
  return (
    <div className="mt-6 flex gap-1" role="navigation" aria-label="Zeitraum">
      {RANGES.map((option) => (
        <Link
          key={option.id}
          to="/intern/auswertung"
          search={{ days: option.id }}
          aria-current={active === option.id ? "true" : undefined}
          className={
            "flex min-h-11 items-center rounded-xs px-3 text-sm " +
            (active === option.id
              ? "bg-green-800 text-paper-50"
              : "text-charcoal-600 hover:bg-paper-100")
          }
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

/** Honest horizontal bars: width is the exact share, the number sits in text. */
function Pipeline({ data }: { data: EvaluationInquiries }) {
  const rows = [
    { status: "NEW", count: data.s_new },
    { status: "REVIEWED", count: data.s_reviewed },
    { status: "CONTACTED", count: data.s_contacted },
    { status: "CONFIRMED", count: data.s_confirmed },
    { status: "DECLINED", count: data.s_declined },
    { status: "CLOSED", count: data.s_closed },
  ];
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {rows.map(({ status, count }) => (
        <li key={status} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-charcoal-600">
            {inquiryStatusLabel(status)}
          </span>
          <span
            aria-hidden
            className="h-2 rounded-xs bg-green-800/80"
            style={{ width: data.total > 0 ? `${(count / data.total) * 60}%` : "0%" }}
          />
          <span className="tabular-nums">{count}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionEmpty({ children }: { children: string }) {
  return (
    <p className="mt-3 rounded-xl border border-charcoal-900/10 bg-card p-5 text-sm text-charcoal-600">
      {children}
    </p>
  );
}

function InquiriesSection({ data }: { data: EvaluationInquiries }) {
  if (data.total === 0) {
    return <SectionEmpty>Keine Anfragen im Zeitraum.</SectionEmpty>;
  }
  return (
    <>
      <Pipeline data={data} />
      <dl className="micro mt-4 space-y-1 text-charcoal-600">
        <div className="flex justify-between gap-2">
          <dt>Nach Art</dt>
          <dd className="tabular-nums">
            {inquiryTypeLabel("ROOM")} {data.t_room} ·{" "}
            {inquiryTypeLabel("TABLE")} {data.t_table} ·{" "}
            {inquiryTypeLabel("OCCASION")} {data.t_occasion}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Reaktionszeit (ereignisbelegt)</dt>
          <dd className="tabular-nums">
            {data.responded > 0 && data.avg_response_minutes !== null
              ? `${formatDuration(Math.round(data.avg_response_minutes))} · bei ${data.responded} von ${data.total} Anfragen`
              : "keine Statuswechsel erfasst"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Vorlauf bis Anreise</dt>
          <dd className="tabular-nums">
            {data.avg_lead_days !== null
              ? `Ø ${num(data.avg_lead_days)} Tage · bei ${data.with_arrival} von ${data.total} Anfragen`
              : "keine Anreisedaten erfasst"}
          </dd>
        </div>
      </dl>
    </>
  );
}

function TasksSection({ data }: { data: EvaluationTasks }) {
  if (data.created === 0 && data.completed === 0) {
    return <SectionEmpty>Keine Aufgaben im Zeitraum.</SectionEmpty>;
  }
  return (
    <>
      <p className="mt-3 text-sm text-charcoal-600">
        {data.created} neu angelegt · {data.completed} erledigt
      </p>
      <dl className="micro mt-4 space-y-1 text-charcoal-600">
        <div className="flex justify-between gap-2">
          <dt>Dauer bis Erledigung</dt>
          <dd className="tabular-nums">
            {data.completed > 0 && data.avg_complete_hours !== null
              ? `Ø ${formatDuration(Math.round(data.avg_complete_hours * 60))}`
              : "keine Abschlüsse im Zeitraum"}
          </dd>
        </div>
        {data.by_department.map((row) => (
          <div key={row.department} className="flex justify-between gap-2">
            <dt>Erledigt · {departmentLabel(row.department)}</dt>
            <dd className="tabular-nums">{row.completed}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function OccupancySection({
  data,
  windowDays,
}: {
  data: EvaluationOccupancy;
  windowDays: number;
}) {
  if (data.days_captured === 0) {
    return (
      <SectionEmpty>
        Keine Belegungswerte im Zeitraum. Tageswerte werden auf der Seite
        Auslastung erfasst.
      </SectionEmpty>
    );
  }
  return (
    <dl className="micro mt-3 space-y-1 text-charcoal-600">
      <div className="flex justify-between gap-2">
        <dt>Erfasste Tage</dt>
        <dd className="tabular-nums">
          {data.days_captured} von {windowDays}
        </dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt>Ø Auslastung</dt>
        <dd className="tabular-nums">{formatPercent(data.avg_rate)}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt>An-/Abreisen (Summe)</dt>
        <dd className="tabular-nums">
          {data.arrivals_total} / {data.departures_total}
        </dd>
      </div>
      {data.best ? (
        <div className="flex justify-between gap-2">
          <dt>Stärkster Tag</dt>
          <dd className="tabular-nums">
            {formatDateShort(data.best.date)} · {formatPercent(data.best.rate)}
          </dd>
        </div>
      ) : null}
      {data.worst ? (
        <div className="flex justify-between gap-2">
          <dt>Schwächster Tag</dt>
          <dd className="tabular-nums">
            {formatDateShort(data.worst.date)} · {formatPercent(data.worst.rate)}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function EvaluationPageView() {
  const page = Route.useLoaderData() as EvaluationPage;
  const days = Route.useSearch().days;
  return (
    <section className="max-w-3xl">
      <p className="eyebrow text-wine-700">Steuerung</p>
      <h1 className="text-display-md mt-3">Auswertung</h1>
      <p className="mt-3 text-sm text-charcoal-600">
        Letzte {page.window.days} Tage (seit {formatDateShort(page.window.from)}) ·
        Datenstand {formatClock(page.generated_at)} Uhr
      </p>
      <RangeSwitch active={days} />

      <h2 className="eyebrow mt-10 text-charcoal-600">Anfragen</h2>
      <div className="mt-3 rounded-xl border border-charcoal-900/10 bg-card p-5">
        <InquiriesSection data={page.inquiries} />
      </div>

      <h2 className="eyebrow mt-10 text-charcoal-600">Aufgaben</h2>
      <div className="mt-3 rounded-xl border border-charcoal-900/10 bg-card p-5">
        <TasksSection data={page.tasks} />
      </div>

      <h2 className="eyebrow mt-10 text-charcoal-600">Belegung</h2>
      <div className="mt-3 rounded-xl border border-charcoal-900/10 bg-card p-5">
        <OccupancySection data={page.occupancy} windowDays={page.window.days} />
      </div>
    </section>
  );
}
