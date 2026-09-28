import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDataHealth,
  formatAgeFromMinutes,
  minutesSince,
  type DataQualityFacts,
} from "./data-quality.ts";
import { dataSourceById } from "./registry.ts";

const NOW = "2026-09-28T12:05:00+02:00";

const emptyFacts = (): DataQualityFacts => ({
  website: { records: 0, lastRecordAt: null, incomplete: 0, inconsistent: 0 },
  tasks: { records: 0, lastRecordAt: null, incomplete: 0, inconsistent: 0 },
  staff: { records: 0, lastRecordAt: null, incomplete: 0, inconsistent: 0 },
  occupancy_manual: { records: 0, lastRecordAt: null, incomplete: 0, inconsistent: 0 },
  pms: { records: 0, lastRecordAt: null, incomplete: 0, inconsistent: 0 },
});

const row = (facts: DataQualityFacts, id: string) => {
  const found = buildDataHealth(facts, NOW).find((r) => r.source.id === id);
  assert.ok(found, `missing source row ${id}`);
  return found;
};

describe("age helpers", () => {
  it("counts whole minutes against the server clock", () => {
    assert.equal(minutesSince("2026-09-28T12:03:30+02:00", NOW), 1);
    assert.equal(minutesSince(null, NOW), null);
    assert.equal(formatAgeFromMinutes(0.2), "gerade eben");
    assert.equal(formatAgeFromMinutes(90), "vor 1 Std.");
  });
});

describe("availability", () => {
  it("reports a live source with records as available", () => {
    const facts = emptyFacts();
    facts.website = { records: 3, lastRecordAt: NOW, incomplete: 0, inconsistent: 0 };
    const website = row(facts, "website");
    assert.equal(website.availability, "AVAILABLE");
    assert.equal(website.availabilityLabel, "Live");
  });

  it("separates 'no arrivals today' from 'no data source'", () => {
    const facts = emptyFacts();
    // A source with history but nothing captured for today is a gap in the
    // current period, not a dead source.
    facts.occupancy_manual = {
      records: 0,
      lastRecordAt: "2026-09-25T07:00:00+02:00",
      incomplete: 0,
      inconsistent: 0,
    };
    const occupancy = row(facts, "occupancy_manual");
    assert.equal(occupancy.availability, "PARTIAL");
    assert.equal(occupancy.availabilityLabel, "Aktuell keine Daten");
    // A source that never produced anything is missing, not zero.
    assert.equal(row(emptyFacts(), "occupancy_manual").availability, "MISSING");
  });

  it("never claims a connected PMS", () => {
    const pms = row(emptyFacts(), "pms");
    assert.equal(pms.availability, "MISSING");
    assert.equal(pms.availabilityLabel, "Nicht verbunden");
    assert.equal(dataSourceById("pms").connected, false);
  });
});

describe("freshness", () => {
  it("grades against the source's own SLA", () => {
    const facts = emptyFacts();
    facts.website = { records: 1, lastRecordAt: NOW, incomplete: 0, inconsistent: 0 };
    assert.equal(row(facts, "website").freshness, "FRESH");
    facts.website = { records: 1, lastRecordAt: "2026-09-27T11:00:00+02:00", incomplete: 0, inconsistent: 0 };
    assert.equal(row(facts, "website").freshness, "AGING");
    facts.website = { records: 1, lastRecordAt: "2026-09-20T11:00:00+02:00", incomplete: 0, inconsistent: 0 };
    assert.equal(row(facts, "website").freshness, "STALE");
  });

  it("says unknown instead of fresh when no record exists", () => {
    const website = row(emptyFacts(), "website");
    assert.equal(website.freshness, "UNKNOWN");
    assert.equal(website.freshnessLabel, "kein Datensatz");
  });
});

describe("completeness and consistency", () => {
  it("computes shares and names the missing records", () => {
    const facts = emptyFacts();
    facts.tasks = {
      records: 4,
      lastRecordAt: NOW,
      incomplete: 1,
      inconsistent: 0,
    };
    const tasks = row(facts, "tasks");
    assert.equal(tasks.completeness, 0.75);
    assert.equal(tasks.completenessLabel, "1 von 4 · offene Aufgaben ohne Fälligkeitsdatum");
    // Tasks have no consistency check declared — "not checked" beats a fake 100 %.
    assert.equal(tasks.consistency, null);
    assert.equal(tasks.consistencyLabel, "nicht geprüft");
  });

  it("reports a clean source as 100 % without a zero denominator", () => {
    const facts = emptyFacts();
    facts.website = { records: 2, lastRecordAt: NOW, incomplete: 0, inconsistent: 0 };
    const website = row(facts, "website");
    assert.equal(website.completeness, 1);
    assert.equal(website.consistency, 1);
    const empty = row(emptyFacts(), "website");
    assert.equal(empty.completeness, null);
    assert.equal(empty.consistency, null);
  });
});
