/**
 * Metric registry — the single place where a number on the control tower is
 * defined: what it measures, where it comes from, who is accountable, which
 * threshold turns it into a warning, and what to do about it.
 *
 * Before this registry existed the same semantics were spread across SQL, the
 * model layer and the view: a "24 hours" literal in the query, a hardcoded
 * "länger als 24 h" string in the component, a hand-written attention list.
 * Thresholds now travel from here into the server query as bound parameters
 * (`readDashboard`), and the view only renders what is declared.
 *
 * Two rules hold everywhere in this file:
 *
 * 1. A metric whose source does not exist is declared `SOURCE_MISSING` and
 *    rendered as a source state — never as a zero, never as "no data" KPI.
 * 2. A threshold that the operation has not ratified carries
 *    `provisional: true`. Provisional thresholds are shown, labelled, and may
 *    drive the attention bar exactly as before — but the UI says so, so nobody
 *    mistakes an agent's working value for an operator decision.
 */

import type { CsfId } from "./csf.ts";

export type MetricKind = "KPI" | "PI" | "RI" | "KRI";

/**
 * Parmenter/Neely classes as applied to this dashboard:
 * operational signals (controllable now), result indicators (what the period
 * produced) and trends (development over time). Attention is not a class — it
 * is the derived state of a metric that crossed its threshold.
 */
export type MetricClass = "OPERATIONAL_SIGNAL" | "RESULT_INDICATOR" | "TREND";

/** Accountability, not authorization. */
export type MetricOwner = "RECEPTION" | "OPERATIONS" | "MANAGEMENT";

export type MetricUnit = "count" | "percent" | "minutes";

export type DataSourceId = "website" | "tasks" | "staff" | "occupancy_manual" | "pms";

/** Whether the underlying data source exists at all right now. */
export type MetricMeasurement = "AVAILABLE" | "SOURCE_MISSING";

export type MetricThresholds = {
  direction: "LOWER_IS_BETTER" | "HIGHER_IS_BETTER";
  /** Target value on the metric's own scale. */
  target: number;
  /** `null` = this level is not graded. */
  warning: number | null;
  critical: number | null;
  /**
   * Age bands in minutes, for "how long may this stay untouched". Used by
   * age-driven metrics; the band counts come from the same query.
   */
  bands?: { targetMinutes: number; warningMinutes: number; criticalMinutes: number };
  /**
   * For count metrics whose *set* is age-filtered in SQL (e.g. "inquiries in
   * status NEW"): the age that defines the counted set.
   */
  attentionAfterHours?: number;
  /** Not yet confirmed by the operation — shown as a working value. */
  provisional: boolean;
  note: string;
};

