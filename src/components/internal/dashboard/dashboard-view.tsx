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
  formatDuration,
  formatGuests,
  formatPercent,
  formatStay,
  inquiryPointTotal,
  inquiryStatusLabel,
  inquiryTypeLabel,
  percentPointsDelta,
  priorityLabel,
  readMetricValues,
  relativeAge,
  taskStatusLabel,
  type DashboardData,
  type OccupancyToday,
  type RangeId,
  type RecentInquiry,
} from "@/lib/dashboard/model";
import { buildDataHealth } from "@/lib/metrics/data-quality";
import {
  CLASS_LABELS,
  DASHBOARD_GROUPS,
  DASHBOARD_TREND_GROUP,
  METRICS,
  OWNER_LABELS,
  dataSourceById,
  evaluateMetric,
  formatThresholds,
  requiredMetric,
  type DashboardCardDefinition,
  type MetricDefinition,
  type MetricLevel,
} from "@/lib/metrics/registry";
import { CRITICAL_SUCCESS_FACTORS } from "@/lib/metrics/csf";
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

/** Status colour follows the registry level — never the brand colour. */
const levelText: Record<MetricLevel, string> = {
  ok: "text-success",
  over_target: "text-warning",
  warning: "text-warning",
  critical: "text-error",
  unrated: "text-charcoal-600",
  unavailable: "text-charcoal-600",
};

const levelMarker: Record<MetricLevel, string> = {
  ok: "",
  over_target: "●",
  warning: "●",
  critical: "▲",
  unrated: "",
  unavailable: "",
};

const levelWord: Record<MetricLevel, string> = {
  ok: "im Ziel",
  over_target: "über Zielwert",
  warning: "Warnung",
  critical: "kritisch",
  unrated: "ohne Schwellenwert",
  unavailable: "kein Wert",
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

function GroupHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8">
      <h2 id={id} className="eyebrow text-wine-700">
        {title}
      </h2>
      <p className="micro mt-1 text-charcoal-600">{description}</p>
    </div>
  );
}

/** "Betrieb" / "Empfang" — the accountable role, from the registry. */
function metricOwnerLabel(metric: MetricDefinition): string {
  return OWNER_LABELS[metric.owner];
}

type CardContext = {
  data: DashboardData;
  values: Record<string, number | null>;
  occupancy: OccupancyToday | null;
  occupancyDelta: string | null;
  lastCaptured: { date: string } | undefined;
  occupancySpark: number[];
  demandSpark: number[];
  taskSpark: number[];
  demandTrendLabel: string;
};

/**
 * Cards are declared in the registry (which class, which metrics); the view
 * only decides how a declared metric looks. Adding a metric without a
 * renderer is a visible gap, not a silent blank.
 */
