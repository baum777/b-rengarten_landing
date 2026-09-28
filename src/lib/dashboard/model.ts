/**
 * Pure presentation model for the admin control tower. Everything here takes
 * its inputs explicitly (no clock, no fetch) so attention thresholds, series
 * shaping and formatting are unit-testable and hydration-stable: relative
 * ages are always computed against the server-provided `generated_at`, never
 * against the client clock.
 *
 * Semantics (what a number means, when it becomes a warning, who is
 * accountable) live in the metric registry — this module only turns the
 * registry plus the server payload into text and states.
 */

import {
  attentionMetrics,
  evaluateMetric,
  metricById,
  type MetricLevel,
} from "../metrics/registry.ts";
import { formatAgeFromMinutes, minutesSince } from "../metrics/data-quality.ts";

export type RangeId = "heute" | "7tage" | "30tage";

export type DashboardCounts = {
  open_inquiries: number;
  new_inquiries_today: number;
  stale_inquiries: number;
  oldest_new_inquiry_at: string | null;
  open_tasks: number;
  overdue_tasks: number;
  blocked_tasks: number;
  completed_tasks_today: number;
  active_staff: number;
};

export type OccupancyToday = {
  date: string;
  occupancy_rate: number;
  arrivals: number | null;
  departures: number | null;
  rooms_total: number;
  rooms_occupied: number;
  captured_at: string;
  source: string;
};

export type SeriesPoint = { date: string; value: number };

export type InquirySeriesPoint = {
  bucket: string;
  ROOM: number;
  TABLE: number;
  OCCASION: number;
};

export type RecentInquiry = {
  request_id: string;
  type: "ROOM" | "TABLE" | "OCCASION";
  status: string;
  created_at: string;
  guest_name: string;
  arrival: string | null;
  departure: string | null;
  guest_count: number;
  room: string | null;
  occasion: string | null;
  task_status: string | null;
  task_assignee: string | null;
};

export type ActionTask = {
  id: string;
  title: string;
  department: string;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "BLOCKED";
  due_at: string | null;
  overdue: boolean;
  assignee_name: string | null;
};

export type DashboardResponse = {
  unanswered: number;
  beyond_target: number;
  beyond_warning: number;
  beyond_critical: number;
  oldest_unanswered_at: string | null;
  bands: { targetMinutes: number; warningMinutes: number; criticalMinutes: number };
};

export type DataHealthFacts = {
  records: number;
  lastRecordAt: string | null;
  incomplete: number;
  inconsistent: number;
};

export type DashboardData = {
  generated_at: string;
  today: string;
  range: { id: RangeId; days: number };
  counts: DashboardCounts;
  occupancy_today: OccupancyToday | null;
  occupancy_series: SeriesPoint[];
  occupancy_compare: { current_avg: number | null; previous_avg: number | null };
  inquiry_series: { granularity: "hour" | "day"; points: InquirySeriesPoint[] };
  task_series: SeriesPoint[];
  recent_inquiries: RecentInquiry[];
  action_tasks: ActionTask[];
  response: DashboardResponse;
  data_health: {
    website: DataHealthFacts;
    tasks: DataHealthFacts;
    staff: DataHealthFacts;
    occupancy_manual: DataHealthFacts;
    pms: DataHealthFacts;
  };
};

/** An inquiry counts as stale — and lands in the attention bar — after this. */
export const INQUIRY_STALE_HOURS = metricById("inquiry_stale_age")?.thresholds?.attentionAfterHours ?? 24;

const INQUIRY_TYPES: Record<RecentInquiry["type"], string> = {
  ROOM: "Zimmeranfrage",
  TABLE: "Tischanfrage",
  OCCASION: "Anlassanfrage",
};
export const inquiryTypeLabel = (type: RecentInquiry["type"]): string =>
  INQUIRY_TYPES[type] ?? type;

const INQUIRY_STATUS: Record<string, string> = {
  NEW: "Neu",
  REVIEWED: "Geprüft",
  CONTACTED: "Kontaktiert",
  CONFIRMED: "Bestätigt",
  DECLINED: "Abgelehnt",
  CLOSED: "Abgeschlossen",
};
export const inquiryStatusLabel = (status: string): string => INQUIRY_STATUS[status] ?? status;

const TASK_STATUS: Record<string, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Arbeit",
  BLOCKED: "Blockiert",
  DONE: "Erledigt",
  CANCELLED: "Zurückgezogen",
};
export const taskStatusLabel = (status: string): string => TASK_STATUS[status] ?? status;

const DEPARTMENTS: Record<string, string> = {
  MANAGEMENT: "Management",
  RECEPTION: "Empfang",
  HOUSEKEEPING: "Housekeeping",
  RESTAURANT: "Restaurant",
  SERVICE: "Service",
  KITCHEN: "Küche",
  TECHNICAL: "Technik",
  GENERAL: "Allgemein",
};
export const departmentLabel = (department: string): string => DEPARTMENTS[department] ?? department;