export type MetricDefinition = {
  id: string;
  label: string;
  kind: MetricKind;
  cls: MetricClass;
  csf: CsfId;
  owner: MetricOwner;
  purpose: string;
  source: DataSourceId;
  /** Aggregation definition, in the operation's language. */
  measure: string;
  unit: MetricUnit;
  thresholds?: MetricThresholds;
  action?: { label: string; href: string } | null;
  freshnessSlaMinutes?: number;
  measurement: MetricMeasurement;
  /** Required when `measurement` is `SOURCE_MISSING`. */
  missingReason?: string;
  /** Present when the metric can raise an attention item. */
  attention?: {
    title: (
      value: number,
      thresholds: MetricThresholds,
      level: "warning" | "critical",
    ) => string;
    detail: string;
  };
};

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const METRICS: MetricDefinition[] = [
  // ------------------------------------------------ operational signals ----
  {
    id: "inquiry_response",
    label: "Antwortzeit Anfragen",
    kind: "KPI",
    cls: "OPERATIONAL_SIGNAL",
    csf: "csf_inquiry_response",
    owner: "RECEPTION",
    purpose: "Neue Nachfrage rechtzeitig bearbeiten, bevor sie absagt.",
    source: "website",
    measure:
      "Alter der ältesten unbeantworteten Anfrage. Unbeantwortet heißt: Anfragestatus ist „Neu“ und die automatisch angelegte Folgetauflage wurde noch nicht aus „Offen“ bewegt. Beantwortete Anfragen gehen nicht mehr ein.",
    unit: "minutes",
    thresholds: {
      direction: "LOWER_IS_BETTER",
      target: 30,
      warning: 60,
      critical: 120,
      bands: { targetMinutes: 30, warningMinutes: 60, criticalMinutes: 120 },
      provisional: true,
      note: "Arbeitswerte für die erste Betriebsphase; Bestätigung durch den Betrieb steht aus.",
    },
    action: { label: "Anfragen öffnen", href: "/intern/anfragen" },
    freshnessSlaMinutes: 5,
    measurement: "AVAILABLE",
    attention: {
      title: (minutes, t, level) => {
        const limit =
          level === "critical" ? t.bands?.criticalMinutes : t.bands?.warningMinutes;
        return `Unbeantwortete Anfrage älter als ${limit ?? minutes} Min.`;
      },
      detail:
        "Seit Eingang auf der Website weder Statuswechsel noch übernommene Folgetauflage.",
    },
  },
  {
    id: "inquiry_stale_age",
    label: "Anfragen im Status „Neu“",
    kind: "PI",
    cls: "OPERATIONAL_SIGNAL",
    csf: "csf_inquiry_response",
    owner: "RECEPTION",
    purpose: "Sichtbar halten, wie lange Anfragen ohne Statuswechsel liegen.",
    source: "website",
    measure:
      "Anfragen mit Status „Neu“, die älter als die Hinweisschwelle sind. Der Zähler sagt nichts über eine Bearbeitung aus — maßgeblich dafür ist die Antwortzeit.",
    unit: "count",
    thresholds: {
      direction: "LOWER_IS_BETTER",
      target: 0,
      warning: 0,
      critical: null,
      attentionAfterHours: 24,
      provisional: true,
      note: "Hinweisschwelle; Bestätigung durch den Betrieb steht aus.",
    },
    measurement: "AVAILABLE",
    attention: {
      title: (value, t) => {
        const hours = t.attentionAfterHours ?? 0;
        return `${value} ${plural(value, "Anfrage", "Anfragen")} länger als ${hours} h offen`;
      },
      detail: "Noch keinen Statuswechsel seit Eingang.",
    },

  },
  {
    id: "room_readiness",
    label: "Zimmer bezugsfertig",
    kind: "KRI",
    cls: "OPERATIONAL_SIGNAL",
    csf: "csf_operation",
    owner: "OPERATIONS",
    purpose: "Wissen, ob ankommende Gäste auch ein bezugsfertiges Zimmer vorfinden.",
    source: "pms",
    measure:
      "Zimmer, die nicht bezugsfertig sind — je Haus und Ankunftstag. Es existiert heute keine Datenquelle mit Zimmer- und Bereitschaftsstatus.",
    unit: "count",
    measurement: "SOURCE_MISSING",
    missingReason:
      "Der Wert entsteht erst mit einer PMS-Anbindung; er wird bis dahin nicht als 0 geführt.",
  },
  {
    id: "task_backlog",
    label: "Offene Aufgaben",
    kind: "PI",
    cls: "OPERATIONAL_SIGNAL",
    csf: "csf_operation",
    owner: "OPERATIONS",
    purpose: "Arbeitsvorrat im Blick behalten, ohne ihn zu bewerten.",
    source: "tasks",
    measure: "Aufgaben mit Status „Offen“, „In Arbeit“ oder „Blockiert“.",
    unit: "count",
    action: { label: "Aufgaben öffnen", href: "/intern/aufgaben" },
    measurement: "AVAILABLE",
  },
  {
    id: "task_overdue",
    label: "Überfällige Aufgaben",
    kind: "KPI",
    cls: "OPERATIONAL_SIGNAL",
    csf: "csf_operation",
    owner: "OPERATIONS",
    purpose: "Zugesagte Termine halten — ein überschrittenes Fälligkeitsdatum ist ein echter Bruch.",
    source: "tasks",
    measure: "Offene Aufgaben mit Fälligkeitsdatum vor jetzt.",
    unit: "count",
    thresholds: {
      direction: "LOWER_IS_BETTER",
      target: 0,
      warning: null,
      critical: 0,
      provisional: true,
      note: "Jede Überschreitung gilt als kritisch; Bestätigung durch den Betrieb steht aus.",
    },
    action: { label: "Aufgaben öffnen", href: "/intern/aufgaben" },
    measurement: "AVAILABLE",
    attention: {
      title: (value) => `${value} ${plural(value, "Aufgabe", "Aufgaben")} überfällig`,
      detail: "Fälligkeitsdatum ist überschritten.",
    },
  },
  {
    id: "task_blocked",
    label: "Blockierte Aufgaben",
    kind: "PI",
    cls: "OPERATIONAL_SIGNAL",
    csf: "csf_operation",
    owner: "OPERATIONS",
    purpose: "Blocker sichtbar machen, bevor Aufgaben stillstehen.",
    source: "tasks",
    measure: "Aufgaben mit Status „Blockiert“.",
    unit: "count",
    thresholds: {
      direction: "LOWER_IS_BETTER",
      target: 0,
      warning: 0,
      critical: null,
      provisional: true,
      note: "Hinweisschwelle; Bestätigung durch den Betrieb steht aus.",
    },
    measurement: "AVAILABLE",
    attention: {
      title: (value) => `${value} ${plural(value, "Aufgabe", "Aufgaben")} blockiert`,
      detail: "Blockierte Aufgaben kommen nicht voran, bis der Blocker gelöst ist.",
    },
  },

  // --------------------------------------------------- result indicators ----
  {
    id: "occupancy_rate",
    label: "Auslastung",
    kind: "RI",
    cls: "RESULT_INDICATOR",
    csf: "csf_occupancy",
    owner: "MANAGEMENT",
    purpose: "Erkennen, wie stark der Betrieb ausgelastet ist.",
    source: "occupancy_manual",
    measure:
      "Belegte Zimmer geteilt durch Zimmer gesamt im letzten Tageswert. Ohne Datenquelle wird der Wert nicht als 0 geführt.",
    unit: "percent",
    action: { label: "Auslastung öffnen", href: "/intern/auslastung" },
    measurement: "AVAILABLE",
  },
  {
    id: "arrivals",
    label: "Anreisen heute",
    kind: "RI",
    cls: "RESULT_INDICATOR",
    csf: "csf_occupancy",
    owner: "OPERATIONS",
    purpose: "Tagesbetrieb auf die ankommenden Gäste ausrichten.",
    source: "occupancy_manual",
    measure: "Anreisen im letzten Tageswert des heutigen Datums.",
    unit: "count",
    measurement: "AVAILABLE",
  },
  {
    id: "departures",
    label: "Abreisen heute",
    kind: "RI",
    cls: "RESULT_INDICATOR",
    csf: "csf_occupancy",
    owner: "OPERATIONS",
    purpose: "Tagesbetrieb auf die abreisenden Gäste ausrichten.",
    source: "occupancy_manual",
    measure: "Abreisen im letzten Tageswert des heutigen Datums.",
    unit: "count",
    measurement: "AVAILABLE",
  },
  {
    id: "inquiry_volume",
    label: "Nachfrage",
    kind: "RI",
    cls: "RESULT_INDICATOR",
    csf: "csf_inquiry_response",
    owner: "MANAGEMENT",
    purpose: "Einschätzen, wie viel Nachfrage aktuell offen ist.",
    source: "website",
    measure:
      "Anfragen, die weder abgeschlossen noch abgelehnt noch bestätigt sind, ergänzt um die Zahl der Eingänge des heutigen Tages (Berlin-Zeit).",
    unit: "count",
    action: { label: "Auswertung öffnen", href: "/intern/auswertung" },
    measurement: "AVAILABLE",
  },
  {
    id: "active_staff",
    label: "Aktive Mitarbeitende",
    kind: "PI",
    cls: "RESULT_INDICATOR",
    csf: "csf_operation",
    owner: "OPERATIONS",
    purpose: "Bezug zwischen Arbeitsvorrat und verfügbaren Personen herstellen.",
    source: "staff",
    measure: "Aktive Mitarbeiterprofile mit Zugang zum internen Bereich.",
    unit: "count",
    measurement: "AVAILABLE",
  },

  // ------------------------------------------------------------- trends ----
  {
    id: "occupancy_trend",
    label: "Auslastungsverlauf",
    kind: "RI",
    cls: "TREND",
    csf: "csf_occupancy",
    owner: "MANAGEMENT",
    purpose: "Entwicklung der Belegung im gewählten Zeitraum erkennen.",
    source: "occupancy_manual",
    measure:
      "Je Tag der letzte erfasste Auslastungswert, im Vergleich zum gleich langen Zeitraum davor. Die Skala bleibt fest 0–100 %.",
    unit: "percent",
    measurement: "AVAILABLE",
  },
  {
    id: "inquiry_volume_trend",
    label: "Anfragen je Zeitraum",
    kind: "RI",
    cls: "TREND",
    csf: "csf_inquiry_response",
    owner: "MANAGEMENT",
    purpose: "Nachfrageentwicklung nach Art der Anfrage lesen.",
    source: "website",
    measure:
      "Eingänge je Tag im gewählten Zeitraum, gestapelt nach Zimmer, Tisch und Anlass. Bei Zeitraum „Heute“ Stundenbuckels — die einzige Auflösung, die die Daten hergeben.",
    unit: "count",
    measurement: "AVAILABLE",
  },
  {
    id: "task_throughput_trend",
    label: "Erledigte Aufgaben",
    kind: "PI",
    cls: "TREND",
    csf: "csf_operation",
    owner: "OPERATIONS",
    purpose: "Erkennen, ob der Arbeitsvorrat abgearbeitet wird.",
    source: "tasks",
    measure:
      "Aufgaben mit Abschlussdatum je Tag, fest über 7 Tage. Bewusst unabhängig vom gewählten Zeitraum, weil es die aktuellen operativen Werte einordnet.",
    unit: "count",
    measurement: "AVAILABLE",
  },
];