const CARD_RENDERERS: Record<string, (ctx: CardContext) => ReactNode> = {
  card_response: ({ data, values }) => {
    const metric = requiredMetric("inquiry_response");
    const stale = requiredMetric("inquiry_stale_age");
    // The bands shown are the ones the server actually counted with.
    const bands = data.response.bands;
    const oldest = values[metric.id];
    const staleCount = values[stale.id];
    const { level, provisional } = evaluateMetric(metric, oldest);
    return (
      <>
        {oldest === null ? (
          <>
            <p className="mt-3 text-sm">Keine unbeantwortete Anfrage.</p>
            <p className="mt-1 text-sm text-charcoal-600">
              Jede Anfrage hat einen Statuswechsel oder eine übernommene Folgetauflage.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl tabular-nums">{formatDuration(oldest)}</span>
              <span className={"text-sm " + levelText[level]}>
                {levelMarker[level]} {levelWord[level]}
              </span>
            </p>
            <p className="mt-1 text-sm text-charcoal-600">
              älteste unbeantwortete Anfrage seit Eingang
            </p>
          </>
        )}
        <dl className="micro mt-3 space-y-1 text-charcoal-600">
          <div className="flex justify-between gap-2">
            <dt>über Ziel ({bands.targetMinutes} Min.)</dt>
            <dd className="tabular-nums">{data.response.beyond_target}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>über Warnung ({bands.warningMinutes} Min.)</dt>
            <dd className="tabular-nums">{data.response.beyond_warning}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>über Kritisch ({bands.criticalMinutes} Min.)</dt>
            <dd className="tabular-nums">{data.response.beyond_critical}</dd>
          </div>
        </dl>
        {staleCount !== null && staleCount > 0 ? (
          <p className="mt-2 text-sm text-warning">
            ● {staleCount} im Status „Neu“ länger als{" "}
            {stale.thresholds?.attentionAfterHours} h
          </p>
        ) : null}
        <p className="micro mt-auto pt-3 text-charcoal-600">
          Website · live · Schwellenwerte{provisional ? " vorläufig" : " bestätigt"}
        </p>
        {metric.action ? (
          <Link
            to={metric.action.href}
            className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4 hover:text-wine-700"
          >
            {metric.action.label}
          </Link>
        ) : null}
      </>
    );
  },

  card_rooms: () => {
    const metric = requiredMetric("room_readiness");
    return (
      <>
        <SourceState
          title="Keine Hotel-Datenquelle verbunden"
          detail={metric.missingReason ?? ""}
        />
        <p className="micro mt-auto pt-3 text-charcoal-600">
          {CLASS_LABELS[metric.cls]} · {metric.kind} · {metricOwnerLabel(metric)}
        </p>
      </>
    );
  },

  card_tasks: ({ data, taskSpark }) => {
    const backlog = requiredMetric("task_backlog");
    const overdue = requiredMetric("task_overdue");
    const blocked = requiredMetric("task_blocked");
    const overdueState = evaluateMetric(overdue, data.counts.overdue_tasks);
    const blockedState = evaluateMetric(blocked, data.counts.blocked_tasks);
    return (
      <>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-4xl tabular-nums">{data.counts.open_tasks}</span>
          <span className="text-sm text-charcoal-600">
            offen · {data.counts.completed_tasks_today} heute erledigt
          </span>
        </p>
        {data.counts.overdue_tasks > 0 ? (
          <p className={"mt-1 text-sm " + levelText[overdueState.level]}>
            ▲ {data.counts.overdue_tasks} überfällig
          </p>
        ) : null}
        {data.counts.blocked_tasks > 0 ? (
          <p className={"mt-1 text-sm " + levelText[blockedState.level]}>
            ● {data.counts.blocked_tasks} blockiert
          </p>
        ) : null}
        {taskSpark.length > 1 ? (
          <div className="mt-3">
            <Sparkline values={taskSpark} />
          </div>
        ) : null}
        <p className="micro mt-auto pt-3 text-charcoal-600">Erledigt je Tag (7 Tage)</p>
        {backlog.action ? (
          <Link
            to={backlog.action?.href ?? "/intern/heute"}
            className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4 hover:text-wine-700"
          >
            {backlog.action?.label ?? "Meine Aufgaben öffnen"}
          </Link>
        ) : null}
      </>
    );
  },

  card_occupancy: ({ occupancy, occupancyDelta, occupancySpark, lastCaptured }) => {
    const metric = requiredMetric("occupancy_rate");
    return occupancy ? (
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
          Quelle: {occupancy.source === "manual" ? "manuelle Erfassung" : occupancy.source} ·{" "}
          {CLASS_LABELS[metric.cls]} ohne Zielwert
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
    );
  },

  card_demand: ({ data, demandSpark, demandTrendLabel }) => {
    const volume = requiredMetric("inquiry_volume");
    return (
      <>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-4xl tabular-nums">
            {data.counts.open_inquiries}
          </span>
          <span className="text-sm text-charcoal-600">
            offen · {data.counts.new_inquiries_today} neu heute
          </span>
        </p>
        {demandSpark.length > 1 ? (
          <div className="mt-3">
            <Sparkline values={demandSpark} />
          </div>
        ) : null}
        <p className="micro mt-auto pt-3 text-charcoal-600">
          {demandTrendLabel} · {CLASS_LABELS[volume.cls]} · Website live
        </p>
      </>
    );
  },

  card_today: ({ data, occupancy }) => (
    <dl className="mt-3 space-y-2">
      <div className="flex items-baseline justify-between">
        <dt className="text-sm text-charcoal-600">Anreisen</dt>
        <dd className="font-display text-2xl tabular-nums">{occupancy?.arrivals ?? "–"}</dd>
      </div>
      <div className="flex items-baseline justify-between">
        <dt className="text-sm text-charcoal-600">Abreisen</dt>
        <dd className="font-display text-2xl tabular-nums">{occupancy?.departures ?? "–"}</dd>
      </div>
      <div className="flex items-baseline justify-between">
        <dt className="text-sm text-charcoal-600">Aktive Mitarbeitende</dt>
        <dd className="font-display text-2xl tabular-nums">{data.counts.active_staff}</dd>
      </div>
      {!occupancy ? (
        <p className="micro pt-2 text-charcoal-600">
          An-/Abreisen ohne Hotel-Datenquelle nicht verfügbar.
        </p>
      ) : null}
    </dl>
  ),
};

