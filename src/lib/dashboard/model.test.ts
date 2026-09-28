import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ATTENTION_CLEAR,
  INQUIRY_STALE_HOURS,
  bucketLabel,
  buildAttention,
  fillDailyInquiryPoints,
  fillDailySeries,
  fillHourlySeries,
  formatClock,
  formatDueLabel,
  formatGuests,
  formatPercent,
  formatStay,
  inquiryPointTotal,
  percentPointsDelta,
  priorityLabel,
  relativeAge,
  sparkline,
  taskStatusLabel,
  type DashboardCounts,
  type InquirySeriesPoint,
} from "./model.ts";

const NOW = "2026-09-28T12:05:00+02:00";

const emptyCounts: DashboardCounts = {
  open_inquiries: 0,
  new_inquiries_today: 0,
  stale_inquiries: 0,
  oldest_new_inquiry_at: null,
  open_tasks: 0,
  overdue_tasks: 0,
  blocked_tasks: 0,
  completed_tasks_today: 0,
  active_staff: 0,
};

describe("labels", () => {
  it("map operational enums to German staff language", () => {
    assert.equal(taskStatusLabel("IN_PROGRESS"), "In Arbeit");
    assert.equal(taskStatusLabel("MYSTERY"), "MYSTERY");
    assert.equal(priorityLabel("URGENT"), "Dringend");
  });
});

describe("relativeAge", () => {
  it("renders German relative ages against the server clock", () => {
    assert.equal(relativeAge("2026-09-28T11:57:00+02:00", NOW), "vor 8 Min.");
    assert.equal(relativeAge("2026-09-28T09:05:00+02:00", NOW), "vor 3 Std.");
    assert.equal(relativeAge("2026-09-26T12:05:00+02:00", NOW), "vor 2 Tg.");
    assert.equal(relativeAge(null, NOW), "");
    assert.equal(relativeAge("2026-09-28T12:05:30+02:00", NOW), "gerade eben");
  });
});

describe("date formatting", () => {
  it("formats stays, guests, clock and percents without day drift", () => {
    assert.equal(formatStay("2030-10-03", "2030-10-06"), "3. Okt.–6. Okt.");
    assert.equal(formatStay("2030-10-03", null), "3. Okt.");
    assert.equal(formatStay(null, null), "");
    assert.equal(formatGuests(1), "1 Gast");
    assert.equal(formatGuests(2), "2 Gäste");
    assert.equal(formatClock("2026-09-28T12:05:00+02:00"), "12:05");
    assert.equal(formatPercent(0.4), "40 %");
    assert.equal(formatPercent(null), "–");
  });
});

describe("percentPointsDelta", () => {
  it("compares windows in rounded percentage points and refuses half data", () => {
    assert.equal(percentPointsDelta(0.42, 0.4), "+2");
    assert.equal(percentPointsDelta(0.38, 0.4), "−2");
    assert.equal(percentPointsDelta(0.4, 0.4), "±0");
    assert.equal(percentPointsDelta(null, 0.4), null);
    assert.equal(percentPointsDelta(0.4, null), null);
  });
});

describe("buildAttention", () => {
  it("is quiet when everything is inside thresholds", () => {
    assert.deepEqual(buildAttention(emptyCounts), []);
  });

  it("escalates overdue tasks to critical, staleness and blocks to warnings", () => {
    const items = buildAttention({
      ...emptyCounts,
      overdue_tasks: 2,
      stale_inquiries: 1,
      blocked_tasks: 3,
    });
    assert.deepEqual(
      items.map((i) => [i.severity, i.title]),
      [
        ["critical", "2 Aufgaben überfällig"],
        ["warning", "1 Anfrage länger als 24 h offen"],
        ["warning", "3 Aufgaben blockiert"],
      ],
    );
    assert.equal(INQUIRY_STALE_HOURS, 24);
  });

  it("keeps a clear verdict constant for the empty state", () => {
    assert.ok(ATTENTION_CLEAR.title.includes("Keine kritischen"));
  });
});

describe("fillDailySeries", () => {
  it("zero-fills a window ending today without shifting days", () => {
    const out = fillDailySeries(
      "2026-09-28",
      [
        { date: "2026-09-26", value: 2 },
        { date: "2026-09-28", value: 5 },
      ],
      4,
    );
    assert.deepEqual(
      out,
      [
        { date: "2026-09-25", value: 0 },
        { date: "2026-09-26", value: 2 },
        { date: "2026-09-27", value: 0 },
        { date: "2026-09-28", value: 5 },
      ],
    );
  });
});

describe("fillHourlySeries", () => {
  it("zero-fills today up to the current Berlin hour", () => {
    const points: InquirySeriesPoint[] = [
      { bucket: "2026-09-28 09:00", ROOM: 1, TABLE: 0, OCCASION: 0 },
    ];
    const out = fillHourlySeries("2026-09-28", points, NOW);
    assert.equal(out.length, 13); // 00:00..12:00 inclusive
    assert.deepEqual(out[9], points[0]);
    assert.deepEqual(out[8], { bucket: "2026-09-28 08:00", ROOM: 0, TABLE: 0, OCCASION: 0 });
  });
});

describe("series helpers", () => {
  it("sum inquiry types and label buckets in German", () => {
    assert.equal(inquiryPointTotal({ bucket: "x", ROOM: 1, TABLE: 2, OCCASION: 3 }), 6);
    assert.equal(bucketLabel("hour", "2026-09-28 09:00"), "09:00");
    assert.equal(bucketLabel("day", "2026-10-03"), "3. Okt.");
  });

  it("sparkline keeps an all-zero series flat instead of inventing shape", () => {
    assert.equal(sparkline([0, 0, 0], 100, 24).points, "0,24 100,24");
    const geometry = sparkline([1, 3, 2], 100, 24);
    assert.equal(geometry.points.split(" ").length, 3);
  });

  it("zero-fills typed inquiry points per day", () => {
    const out = fillDailyInquiryPoints(
      "2026-09-28",
      [{ bucket: "2026-09-27", ROOM: 1, TABLE: 2, OCCASION: 0 }],
      3,
    );
    assert.deepEqual(out, [
      { bucket: "2026-09-26", ROOM: 0, TABLE: 0, OCCASION: 0 },
      { bucket: "2026-09-27", ROOM: 1, TABLE: 2, OCCASION: 0 },
      { bucket: "2026-09-28", ROOM: 0, TABLE: 0, OCCASION: 0 },
    ]);
  });

  it("labels due dates relative to the Berlin day", () => {
    const due = "2026-09-28T14:05:00+02:00";
    assert.equal(formatDueLabel(due, NOW, false), "heute, 14:05");
    assert.equal(formatDueLabel(due, NOW, true), "überfällig · 28. Sept., 14:05");
    assert.equal(formatDueLabel("2026-10-03T10:00:00+02:00", NOW, false), "3. Okt., 10:00");
    assert.equal(formatDueLabel(null, NOW, false), "ohne Fälligkeit");
  });
});