const METRIC_BY_ID = new Map(METRICS.map((m) => [m.id, m]));

export const metricById = (id: string): MetricDefinition | undefined => METRIC_BY_ID.get(id);

/** For ids the layout declares — a missing entry is a build error, not a blank. */
export function requiredMetric(id: string): MetricDefinition {
  const metric = METRIC_BY_ID.get(id);
  if (!metric) throw new Error(`UNREGISTERED_METRIC: ${id}`);
  return metric;
}

export const OWNER_LABELS: Record<MetricOwner, string> = {
  RECEPTION: "Empfang",
  OPERATIONS: "Betrieb",
  MANAGEMENT: "Management",
};

export const CLASS_LABELS: Record<MetricClass, string> = {
  OPERATIONAL_SIGNAL: "Operatives Signal",
  RESULT_INDICATOR: "Ergebnis-Kennzahl",
  TREND: "Trend",
};

export const metricsByClass = (cls: MetricClass): MetricDefinition[] =>
  METRICS.filter((m) => m.cls === cls);

export const metricsForCsf = (csf: CsfId): MetricDefinition[] =>
  METRICS.filter((m) => m.csf === csf);

/** Metrics that can raise an attention item, in registry order. */
export const attentionMetrics = (): MetricDefinition[] =>
  METRICS.filter((m) => m.attention !== undefined);

