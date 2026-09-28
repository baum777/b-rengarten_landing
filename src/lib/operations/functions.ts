import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireStaff, requireAdmin } from "@/lib/permissions/guards";

export const getToday = createServerFn({ method: "GET" })
  .middleware([requireStaff])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const { readToday } = await import("../../../scripts/operations.mjs");
    return readToday(await getSql(), context.staff.userId);
  });
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .validator((x: unknown) =>
    z
      .object({ range: z.enum(["heute", "7tage", "30tage"]).default("7tage") })
      .strict()
      .parse(x ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { readDashboard } = await import("../../../scripts/operations.mjs");
    // Thresholds live in the metric registry and travel into the aggregation
    // as bound parameters — the dashboard never carries its own SQL literals.
    const { metricById } = await import("@/lib/metrics/registry");
    const stale = metricById("inquiry_stale_age");
    const bands = metricById("inquiry_response")?.thresholds?.bands;
    return readDashboard(await getSql(), context.staff.userId, {
      range: data.range,
      staleInquiryHours: stale?.thresholds?.attentionAfterHours ?? 24,
      responseTargetMinutes: bands?.targetMinutes ?? 30,
      responseWarningMinutes: bands?.warningMinutes ?? 60,
      responseCriticalMinutes: bands?.criticalMinutes ?? 120,
    });
  });
export const getInquiries = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .validator((x: unknown) => z.object({}).strict().parse(x ?? {}))
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const { readInquiries } = await import("../../../scripts/operations.mjs");
    return readInquiries(await getSql(), context.staff.userId);
  });
export const setInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((x: unknown) =>
    z
      .object({
        id: z.string().max(100),
        status: z.enum(["NEW", "REVIEWED", "CONTACTED", "CONFIRMED", "DECLINED", "CLOSED"]),
      })
      .strict()
      .parse(x),
  )
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { changeInquiryStatus } = await import("../../../scripts/operations.mjs");
    await changeInquiryStatus(await getSql(), context.staff.userId, data);
    return { ok: true };
  });
export const getTasks = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .validator((x: unknown) => z.object({}).strict().parse(x ?? {}))
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const { readTasks } = await import("../../../scripts/operations.mjs");
    return readTasks(await getSql(), context.staff.userId);
  });
export const getOccupancy = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .validator((x: unknown) => z.object({}).strict().parse(x ?? {}))
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const { readOccupancy } = await import("../../../scripts/operations.mjs");
    return readOccupancy(await getSql(), context.staff.userId);
  });
export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .validator((x: unknown) =>
    z
      .object({
        id: z.string().max(100),
        status: z.enum(["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]).optional(),
        assigneeUserId: z.string().max(100).nullable().optional(),
      })
      .strict()
      .parse(x),
  )
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { changeTask } = await import("../../../scripts/operations.mjs");
    await changeTask(await getSql(), context.staff.userId, data);
    return { ok: true };
  });
export const readBriefing = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .validator((x: unknown) =>
    z
      .object({ id: z.string().max(100) })
      .strict()
      .parse(x),
  )
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { acknowledgeBriefing } = await import("../../../scripts/operations.mjs");
    await acknowledgeBriefing(await getSql(), context.staff.userId, data.id);
    return { ok: true };
  });
export const addTask = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((x: unknown) => x)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { createTask } = await import("../../../scripts/operations.mjs");
    return { id: await createTask(await getSql(), context.staff.userId, data) };
  });
export const addBriefing = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((x: unknown) => x)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { publishBriefing } = await import("../../../scripts/operations.mjs");
    return { id: await publishBriefing(await getSql(), context.staff.userId, data) };
  });
export const addOccupancy = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((x: unknown) => x)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { recordOccupancy } = await import("../../../scripts/operations.mjs");
    return { id: await recordOccupancy(await getSql(), context.staff.userId, data) };
  });
export const updateStaff = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((x: unknown) => x)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { changeStaff } = await import("../../../scripts/operations.mjs");
    await changeStaff(await getSql(), context.staff.userId, data);
    return { ok: true };
  });