function renderCard(card: DashboardCardDefinition, ctx: CardContext): ReactNode {
  const render = CARD_RENDERERS[card.id];
  if (!render) {
    throw new Error(`MISSING_CARD_RENDERER: ${card.id}`);
  }
  return render(ctx);
}

/**
 * Definitions, not decoration: every number the control tower shows is listed
 * with its class, source, aggregation, threshold and accountable role, so the
 * meaning is auditable without reading SQL or source code.
 */
function MetricDefinitions() {
  return (
    <details className="mt-4 rounded-xl border border-charcoal-900/10 bg-card p-5">
      <summary className="cursor-pointer text-sm font-medium">
        Kennzahlen-Definitionen — Quelle, Rechenweg, Schwellenwert, Verantwortung
      </summary>
      <p className="micro mt-3 text-charcoal-600">
        Schwellenwerte mit „vorläufig“ sind Arbeitswerte für die erste Betriebsphase und
        noch nicht durch den Betrieb bestätigt. Ohne hinterlegten Schwellenwert zeigt ein
        Wert nur den Ist-Stand, nie eine Bewertung.
      </p>
      {CRITICAL_SUCCESS_FACTORS.map((csf) => {
        const metrics = METRICS.filter((m) => m.csf === csf.id);
        if (metrics.length === 0 && csf.realizedBy !== "data_quality") return null;
        return (
          <section key={csf.id} className="mt-5">
            <h3 className="eyebrow text-charcoal-600">{csf.label}</h3>
            <p className="micro mt-1 text-charcoal-600">
              {csf.statement} Verantwortlich: {csf.accountable}
            </p>
            {metrics.length === 0 ? (
              <p className="micro mt-2 text-charcoal-600">
                Abgebildet durch den Abschnitt „Datenqualität“ — ohne Zahlenwert, weil hier die
                Verlässlichkeit der Quellen selbst gemeint ist.
              </p>
            ) : null}
            <dl className="mt-3 space-y-3">
              {metrics.map((metric) => (
                <div key={metric.id} className="border-t border-charcoal-900/10 pt-3">
                  <dt className="text-sm font-medium">
                    {metric.label}{" "}
                    <span className="micro text-charcoal-600">
                      {metric.kind} · {CLASS_LABELS[metric.cls]} ·{" "}
                      {metricOwnerLabel(metric)}
                    </span>
                  </dt>
                  <dd className="micro mt-1 space-y-0.5 text-charcoal-600">
                    <p>
                      <span className="text-charcoal-900">Zweck:</span> {metric.purpose}
                    </p>
                    <p>
                      <span className="text-charcoal-900">Quelle:</span>{" "}
                      {dataSourceById(metric.source).label} —{" "}
                      {dataSourceById(metric.source).origin}
                    </p>
                    <p>
                      <span className="text-charcoal-900">Rechenweg:</span> {metric.measure}
                    </p>
                    <p>
                      <span className="text-charcoal-900">Schwellen:</span>{" "}
                      {formatThresholds(metric)}
                      {metric.thresholds?.provisional ? ` — ${metric.thresholds.note}` : ""}
                    </p>
                    {metric.measurement === "SOURCE_MISSING" ? (
                      <p className="text-warning">
                        <span className="text-charcoal-900">Nicht messbar:</span>{" "}
                        {metric.missingReason}
                      </p>
                    ) : null}
                    {metric.action ? (
                      <p>
                        <span className="text-charcoal-900">Handlung:</span> {metric.action.label}{" "}
                        ({metric.action.href})
                      </p>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </details>
  );
}

export function DashboardView({ data }: { data: DashboardData }) {
  const attention = buildAttention(data);
  const occupancy = data.occupancy_today;
  const values = readMetricValues(data);
  const health = buildDataHealth(data.data_health, data.generated_at);

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

  const ctx: CardContext = {
    data,
    values,
    occupancy,
    occupancyDelta,
    lastCaptured,
    occupancySpark: occupancyDaily.slice(-7).map((p) => p.value),
    demandSpark: inquiryDaily.slice(-7).map(inquiryPointTotal),
    taskSpark: taskWeekly.map((p) => p.value),
    demandTrendLabel:
      data.inquiry_series.granularity === "hour"
        ? "Anfragen heute nach Stunde"
        : "Anfragen je Tag",
  };

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

      {/* ------------------------------------- Operative Signale / Ergebnis */}
      {DASHBOARD_GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`group-${group.id}`}>
          <GroupHeading
            id={`group-${group.id}`}
            title={group.title}
            description={group.description}
          />
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.cards.map((card) => (
              <KpiCard
                key={card.id}
                title={card.title}
                meta={dataSourceById(requiredMetric(card.metricIds[0]).source).label}
              >
                {renderCard(card, ctx)}
              </KpiCard>
            ))}
          </div>
        </section>
      ))}

      {/* ---------------------------------------------------------- Trends */}
      <section aria-labelledby="group-trends" className="hidden md:block">
        <GroupHeading
          id="group-trends"
          title={DASHBOARD_TREND_GROUP.title}
          description={DASHBOARD_TREND_GROUP.description}
        />
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                {data.inquiry_series.granularity === "hour"
                  ? "heute, je Stunde"
                  : rangeMeta[data.range.id]}
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
      </section>

      {/* ----------------------------------------------------- Action lists */}
      <section aria-labelledby="vorgaenge-heading" className="mt-8">
        <h2 id="vorgaenge-heading" className="sr-only">
          Vorgänge
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section
            aria-labelledby="inquiries-heading"
            className="rounded-xl border border-charcoal-900/10 bg-card p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 id="inquiries-heading" className="font-display text-xl">
                Aktuelle Anfragen
              </h3>
              <span className="micro text-charcoal-600">Website · live</span>
            </div>
            {data.recent_inquiries.length === 0 ? (
              <p className="mt-4 text-sm text-charcoal-600">Noch keine Anfragen.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.recent_inquiries.map((inquiry) => (
                  <li key={inquiry.request_id} className="rounded-lg border border-charcoal-900/10 p-4">
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

          <section
            aria-labelledby="tasks-heading"
            className="rounded-xl border border-charcoal-900/10 bg-card p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 id="tasks-heading" className="font-display text-xl">
                Aufgaben mit Handlungsbedarf
              </h3>
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
      </section>

      {/* ------------------------------------------------------ Data health */}
      <section
        aria-labelledby="health-heading"
        className="mt-4 rounded-xl border border-charcoal-900/10 bg-card p-5"
      >
        <h2 id="health-heading" className="eyebrow text-charcoal-600">
          Datenqualität
        </h2>
        <p className="micro mt-1 text-charcoal-600">
          Verfügbarkeit (gibt es die Quelle), Aktualität (wann der letzte Datensatz kam),
          Vollständigkeit und Konsistenz der Datensätze.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {health.map((row) => (
            <li key={row.source.id} className="rounded-lg border border-charcoal-900/10 p-4">
              <p className="text-sm font-medium">{row.source.label}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-charcoal-600">
                <span
                  aria-hidden
                  className={
                    row.availability === "AVAILABLE"
                      ? "inline-block h-2 w-2 rounded-full bg-success"
                      : "inline-block h-2 w-2 rounded-full border border-charcoal-600"
                  }
                />
                {row.availabilityLabel}
              </p>
              <p className="micro mt-1 text-charcoal-600">{row.freshnessLabel}</p>
              {row.completeness !== null ? (
                <p className="micro mt-1 text-charcoal-600">
                  Vollständigkeit {Math.round(row.completeness * 100)} % · {row.completenessLabel}
                </p>
              ) : null}
              {row.consistency !== null ? (
                <p className="micro mt-1 text-charcoal-600">
                  Konsistenz {Math.round(row.consistency * 100)} % · {row.consistencyLabel}
                </p>
              ) : null}
              <p className="micro mt-1 text-charcoal-600">{row.source.origin}</p>
            </li>
          ))}
        </ul>
        <p className="micro mt-4 text-charcoal-600">
          Datenstand {formatClock(data.generated_at)} Uhr
          {occupancy?.source === "manual"
            ? ` · Auslastung manuell erfasst, zuletzt ${formatClock(occupancy.captured_at)} Uhr`
            : ""}
        </p>
      </section>

      <MetricDefinitions />
    </section>
  );
}
