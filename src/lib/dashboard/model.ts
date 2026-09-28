/**
 * Pure presentation model for the admin control tower. Everything here takes
 * its inputs explicitly (no clock, no fetch) so attention thresholds, series
 * shaping and formatting are unit-testable and hydration-stable: relative
 * ages are always computed against the server-provided `generated_at`, never
 * against the client clock.
 */

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
};

/** An inquiry counts as stale — and lands in the attention bar — after this. */
export const INQUIRY_STALE_HOURS = 24;

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
  if (!iso) return "";
  const ms = new Date(nowIso).getTime() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "gerade eben";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tg.`;
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
// Attention — only real thresholds. Critical = an actual deadline breach;
// warning = needs attention but not breached. Nothing here invents urgency.
// ---------------------------------------------------------------------------

export type AttentionSeverity = "critical" | "warning";
export type AttentionItem = {
  id: string;
  severity: AttentionSeverity;
  severityLabel: "Kritisch" | "Hinweis";
  title: string;
  detail: string;
};

export function buildAttention(counts: DashboardCounts): AttentionItem[] {
  const items: AttentionItem[] = [];
  if (counts.overdue_tasks > 0) {
    items.push({
      id: "tasks-overdue",
      severity: "critical",
      severityLabel: "Kritisch",
      title:
        counts.overdue_tasks === 1
          ? "1 Aufgabe überfällig"
          : `${counts.overdue_tasks} Aufgaben überfällig`,
      detail: "Fälligkeitsdatum ist überschritten.",
    });
  }
  if (counts.stale_inquiries > 0) {
    items.push({
      id: "inquiries-stale",
      severity: "warning",
      severityLabel: "Hinweis",
      title:
        counts.stale_inquiries === 1
          ? "1 Anfrage länger als 24 h offen"
          : `${counts.stale_inquiries} Anfragen länger als 24 h offen`,
      detail: "Noch keinen Statuswechsel seit Eingang.",
    });
  }
  if (counts.blocked_tasks > 0) {
    items.push({
      id: "tasks-blocked",
      severity: "warning",
      severityLabel: "Hinweis",
      title:
        counts.blocked_tasks === 1
          ? "1 Aufgabe blockiert"
          : `${counts.blocked_tasks} Aufgaben blockiert`,
      detail: "Blockierte Aufgaben kommen nicht voran, bis der Blocker gelöst ist.",
    });
  }
  return items;
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