// ---------------------------------------------------------------------------
// Evaluation — one implementation of "is this number fine?", used by the
// attention bar, the KPI cards and the definitions disclosure alike.
// ---------------------------------------------------------------------------

export type MetricLevel = "ok" | "over_target" | "warning" | "critical" | "unrated" | "unavailable";

export type MetricEvaluation = {
  level: MetricLevel;
  provisional: boolean;
};

/**
 * A value of `null` means "not measurable right now" (no data source, no
 * records) — never a zero and never a pass.
 */
export function evaluateMetric(
  metric: MetricDefinition,
  value: number | null,
): MetricEvaluation {
  if (metric.measurement === "SOURCE_MISSING") return { level: "unavailable", provisional: false };
  if (value === null) return { level: "unavailable", provisional: false };
  const t = metric.thresholds;
  if (!t) return { level: "unrated", provisional: false };
  const below = t.direction === "LOWER_IS_BETTER" ? value > t.target : value < t.target;
  if (!below) return { level: "ok", provisional: t.provisional };
  if (t.critical !== null) {
    const critical = t.direction === "LOWER_IS_BETTER" ? value >= t.critical : value <= t.critical;
    if (critical) return { level: "critical", provisional: t.provisional };
  }
  if (t.warning !== null) {
    const warning = t.direction === "LOWER_IS_BETTER" ? value >= t.warning : value <= t.warning;
    if (warning) return { level: "warning", provisional: t.provisional };
  }
  return { level: "over_target", provisional: t.provisional };
}

