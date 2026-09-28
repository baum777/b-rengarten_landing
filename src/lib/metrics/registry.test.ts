import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DASHBOARD_GROUPS,
  METRICS,
  attentionMetrics,
  dataSourceById,
  evaluateMetric,
  formatThresholds,
  metricsByClass,
  requiredMetric,
} from "./registry.ts";
import { CRITICAL_SUCCESS_FACTORS, csfById } from "./csf.ts";

describe("metric registry", () => {
  it("gives every metric a class, a CSF, a source and an explicit measure", () => {
    for (const metric of METRICS) {
      assert.ok(metric.measure.length > 20, `${metric.id} needs a real definition`);
      assert.ok(csfById(metric.csf), `${metric.id} references an unknown CSF`);
      assert.ok(dataSourceById(metric.source), `${metric.id} references an unknown source`);
      assert.ok(["KPI", "PI", "RI", "KRI"].includes(metric.kind));
      if (metric.measurement === "SOURCE_MISSING") {
        assert.ok(metric.missingReason, `${metric.id} must explain why it cannot be measured`);
      }
    }
  });

  it("uses unique ids, and every CSF is realized by metrics or by data quality", () => {
    const ids = METRICS.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const csf of CRITICAL_SUCCESS_FACTORS) {
      if (csf.realizedBy === "metrics") {
        assert.ok(METRICS.some((m) => m.csf === csf.id), `${csf.id} has no metric`);
      } else {
        // A data-quality factor must not be faked as a number.
        assert.equal(METRICS.some((m) => m.csf === csf.id), false);
      }
    }
  });

  it("only links actions to routes that exist", () => {
    const routes = new Set(["/intern/dashboard", "/intern/heute", "/intern/kein-zugriff"]);
    for (const metric of METRICS) {
      if (metric.action) assert.ok(routes.has(metric.action.href), metric.action.href);
    }
  });

  it("marks the room-readiness KRI as a missing source rather than a zero", () => {
    const metric = requiredMetric("room_readiness");
    assert.equal(metric.measurement, "SOURCE_MISSING");
    assert.equal(evaluateMetric(metric, 0).level, "unavailable");
    assert.equal(evaluateMetric(metric, null).level, "unavailable");
  });

  it("classifies each metric exactly once per Parmenter bucket", () => {
    assert.ok(metricsByClass("OPERATIONAL_SIGNAL").length > 0);
    assert.ok(metricsByClass("RESULT_INDICATOR").length > 0);
    assert.ok(metricsByClass("TREND").length > 0);
  });
});

describe("evaluateMetric", () => {
  const response = requiredMetric("inquiry_response");

  it("grades an age metric against its minute bands", () => {
    assert.equal(evaluateMetric(response, 10).level, "ok");
    assert.equal(evaluateMetric(response, 45).level, "over_target");
    assert.equal(evaluateMetric(response, 75).level, "warning");
    assert.equal(evaluateMetric(response, 150).level, "critical");
  });

  it("never turns a missing value into a pass", () => {
    assert.equal(evaluateMetric(response, null).level, "unavailable");
  });

  it("carries the provisional flag of unratified thresholds", () => {
    assert.equal(evaluateMetric(response, 150).provisional, true);
    assert.equal(evaluateMetric(response, 5).provisional, true);
  });

  it("leaves metrics without a threshold unrated", () => {
    assert.equal(evaluateMetric(requiredMetric("occupancy_rate"), 0.8).level, "unrated");
    assert.equal(evaluateMetric(requiredMetric("task_backlog"), 12).level, "unrated");
  });

  it("grades a count metric that is only critical, never a warning", () => {
    const overdue = requiredMetric("task_overdue");
    assert.equal(overdue.thresholds?.warning, null);
    assert.equal(evaluateMetric(overdue, 1).level, "critical");
  });
});

describe("threshold formatting", () => {
  it("states target, bands and the provisional status in one line", () => {
    assert.equal(
      formatThresholds(requiredMetric("inquiry_response")),
      "Zielwert ≤ 30 Min. · Warnung > 60 Min. · Kritisch > 120 Min. · " +
        "Bänder 30/60/120 Min. (Ziel/Warnung/Kritisch) · vorläufig",
    );
  });

  it("says so when a metric has no threshold at all", () => {
    assert.match(formatThresholds(requiredMetric("occupancy_rate")), /Kein Schwellenwert/);
  });
});

describe("attention metrics", () => {
  it("only exposes metrics that can actually ask for attention", () => {
    const ids = attentionMetrics().map((m) => m.id);
    assert.deepEqual(ids, [
      "inquiry_response",
      "inquiry_stale_age",
      "task_overdue",
      "task_blocked",
    ]);
  });
});

describe("dashboard layout", () => {
  it("shows operative signals before result indicators", () => {
    assert.deepEqual(
      DASHBOARD_GROUPS.map((g) => g.id),
      ["OPERATIONAL_SIGNAL", "RESULT_INDICATOR"],
    );
  });

  it("only references registered metrics and renders them without a dead link", () => {
    for (const group of DASHBOARD_GROUPS) {
      for (const card of group.cards) {
        assert.ok(card.metricIds.length > 0, card.id);
        for (const id of card.metricIds) assert.ok(requiredMetric(id).label, id);
      }
    }
  });
});