const PRIORITIES: Record<string, string> = {
  NORMAL: "Normal",
  IMPORTANT: "Wichtig",
  URGENT: "Dringend",
};
export const priorityLabel = (priority: string): string => PRIORITIES[priority] ?? priority;

// ---------------------------------------------------------------------------
// Formatting — de-DE, hotel operation hours, Europe/Berlin where a wall clock
// is shown. Date-only strings are pinned to UTC noon so formatting never
// shifts a day across time zones.
// ---------------------------------------------------------------------------

/** "vor 8 Min." / "vor 3 Std." / "vor 2 Tg." — for ages shown in lists. */
export function relativeAge(iso: string | null | undefined, nowIso: string): string {
  const minutes = minutesSince(iso, nowIso);
  return minutes === null ? "" : formatAgeFromMinutes(minutes);
}

/** "42 Min." / "3 Std. 12 Min." / "1 Tg. 4 Std." — metric values in minutes. */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "–";
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `${minutes} Min.`;
  const rest = minutes % 60;
  if (minutes < 1440) return rest ? `${Math.floor(minutes / 60)} Std. ${rest} Min.` : `${Math.floor(minutes / 60)} Std.`;
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return hours ? `${days} Tg. ${hours} Std.` : `${days} Tg.`;
}

/** "14:32" Berlin wall-clock, for the Datenstand metadata. */
export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}

/** "3. Okt." from a date-only string. */
export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

/** "03.–06. Okt." / "03. Okt." — arrival/departure or single inquiry date. */
export function formatStay(arrival: string | null, departure: string | null): string {
  if (arrival && departure) return `${formatDateShort(arrival)}–${formatDateShort(departure)}`;
  if (arrival) return formatDateShort(arrival);
  if (departure) return `bis ${formatDateShort(departure)}`;
  return "";
}

export function formatGuests(count: number): string {
  return count === 1 ? "1 Gast" : `${count} Gäste`;
}

/**
 * "heute, 14:05" / "3. Okt., 14:05" / "überfällig · 3. Okt., 14:05" — due
 * labels compare Berlin calendar days, matching the SQL aggregation.
 */
export function formatDueLabel(due: string | null, nowIso: string, overdue: boolean): string {
  if (!due) return "ohne Fälligkeit";
  const d = new Date(due);
  const day = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Berlin",
  }).format(d);
  const time = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(d);
  if (overdue) return `überfällig · ${day}, ${time}`;
  const berlinDay = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(iso));
  if (berlinDay(nowIso) === berlinDay(due)) return `heute, ${time}`;
  return `${day}, ${time}`;
}

/** "40 %" — occupancy fractions are 0..1; null renders as em dash. */
export function formatPercent(fraction: number | null | undefined): string {
  return fraction === null || fraction === undefined
    ? "–"
    : `${Math.round(fraction * 100)} %`;
}

/** "+3" / "−2" / "±0" — rounded percentage points for period comparison. */
export function percentPointsDelta(current: number | null, previous: number | null): string | null {
  if (current === null || previous === null) return null;
  const pp = Math.round((current - previous) * 100);
  if (pp === 0) return "±0";
  return pp > 0 ? `+${pp}` : `−${Math.abs(pp)}`;
}

// ---------------------------------------------------------------------------
// Metric readings + attention. The attention bar is no longer a hand-written
// list: every metric that can raise one declares its own title, and the level
// comes from the registry thresholds evaluated against the reading below.
// Nothing invents urgency — an item only exists where a declared threshold was
// actually crossed.
// ---------------------------------------------------------------------------

export type AttentionSeverity = "critical" | "warning";
export type AttentionItem = {
  id: string;
  severity: AttentionSeverity;
  severityLabel: "Kritisch" | "Hinweis";
  title: string;
  detail: string;
};

/**
 * Scalar reading per metric id. `null` means "not measurable right now" — a
 * missing source, a day without a capture — and never means zero.
 */
export function readMetricValues(data: DashboardData): Record<string, number | null> {
  const { counts, occupancy_today: occupancy, response } = data;
  const oldestUnanswered = minutesSince(response.oldest_unanswered_at, data.generated_at);
  return {
    inquiry_response: oldestUnanswered,
    inquiry_stale_age: counts.stale_inquiries,
    room_readiness: null,
    task_backlog: counts.open_tasks,
    task_overdue: counts.overdue_tasks,
    task_blocked: counts.blocked_tasks,
    occupancy_rate: occupancy?.occupancy_rate ?? null,
    arrivals: occupancy?.arrivals ?? null,
    departures: occupancy?.departures ?? null,
    inquiry_volume: counts.open_inquiries,
    active_staff: counts.active_staff,
  };
}