const UNIT_SUFFIX: Record<MetricUnit, string> = {
  count: "",
  percent: " %",
  minutes: " Min.",
};

const valueText = (value: number, unit: MetricUnit) =>
  unit === "percent" ? `${Math.round(value)} %` : `${value}${UNIT_SUFFIX[unit]}`;

/** "Zielwert ≤ 30 Min. · Warnung > 60 Min. · Kritisch > 120 Min." */
export function formatThresholds(metric: MetricDefinition): string {
  const t = metric.thresholds;
  if (!t) return "Kein Schwellenwert definiert — Wert wird nur zur Information gezeigt.";
  const lower = t.direction === "LOWER_IS_BETTER";
  const parts = [`Zielwert ${lower ? "≤" : "≥"} ${valueText(t.target, metric.unit)}`];
  if (t.warning !== null)
    parts.push(`Warnung ${lower ? ">" : "<"} ${valueText(t.warning, metric.unit)}`);
  if (t.critical !== null)
    parts.push(`Kritisch ${lower ? ">" : "<"} ${valueText(t.critical, metric.unit)}`);
  if (t.attentionAfterHours !== undefined)
    parts.push(`Hinweis ab ${t.attentionAfterHours} h offen`);
  if (t.bands) {
    const b = t.bands;
    parts.push(
      `Bänder ${b.targetMinutes}/${b.warningMinutes}/${b.criticalMinutes} Min. (Ziel/Warnung/Kritisch)`,
    );
  }
  return `${parts.join(" · ")}${t.provisional ? " · vorläufig" : ""}`;
}

export const isProvisional = (metric: MetricDefinition): boolean =>
  metric.thresholds?.provisional === true;

// ---------------------------------------------------------------------------
// Data sources — availability, freshness SLA and which quality dimensions are
// actually checked for each source. A dimension that is not declared here is
// shown as "nicht geprüft" instead of as 100 %.
// ---------------------------------------------------------------------------

export type QualityDimension = "availability" | "freshness" | "completeness" | "consistency";

export type DataSourceDefinition = {
  id: DataSourceId;
  label: string;
  /** What the number actually is — no product naming that does not exist. */
  origin: string;
  connected: boolean;
  /** True when the values are entered by hand rather than pulled from a system. */
  manual?: boolean;
  quality: QualityDimension[];
  freshnessSlaMinutes?: number;
  completenessLabel: string;
  consistencyLabel: string;
  missingReason: string;
};

