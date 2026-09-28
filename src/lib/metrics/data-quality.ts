/**
 * Data quality — the four questions the control tower has to answer for every
 * number it shows: is the source there, is it fresh, is it complete, is it
 * consistent.
 *
 * The distinction the operation cares about most:
 *
 *     "0 Anreisen"          → the snapshot says nobody arrives today
 *     "keine Anreisedaten"  → no source has been filled today
 *
 * Everything is derived from the aggregation the server already returns, so
 * this stays a pure function and stays testable.
 */

import { DATA_SOURCES, type DataSourceDefinition, type DataSourceId } from "./registry.ts";

export type Availability = "AVAILABLE" | "PARTIAL" | "MISSING";
export type Freshness = "FRESH" | "AGING" | "STALE" | "UNKNOWN";

/** Per-source counters, produced by the server aggregation. */
export type SourceFacts = {
  /** Population the completeness/consistency shares are computed over. */
  records: number;
  incomplete: number;
  inconsistent: number;
  lastRecordAt: string | null;
};

export type DataQualityFacts = Record<DataSourceId, SourceFacts>;

export type DataHealthRow = {
  source: DataSourceDefinition;
  availability: Availability;
  availabilityLabel: string;
  freshness: Freshness;
  freshnessLabel: string;
  lastRecordAt: string | null;
  /** 0..1, or `null` when the dimension is not checked for this source. */
  completeness: number | null;
  completenessLabel: string;
  consistency: number | null;
  consistencyLabel: string;
  records: number;
};

/** "gerade eben" / "vor 12 Min." / "vor 3 Std." / "vor 2 Tg." */
export function formatAgeFromMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${Math.floor(minutes)} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return `vor ${Math.floor(hours / 24)} Tg.`;
}

/** Whole minutes between an ISO timestamp and the server clock, `null` if absent. */
export function minutesSince(iso: string | null | undefined, nowIso: string): number | null {
  if (!iso) return null;
  const ms = new Date(nowIso).getTime() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.floor(ms / 60_000));
}

function availabilityOf(source: DataSourceDefinition, facts: SourceFacts): {
  availability: Availability;
  label: string;
} {
  if (!source.connected) return { availability: "MISSING", label: "Nicht verbunden" };
  if (facts.records > 0) {
    return { availability: "AVAILABLE", label: source.manual ? "Manuelle Erfassung" : "Live" };
  }
  // No record in the checked scope, but the source demonstrably has data at
  // some point: that is a gap in the current period, not a dead source.
  if (facts.lastRecordAt) return { availability: "PARTIAL", label: "Aktuell keine Daten" };
  return { availability: "MISSING", label: "Noch keine Daten" };
}

function freshnessOf(
  source: DataSourceDefinition,
  facts: SourceFacts,
  minutes: number | null,
): { freshness: Freshness; label: string } {
  if (minutes === null) return { freshness: "UNKNOWN", label: "kein Datensatz" };
  const sla = source.freshnessSlaMinutes;
  const age = formatAgeFromMinutes(minutes);
  if (!sla) return { freshness: "UNKNOWN", label: age };
  if (minutes <= sla) return { freshness: "FRESH", label: `Aktuell · ${age}` };
  if (minutes <= sla * 3) return { freshness: "AGING", label: `Älter · ${age}` };
  return { freshness: "STALE", label: `Veraltet · ${age}` };
}

function shareLabel(
  source: DataSourceDefinition,
  dimension: "completeness" | "consistency",
  facts: SourceFacts,
): { value: number | null; label: string } {
  if (!source.quality.includes(dimension) || facts.records === 0)
    return { value: null, label: "nicht geprüft" };
  const bad = dimension === "completeness" ? facts.incomplete : facts.inconsistent;
  const share = (facts.records - bad) / facts.records;
  const what = dimension === "completeness" ? source.completenessLabel : source.consistencyLabel;
  if (bad === 0) return { value: 1, label: `100 % · keine ${what}` };
  return { value: share, label: `${bad} von ${facts.records} · ${what}` };
}

export function buildDataHealth(
  facts: DataQualityFacts,
  nowIso: string,
  sources: DataSourceDefinition[] = DATA_SOURCES,
): DataHealthRow[] {
  return sources.map((source) => {
    const f = facts[source.id];
    const minutes = minutesSince(f.lastRecordAt, nowIso);
    const availability = availabilityOf(source, f);
    const completeness = shareLabel(source, "completeness", f);
    const consistency = shareLabel(source, "consistency", f);
    return {
      source,
      availability: availability.availability,
      availabilityLabel: availability.label,
      freshness: freshnessOf(source, f, minutes).freshness,
      freshnessLabel: freshnessOf(source, f, minutes).label,
      lastRecordAt: f.lastRecordAt,
      completeness: completeness.value,
      completenessLabel: completeness.label,
      consistency: consistency.value,
      consistencyLabel: consistency.label,
      records: f.records,
    };
  });
}