/** Registry level of one metric, for card colouring and status text. */
export function metricState(
  data: DashboardData,
  metricId: string,
): { level: MetricLevel; value: number | null; provisional: boolean } {
  const metric = metricById(metricId);
  const value = readMetricValues(data)[metricId] ?? null;
  if (!metric) return { level: "unrated", value, provisional: false };
  const evaluation = evaluateMetric(metric, value);
  return { level: evaluation.level, value, provisional: evaluation.provisional };
}

export function buildAttention(data: DashboardData): AttentionItem[] {
  const values = readMetricValues(data);
  const items: AttentionItem[] = [];
  for (const metric of attentionMetrics()) {
    const value = values[metric.id];
    if (value === null || !metric.thresholds || !metric.attention) continue;
    const { level } = evaluateMetric(metric, value);
    if (level !== "warning" && level !== "critical") continue;
    const severity: AttentionSeverity = level === "critical" ? "critical" : "warning";
    items.push({
      id: metric.id,
      severity,
      severityLabel: severity === "critical" ? "Kritisch" : "Hinweis",
      title: metric.attention.title(Math.round(value), metric.thresholds, severity),
      detail: metric.attention.detail,
    });
  }
  // Critical first, registry order otherwise — deterministic across renders.
  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1));
}

export const ATTENTION_CLEAR = {
  title: "Keine kritischen Vorgänge.",
  detail: "Betrieb im Normalbereich.",
} as const;

// ---------------------------------------------------------------------------
// Series shaping — zero-filled, ordered, chart-ready. Buckets stay strings
// ("YYYY-MM-DD" / "YYYY-MM-DD HH:00") so no time-zone drift occurs en route.
// ---------------------------------------------------------------------------

/** Zero-fill daily rows over the last `days` days ending at `todayIso` (UTC). */
export function fillDailySeries(todayIso: string, rows: SeriesPoint[], days: number): SeriesPoint[] {
  const byDate = new Map(rows.map((r) => [r.date, r.value]));
  const out: SeriesPoint[] = [];
  const anchor = new Date(`${todayIso}T12:00:00Z`);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(anchor.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ date: d, value: byDate.get(d) ?? 0 });
  }
  return out;
}

/** Zero-fill typed inquiry points (all three counts) over `days` days. */
export function fillDailyInquiryPoints(
  todayIso: string,
  points: InquirySeriesPoint[],
  days: number,
): InquirySeriesPoint[] {
  const byDate = new Map(points.map((p) => [p.bucket, p]));
  const out: InquirySeriesPoint[] = [];
  const anchor = new Date(`${todayIso}T12:00:00Z`);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(anchor.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    out.push(byDate.get(d) ?? { bucket: d, ROOM: 0, TABLE: 0, OCCASION: 0 });
  }
  return out;
}

/** Hourly buckets of today, zero-filled 00:00–current hour (inclusive). */
export function fillHourlySeries(
  todayIso: string,
  points: InquirySeriesPoint[],
  nowIso: string,
): InquirySeriesPoint[] {
  const byBucket = new Map(points.map((p) => [p.bucket, p]));
  const currentHour = Number(
    new Intl.DateTimeFormat("de-DE", { hour: "2-digit", hour12: false, timeZone: "Europe/Berlin" })
      .format(new Date(nowIso))
      .replace(/\D/g, ""),
  );
  const out: InquirySeriesPoint[] = [];
  for (let h = 0; h <= (Number.isFinite(currentHour) ? currentHour : 23); h += 1) {
    const bucket = `${todayIso} ${String(h).padStart(2, "0")}:00`;
    const p = byBucket.get(bucket);
    out.push(p ?? { bucket, ROOM: 0, TABLE: 0, OCCASION: 0 });
  }
  return out;
}

/** Total inquiries per point, for the Nachfrage sparkline. */
export const inquiryPointTotal = (p: InquirySeriesPoint): number => p.ROOM + p.TABLE + p.OCCASION;

/** "14:00" / "3. Okt." — human axis label for a bucket string. */
export function bucketLabel(granularity: "hour" | "day", bucket: string): string {
  if (granularity === "hour") return bucket.slice(11);
  return formatDateShort(bucket.slice(0, 10));
}

export type SparklineGeometry = { points: string; baseline: number };

/**
 * SVG polyline points for `values`, y-down, normalized to the value range so
 * small variations stay legible (sparklines carry shape, not axes). All-zero
 * or single-value series still produce a visible baseline segment (no fake
 * shape).
 */
export function sparkline(
  values: number[],
  width: number,
  height: number,
): SparklineGeometry {
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const span = max - min;
  if (values.length === 0 || max === 0) {
    return { points: `0,${height} ${width},${height}`, baseline: height };
  }
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const yFor = (v: number) =>
    height - (span === 0 ? 0.5 : (v - min) / span) * (height - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${yFor(v).toFixed(1)}`)
    .join(" ");
  return { points, baseline: height };
}