export const DATA_SOURCES: DataSourceDefinition[] = [
  {
    id: "website",
    label: "Website",
    origin: "Anfragen aus dem Formular dieser Website",
    connected: true,
    quality: ["availability", "freshness", "completeness", "consistency"],
    freshnessSlaMinutes: 1440,
    completenessLabel: "offene Anfragen ohne Aufenthaltszeitraum",
    consistencyLabel: "offene Anfragen ohne übernommene Folgetauflage",
    missingReason: "Es ist noch keine Anfrage über die Website eingegangen.",
  },
  {
    id: "tasks",
    label: "Aufgaben",
    origin: "Aufgaben der internen Oberfläche",
    connected: true,
    quality: ["availability", "freshness", "completeness"],
    freshnessSlaMinutes: 1440,
    completenessLabel: "offene Aufgaben ohne Fälligkeitsdatum",
    consistencyLabel: "",
    missingReason: "Es ist noch keine Aufgabe angelegt.",
  },
  {
    id: "staff",
    label: "Team",
    origin: "Mitarbeiterprofile dieser Installation",
    connected: true,
    quality: ["availability", "freshness"],
    freshnessSlaMinutes: 10080,
    completenessLabel: "",
    consistencyLabel: "",
    missingReason: "Es ist noch kein Mitarbeiterprofil angelegt.",
  },
  {
    id: "occupancy_manual",
    label: "Belegung",
    origin: "Tageswerte, die im Betrieb manuell erfasst werden",
    connected: true,
    manual: true,
    quality: ["availability", "freshness", "completeness", "consistency"],
    freshnessSlaMinutes: 2880,
    completenessLabel: "Tageswerte ohne An- und Abreisen",
    consistencyLabel: "Tageswerte, die nicht zur Zimmerzahl passen",
    missingReason: "Für heute ist noch kein Belegungswert erfasst.",
  },
  {
    id: "pms",
    label: "PMS",
    origin: "Hotelverwaltung — nicht angebunden",
    connected: false,
    quality: ["availability"],
    completenessLabel: "",
    consistencyLabel: "",
    missingReason: "Nicht verbunden. Automatische Zimmer-, An- und Abreisedaten gibt es erst mit einer Anbindung.",
  },
];

const SOURCE_BY_ID = new Map(DATA_SOURCES.map((s) => [s.id, s]));

export const dataSourceById = (id: DataSourceId): DataSourceDefinition => {
  const source = SOURCE_BY_ID.get(id);
  if (!source) throw new Error(`UNKNOWN_DATA_SOURCE: ${id}`);
  return source;
};

// ---------------------------------------------------------------------------
// Dashboard layout — which cards exist and in which class they are shown.
// The view renders these; it does not decide the hierarchy itself.
// ---------------------------------------------------------------------------

export type DashboardCardId =
  | "card_response"
  | "card_rooms"
  | "card_tasks"
  | "card_occupancy"
  | "card_demand"
  | "card_today";

export type DashboardCardDefinition = {
  id: DashboardCardId;
  title: string;
  metricIds: string[];
};

export type DashboardGroup = {
  id: MetricClass;
  title: string;
  description: string;
  cards: DashboardCardDefinition[];
};

export const DASHBOARD_GROUPS: DashboardGroup[] = [
  {
    id: "OPERATIONAL_SIGNAL",
    title: "Operative Signale",
    description: "Was jetzt zu tun ist — kontrollierbar innerhalb des Betriebsablaufs.",
    cards: [
      {
        id: "card_response",
        title: "Antwortzeit Anfragen",
        metricIds: ["inquiry_response", "inquiry_stale_age"],
      },
      { id: "card_rooms", title: "Zimmer bezugsfertig", metricIds: ["room_readiness"] },
      {
        id: "card_tasks",
        title: "Aufgaben",
        metricIds: ["task_backlog", "task_overdue", "task_blocked"],
      },
    ],
  },
  {
    id: "RESULT_INDICATOR",
    title: "Ergebnis-Kennzahlen",
    description: "Was der Zeitraum ergeben hat — Auslastung, Nachfrage und Tageswerte.",
    cards: [
      {
        id: "card_occupancy",
        title: "Auslastung",
        metricIds: ["occupancy_rate", "occupancy_trend"],
      },
      {
        id: "card_demand",
        title: "Nachfrage",
        metricIds: ["inquiry_volume", "inquiry_volume_trend"],
      },
      {
        id: "card_today",
        title: "Heute",
        metricIds: ["arrivals", "departures", "active_staff"],
      },
    ],
  },
];

export const DASHBOARD_TREND_GROUP = {
  title: "Trends",
  description: "Entwicklung im gewählten Zeitraum.",
} as const;
