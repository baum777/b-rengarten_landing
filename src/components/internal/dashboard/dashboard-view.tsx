import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ATTENTION_CLEAR,
  buildAttention,
  departmentLabel,
  fillDailyInquiryPoints,
  fillDailySeries,
  fillHourlySeries,
  formatClock,
  formatDueLabel,
  formatGuests,
  formatPercent,
  formatStay,
  inquiryPointTotal,
  inquiryStatusLabel,
  inquiryTypeLabel,
  percentPointsDelta,
  priorityLabel,
  relativeAge,
  taskStatusLabel,
  type DashboardData,
  type RangeId,
  type RecentInquiry,
} from "@/lib/dashboard/model";
import { InquiryTrendChart, OccupancyTrendChart, Sparkline } from "./charts";

const RANGE_OPTIONS: { id: RangeId; label: string }[] = [
  { id: "heute", label: "Heute" },
  { id: "7tage", label: "7 Tage" },
  { id: "30tage", label: "30 Tage" },
];

const rangeMeta: Record<RangeId, string> = {
  heute: "heute",
  "7tage": "letzte 7 Tage",
  "30tage": "letzte 30 Tage",
};

function KpiCard({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-charcoal-900/10 bg-card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="eyebrow text-charcoal-600">{title}</h3>
        {meta ? <span className="micro text-charcoal-600">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

/**
 * A source that does not (yet) exist is a state, never a "Keine Daten" KPI.
 */
function SourceState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mt-3 rounded-md border border-dashed border-charcoal-900/20 px-4 py-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-charcoal-600">{detail}</p>
    </div>
  );
}

function assignmentLabel(inquiry: RecentInquiry): string {
  if (!inquiry.task_status) return "ohne Folgetask";
  if (inquiry.task_status === "DONE" || inquiry.task_status === "CANCELLED")
    return "bearbeitet";
  if (inquiry.task_assignee) return `zugewiesen an ${inquiry.task_assignee}`;
  return "noch nicht übernommen";
}

export function DashboardView({ data }: { data: DashboardData }) {
  const attention = buildAttention(data.counts);
  const occupancy = data.occupancy_today;

  const occupancyDaily = fillDailySeries(
    data.today,
    data.occupancy_series,
    data.range.days,
  );
  const inquiryDaily =
    data.inquiry_series.granularity === "day"
      ? fillDailyInquiryPoints(data.today, data.inquiry_series.points, data.range.days)
      : fillHourlySeries(data.today, data.inquiry_series.points, data.generated_at);
  const taskWeekly = fillDailySeries(data.today, data.task_series, 7);

  const occupancyDelta = percentPointsDelta(
    data.occupancy_compare.current_avg,
    data.occupancy_compare.previous_avg,
  );
  const lastCaptured = data.occupancy_series[data.occupancy_series.length - 1];

  const occupancySpark = occupancyDaily.slice(-7).map((p) => p.value);
  const demandSpark = inquiryDaily.slice(-7).map(inquiryPointTotal);
  const taskSpark = taskWeekly.map((p) => p.value);
  const demandTrendLabel =
    data.inquiry_series.granularity === "hour"
      ? "Anfragen heute nach Stunde"
      : "Anfragen je Tag";

  return (
    <section>
      {/* ---------------------------------------------------------- Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-wine-700">Betrieb</p>
          <h1 className="text-display-md mt-2">Dashboard</h1>
          <p className="mt-1 text-charcoal-600">Betrieb im Überblick</p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <nav
            aria-label="Zeitraum der Trendansicht"
            className="inline-flex rounded-sm border border-charcoal-900/16 p-0.5"
          >
            {RANGE_OPTIONS.map((option) => {
              const active = data.range.id === option.id;
              return (
                <Link
                  key={option.id}
                  to="/intern/dashboard"
                  search={{ range: option.id }}
                  aria-current={active ? "true" : undefined}
                  className={
                    "flex min-h-11 items-center rounded-xs px-3 text-sm " +
                    (active
                      ? "bg-green-800 text-paper-50"
                      : "text-charcoal-600 hover:bg-paper-100")
                  }
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
          <p className="micro text-charcoal-600">
            Datenstand {formatClock(data.generated_at)} Uhr
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------- Attention */}
      <section aria-labelledby="attention-heading" className="mt-6">
        <h2 id="attention-heading" className="sr-only">
          Aufmerksamkeit
        </h2>
        {attention.length === 0 ? (
          <p className="flex items-center gap-3 rounded-lg border border-charcoal-900/10 bg-paper-100 px-4 py-3 text-sm">
            <span aria-hidden className="text-green-800">
              ●
            </span>
            <span>
              <span className="font-medium">{ATTENTION_CLEAR.title}</span>{" "}
              <span className="text-charcoal-600">{ATTENTION_CLEAR.detail}</span>
            </span>
          </p>
        ) : (
          <ul className="space-y-2">
            {attention.map((item) => (
              <li
                key={item.id}
                className={
                  "flex items-start gap-3 rounded-lg border border-l-4 border-charcoal-900/10 bg-card px-4 py-3 " +
                  (item.severity === "critical" ? "border-l-error" : "border-l-warning")
                }
              >
                <span
                  aria-hidden
                  className={
                    "mt-0.5 text-sm " +
                    (item.severity === "critical" ? "text-error" : "text-warning")
                  }
                >
                  {item.severity === "critical" ? "▲" : "●"}
                </span>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{item.title}</span>{" "}
                    <span
                      className={
                        "micro " + (item.severity === "critical" ? "text-error" : "text-warning")
                      }
                    >
                      {item.severityLabel}
                    </span>
                  </p>
                  <p className="text-sm text-charcoal-600">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------ KPI groups */}
      <h2 className="sr-only">Kennzahlen</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Auslastung"
          meta={occupancy ? `Stand ${formatClock(occupancy.captured_at)}` : "PMS"}
        >
          {occupancy ? (
            <>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl tabular-nums">
                  {formatPercent(occupancy.occupancy_rate)}
                </span>
                {occupancyDelta ? (
                  <span className="text-sm text-charcoal-600">{occupancyDelta} pp Vorperiode</span>
                ) : null}
              </p>
              <p className="mt-1 text-sm text-charcoal-600">
                {occupancy.rooms_occupied}/{occupancy.rooms_total} Zimmer belegt
              </p>
              {occupancySpark.length > 1 ? (
                <div className="mt-3">
                  <Sparkline values={occupancySpark} />
                </div>
              ) : null}
              <p className="micro mt-auto pt-3 text-charcoal-600">
                Quelle: {occupancy.source === "manual" ? "manuelle Erfassung" : occupancy.source}
              </p>
            </>
          ) : (
            <>
              <SourceState
                title="PMS noch nicht verbunden"
                detail="Auslastung, Anreisen und Abreisen werden verfügbar, sobald eine Hotel-Datenquelle verbunden ist."
              />
              {lastCaptured ? (
                <p className="micro mt-2 text-charcoal-600">
                  Letzter erfasster Tag: {lastCaptured.date}
                </p>
              ) : null}
            </>
          )}
        </KpiCard>

        <KpiCard title="Nachfrage" meta="Website · live">
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl tabular-nums">
              {data.counts.open_inquiries}
            </span>
            <span className="text-sm text-charcoal-600">
              offen · {data.counts.new_inquiries_today} neu heute
            </span>
          </p>
          {data.counts.stale_inquiries > 0 ? (
            <p className="mt-1 text-sm text-warning">
              ● {data.counts.stale_inquiries} länger als 24 h offen
            </p>
          ) : (
            <p className="mt-1 text-sm text-charcoal-600">Alle Eingänge unter 24 h</p>
          )}
          {demandSpark.length > 1 ? (
            <div className="mt-3">
              <Sparkline values={demandSpark} />
            </div>
          ) : null}
          <p className="micro mt-auto pt-3 text-charcoal-600">
            {demandTrendLabel} · älteste offene{" "}
            {relativeAge(data.counts.oldest_new_inquiry_at, data.generated_at) || "–"}
          </p>
        </KpiCard>

        <KpiCard title="Aufgaben" meta="Betrieb">
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl tabular-nums">{data.counts.open_tasks}</span>
            <span className="text-sm text-charcoal-600">
              offen · {data.counts.completed_tasks_today} heute erledigt
            </span>
          </p>
          {data.counts.overdue_tasks > 0 ? (
            <p className="mt-1 text-sm text-error">
              ▲ {data.counts.overdue_tasks} überfällig
            </p>
          ) : null}
          {data.counts.blocked_tasks > 0 ? (
            <p className="mt-1 text-sm text-warning">
              ● {data.counts.blocked_tasks} blockiert
            </p>
          ) : null}
          {taskSpark.length > 1 ? (
            <div className="mt-3">
              <Sparkline values={taskSpark} />
            </div>
          ) : null}
          <p className="micro mt-auto pt-3 text-charcoal-600">Erledigt je Tag (7 Tage)</p>
          <Link
            to="/intern/heute"
            className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4 hover:text-wine-700"
          >
            Meine Aufgaben öffnen
          </Link>
        </KpiCard>

        <KpiCard title="Heute" meta="Betrieb">
          <dl className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-charcoal-600">Anreisen</dt>
              <dd className="font-display text-2xl tabular-nums">
                {occupancy?.arrivals ?? "–"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-charcoal-600">Abreisen</dt>
              <dd className="font-display text-2xl tabular-nums">
                {occupancy?.departures ?? "–"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-charcoal-600">Aktive Mitarbeitende</dt>
              <dd className="font-display text-2xl tabular-nums">
                {data.counts.active_staff}
              </dd>
            </div>
          </dl>
          {!occupancy ? (
            <p className="micro mt-auto pt-3 text-charcoal-600">
              An-/Abreisen ohne Hotel-Datenquelle nicht verfügbar.
            </p>
          ) : null}
        </KpiCard>
      </div>

      {/* ---------------------------------------------------------- Trends */}
      <h2 className="sr-only">Trends</h2>
      <div className="mt-4 hidden gap-4 md:grid md:grid-cols-1 lg:grid-cols-2">
        <section className="rounded-xl border border-charcoal-900/10 bg-card p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="eyebrow text-charcoal-600">Auslastung</h3>
            <span className="micro text-charcoal-600">{rangeMeta[data.range.id]}</span>
          </div>
          {occupancyDaily.length > 0 ? (
            <div className="mt-4">
              <OccupancyTrendChart points={occupancyDaily} />
            </div>
          ) : (
            <SourceState
              title="Keine Auslastungsdaten im Zeitraum"
              detail="Erfasste Tageswerte erscheinen hier, sobald eine Hotel-Datenquelle verbunden oder Werte manuell erfasst sind."
            />
          )}
        </section>
        <section className="rounded-xl border border-charcoal-900/10 bg-card p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="eyebrow text-charcoal-600">Anfragen</h3>
            <span className="micro text-charcoal-600">
              {data.inquiry_series.granularity === "hour" ? "heute, je Stunde" : rangeMeta[data.range.id]}
            </span>
          </div>
          <div className="mt-4">
            <InquiryTrendChart
              points={inquiryDaily}
              granularity={data.inquiry_series.granularity}
            />
          </div>
        </section>
      </div>

      {/* ----------------------------------------------------- Action lists */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section aria-labelledby="inquiries-heading" className="rounded-xl border border-charcoal-900/10 bg-card p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="inquiries-heading" className="font-display text-xl">
              Aktuelle Anfragen
            </h2>
            <span className="micro text-charcoal-600">Website · live</span>
          </div>
          {data.recent_inquiries.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal-600">Noch keine Anfragen.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.recent_inquiries.map((inquiry) => (
                <li
                  key={inquiry.request_id}
                  className="rounded-lg border border-charcoal-900/10 p-4"
                >
                  <p className="eyebrow text-charcoal-600">
                    {inquiryTypeLabel(inquiry.type)} · {inquiryStatusLabel(inquiry.status)}
                  </p>
                  <p className="mt-1.5 font-medium">{inquiry.guest_name}</p>
                  <p className="mt-0.5 text-sm text-charcoal-600">
                    {[
                      formatStay(inquiry.arrival, inquiry.departure),
                      formatGuests(inquiry.guest_count),
                      inquiry.room,
                      inquiry.occasion,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="micro mt-2 text-charcoal-600">
                    {relativeAge(inquiry.created_at, data.generated_at)} ·{" "}
                    {assignmentLabel(inquiry)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="tasks-heading" className="rounded-xl border border-charcoal-900/10 bg-card p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="tasks-heading" className="font-display text-xl">
              Aufgaben mit Handlungsbedarf
            </h2>
            <span className="micro text-charcoal-600">Betrieb</span>
          </div>
          {data.action_tasks.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal-600">Keine offenen Aufgaben.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.action_tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-charcoal-900/10 p-4"
                >
                  <div>
                    <p className="eyebrow text-charcoal-600">
                      {departmentLabel(task.department)} · {priorityLabel(task.priority)}
                    </p>
                    <p className="mt-1.5 font-medium">{task.title}</p>
                    <p
                      className={
                        "micro mt-2 " + (task.overdue ? "text-error" : "text-charcoal-600")
                      }
                    >
                      {taskStatusLabel(task.status)} ·{" "}
                      {formatDueLabel(task.due_at, data.generated_at, task.overdue)} ·{" "}
                      {task.assignee_name ?? "nicht zugewiesen"}
                    </p>
                  </div>
                  {task.status === "BLOCKED" ? (
                    <span className="micro rounded-xs border border-warning px-2 py-1 text-warning">
                      Blockiert
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ------------------------------------------------------ Data health */}
      <section aria-labelledby="health-heading" className="mt-4 rounded-xl border border-charcoal-900/10 bg-card p-5">
        <h2 id="health-heading" className="eyebrow text-charcoal-600">
          Datenquellen
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {[
            { name: "Website", state: "Live", live: true },
            { name: "Aufgaben", state: "Live", live: true },
            { name: "Team", state: "Live", live: true },
            { name: "PMS", state: "Nicht verbunden", live: false },
          ].map((source) => (
            <div key={source.name}>
              <dt className="text-sm">{source.name}</dt>
              <dd className="mt-0.5 flex items-center gap-2 text-sm text-charcoal-600">
                <span
                  aria-hidden
                  className={
                    source.live
                      ? "inline-block h-2 w-2 rounded-full bg-success"
                      : "inline-block h-2 w-2 rounded-full border border-charcoal-600"
                  }
                />
                {source.state}
              </dd>
            </div>
          ))}
        </dl>
        <p className="micro mt-4 text-charcoal-600">
          Datenstand {formatClock(data.generated_at)} Uhr
          {occupancy?.source === "manual"
            ? ` · Auslastung manuell erfasst, zuletzt ${formatClock(occupancy.captured_at)} Uhr`
            : ""}
        </p>
      </section>
    </section>
  );
}
