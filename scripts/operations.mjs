import { randomUUID } from "node:crypto";
import { z } from "zod";
export const departments = [
  "MANAGEMENT",
  "RECEPTION",
  "HOUSEKEEPING",
  "RESTAURANT",
  "SERVICE",
  "KITCHEN",
  "TECHNICAL",
  "GENERAL",
];
const id = z.string().min(1).max(100);
const priority = z.enum(["NORMAL", "IMPORTANT", "URGENT"]);
export const taskInput = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(4000).default(""),
    department: z.enum(departments),
    priority: priority.default("NORMAL"),
    assigneeUserId: id.nullable().default(null),
    dueAt: z.iso.datetime().nullable().default(null),
  })
  .strict();
export const briefingInput = z
  .object({
    title: z.string().trim().min(1).max(200),
    body: z.string().min(1).max(4000),
    department: z.enum(departments),
    priority: priority.default("NORMAL"),
  })
  .strict();
export const occupancyInput = z
  .object({
    date: z.iso.date(),
    roomsTotal: z.number().int().nonnegative(),
    roomsAvailable: z.number().int().nonnegative(),
    roomsOccupied: z.number().int().nonnegative(),
    arrivals: z.number().int().nonnegative().nullable(),
    departures: z.number().int().nonnegative().nullable(),
  })
  .strict()
  .refine((x) => x.roomsAvailable + x.roomsOccupied <= x.roomsTotal);
const inquiryInput = z
  .object({
    type: z.enum(["ROOM", "TABLE", "OCCASION"]),
    name: z.string().min(2).max(160),
    email: z.string().email().max(254),
    phone: z.string().max(60).optional(),
    arrival: z.iso.date().nullable().default(null),
    departure: z.iso.date().nullable().default(null),
    guests: z.number().int().min(1).max(400),
    notes: z.string().max(1200).optional(),
    room: z.string().max(100).optional(),
    occasion: z.string().max(160).optional(),
    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .optional(),
  })
  .strict();
export async function staff(tx, userId, admin = false) {
  const [p] = await tx.query(
    "select * from staff_profiles where user_id=$1 and active=true for share",
    [userId],
  );
  if (!p || (admin && p.role !== "ADMIN")) throw new Error("ACCESS_DENIED");
  return p;
}
export async function event(
  tx,
  type,
  entityType,
  entityId,
  actorId,
  correlationId = entityId,
  direction = "INTERNAL",
) {
  await tx.query(
    "insert into operational_events(id,event_type,source,direction,entity_type,entity_id,actor_type,actor_id,correlation_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [
      randomUUID(),
      type,
      actorId ? "internal" : "website",
      direction,
      entityType,
      entityId,
      actorId ? (type === "auth.login" ? "USER" : "STAFF") : "PUBLIC",
      actorId,
      correlationId,
    ],
  );
}
export async function audit(tx, actor, action, entityId, before = null, after = null) {
  await tx.query(
    "insert into audit_log(id,actor_user_id,action,entity_type,entity_id,before_json,after_json) values($1,$2,$3,$4,$5,$6,$7)",
    [
      randomUUID(),
      actor,
      action,
      action.startsWith("task.") ? "task" : "staff",
      entityId,
      before,
      after,
    ],
  );
}
async function taskEvent(tx, taskId, type, actor, payload = {}, correlationId = taskId) {
  await tx.query(
    "insert into task_events(id,task_id,event_type,actor_user_id,payload_json) values($1,$2,$3,$4,$5)",
    [randomUUID(), taskId, type, actor, payload],
  );
  await event(tx, type, "task", taskId, actor, correlationId);
}
export async function persistInquiry(db, input) {
  const d = inquiryInput.parse(input);
  if (d.departure && d.arrival && d.departure <= d.arrival) throw new Error("INVALID_DATES");
  return db.transaction(async (tx) => {
    const inquiryId = randomUUID(),
      taskId = randomUUID();
    await tx.query(
      "insert into inquiries(id,request_id,type,guest_name,email,phone,arrival,departure,guest_count,payload_json) values($1,$1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        inquiryId,
        d.type,
        d.name,
        d.email,
        d.phone ?? null,
        d.arrival,
        d.departure,
        d.guests,
        { notes: d.notes, room: d.room, occasion: d.occasion, time: d.time },
      ],
    );
    const type = {
      ROOM: "hotel.booking.inquiry.created",
      TABLE: "restaurant.reservation.inquiry.created",
      OCCASION: "occasion.inquiry.created",
    }[d.type];
    await event(tx, type, "inquiry", inquiryId, null, inquiryId, "INPUT");
    await tx.query(
      "insert into tasks(id,title,department,source_type,source_id) values($1,$2,$3,$4,$5)",
      [
        taskId,
        `Neue ${d.type}-Anfrage bearbeiten`,
        d.type === "TABLE" ? "RESTAURANT" : "RECEPTION",
        "inquiry",
        inquiryId,
      ],
    );
    await taskEvent(tx, taskId, "task.created", null, { inquiryId }, inquiryId);
    return inquiryId;
  });
}
export async function createTask(db, actor, input) {
  const d = taskInput.parse(input);
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    if (d.assigneeUserId) await staff(tx, d.assigneeUserId);
    const taskId = randomUUID();
    await tx.query(
      "insert into tasks(id,title,description,department,priority,assignee_user_id,created_by_user_id,due_at) values($1,$2,$3,$4,$5,$6,$7,$8)",
      [taskId, d.title, d.description, d.department, d.priority, d.assigneeUserId, actor, d.dueAt],
    );
    await taskEvent(tx, taskId, "task.created", actor);
    return taskId;
  });
}
export async function changeTask(db, actor, input) {
  const d = z
    .object({
      id,
      status: z.enum(["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]).optional(),
      assigneeUserId: id.nullable().optional(),
    })
    .strict()
    .refine((x) => x.status !== undefined || x.assigneeUserId !== undefined)
    .parse(input);
  return db.transaction(async (tx) => {
    const p = await staff(tx, actor);
    const [t] = await tx.query("select * from tasks where id=$1 for update", [d.id]);
    if (
      !t ||
      (p.role !== "ADMIN" && (t.assignee_user_id !== actor || d.assigneeUserId !== undefined))
    )
      throw new Error("ACCESS_DENIED");
    const transitions = {
      OPEN: ["IN_PROGRESS", "BLOCKED", "CANCELLED"],
      IN_PROGRESS: ["BLOCKED", "DONE", "CANCELLED"],
      BLOCKED: ["IN_PROGRESS", "CANCELLED"],
      DONE: [],
      CANCELLED: [],
    };
    if (d.status && !transitions[t.status].includes(d.status))
      throw new Error("INVALID_TRANSITION");
    if (d.assigneeUserId) await staff(tx, d.assigneeUserId);
    const status = d.status ?? t.status,
      assignee = d.assigneeUserId === undefined ? t.assignee_user_id : d.assigneeUserId;
    await tx.query(
      "update tasks set status=$2,assignee_user_id=$3,completed_at=case when $2='DONE' then now() else null end,updated_at=now() where id=$1",
      [d.id, status, assignee],
    );
    const type = d.status
      ? {
          OPEN: "task.reopened",
          IN_PROGRESS: "task.started",
          BLOCKED: "task.blocked",
          DONE: "task.completed",
          CANCELLED: "task.cancelled",
        }[status]
      : "task.assigned";
    await taskEvent(tx, d.id, type, actor, {
      before: t.status,
      after: status,
      assigneeUserId: assignee,
    });
    if (p.role === "ADMIN")
      await audit(
        tx,
        actor,
        "task.admin.override",
        d.id,
        { status: t.status, assigneeUserId: t.assignee_user_id },
        { status, assigneeUserId: assignee },
      );
  });
}
export async function publishBriefing(db, actor, input) {
  const d = briefingInput.parse(input);
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const bid = randomUUID();
    await tx.query(
      "insert into briefings(id,title,body,department,priority,created_by_user_id) values($1,$2,$3,$4,$5,$6)",
      [bid, d.title, d.body, d.department, d.priority, actor],
    );
    await event(tx, "briefing.published", "briefing", bid, actor);
    return bid;
  });
}
export async function acknowledgeBriefing(db, actor, briefingId) {
  id.parse(briefingId);
  return db.transaction(async (tx) => {
    const p = await staff(tx, actor);
    const [b] = await tx.query(
      "select id from briefings where id=$1 and published_at<=now() and (department=$2 or department='GENERAL' or $3='ADMIN')",
      [briefingId, p.department, p.role],
    );
    if (!b) throw new Error("ACCESS_DENIED");
    const rows = await tx.query(
      "insert into briefing_reads(briefing_id,user_id) values($1,$2) on conflict do nothing returning briefing_id",
      [briefingId, actor],
    );
    if (rows.length) await event(tx, "briefing.read", "briefing", briefingId, actor);
  });
}
export async function recordOccupancy(db, actor, input) {
  const d = occupancyInput.parse(input);
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const oid = randomUUID();
    if (!d.roomsTotal) throw new Error("OCCUPANCY_UNKNOWN_WITH_ZERO_CAPACITY");
    await tx.query(
      "insert into occupancy_snapshots(id,date,rooms_total,rooms_available,rooms_occupied,arrivals,departures,occupancy_rate,source) values($1,$2,$3,$4,$5,$6,$7,$8,'manual')",
      [
        oid,
        d.date,
        d.roomsTotal,
        d.roomsAvailable,
        d.roomsOccupied,
        d.arrivals,
        d.departures,
        d.roomsOccupied / d.roomsTotal,
      ],
    );
    await event(tx, "occupancy.recorded", "occupancy", oid, actor);
    return oid;
  });
}
export async function readToday(db, actor) {
  return db.transaction(async (tx) => {
    const p = await staff(tx, actor);
    const tasks = await tx.query(
      "select id,title,description,priority,status,due_at::text,coalesce((due_at at time zone 'Europe/Berlin')::date=(now() at time zone 'Europe/Berlin')::date,false) as due_today from tasks where assignee_user_id=$1 and status not in ('DONE','CANCELLED') order by (priority='URGENT') desc,due_at nulls last,created_at limit 100",
      [actor],
    );
    const briefings = await tx.query(
      "select b.id,b.title,b.body,b.priority,(r.user_id is not null) as read from briefings b left join briefing_reads r on r.briefing_id=b.id and r.user_id=$1 where b.published_at<=now() and (b.department=$2 or b.department='GENERAL' or $3='ADMIN') order by b.published_at desc limit 100",
      [actor, p.department, p.role],
    );
    return { tasks, briefings };
  });
}
export async function readDashboard(db, actor) {
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const [counts] = await tx.query(`select
 (select count(*)::int from inquiries where status not in ('CLOSED','DECLINED','CONFIRMED')) as open_inquiries,
 (select count(*)::int from inquiries where (created_at at time zone 'Europe/Berlin')::date=(now() at time zone 'Europe/Berlin')::date) as new_inquiries_today,
 (select count(*)::int from tasks where status not in ('DONE','CANCELLED')) as open_tasks,
 (select count(*)::int from tasks where status not in ('DONE','CANCELLED') and due_at<now()) as overdue_tasks,
 (select count(*)::int from tasks where (completed_at at time zone 'Europe/Berlin')::date=(now() at time zone 'Europe/Berlin')::date) as completed_tasks_today,
 (select count(*)::int from staff_profiles where active) as active_staff`);
    const [occupancy] = await tx.query(
      "select arrivals,departures,occupancy_rate::float as occupancy_rate from occupancy_snapshots where date=(now() at time zone 'Europe/Berlin')::date order by captured_at desc limit 1",
    );
    const inquiries = await tx.query(
      "select request_id,type,status,created_at::text from inquiries order by created_at desc limit 20",
    );
    return {
      ...counts,
      arrivals: occupancy?.arrivals ?? null,
      departures: occupancy?.departures ?? null,
      occupancy: occupancy?.occupancy_rate ?? null,
      inquiries,
    };
  });
}
export async function changeStaff(db, actor, input) {
  const d = z
    .object({
      userId: id,
      role: z.enum(["ADMIN", "STAFF"]).optional(),
      active: z.boolean().optional(),
    })
    .strict()
    .refine((x) => x.role !== undefined || x.active !== undefined)
    .parse(input);
  return db.transaction(async (tx) => {
    // Serialize authority changes, including last-admin checks and bootstrap.
    await tx.query("select id from bootstrap_state where id=true for update");
    await staff(tx, actor, true);
    const [p] = await tx.query("select * from staff_profiles where user_id=$1 for update", [
      d.userId,
    ]);
    if (!p) throw new Error("NOT_FOUND");
    const role = d.role ?? p.role,
      active = d.active ?? p.active;
    if (p.role === "ADMIN" && p.active && (role !== "ADMIN" || !active)) {
      const [remaining] = await tx.query(
        "select count(*)::int as n from staff_profiles where role='ADMIN' and active and user_id<>$1",
        [d.userId],
      );
      if (remaining.n === 0) throw new Error("LAST_ADMIN");
    }
    await tx.query(
      "update staff_profiles set role=$2,active=$3,updated_at=now() where user_id=$1",
      [d.userId, role, active],
    );
    if (role !== p.role)
      await audit(tx, actor, "staff.role.change", d.userId, { role: p.role }, { role });
    if (active !== p.active)
      await audit(
        tx,
        actor,
        active ? "staff.activate" : "staff.deactivate",
        d.userId,
        { active: p.active },
        { active },
      );
    if (!active) {
      await tx.query('delete from session where "userId"=$1', [d.userId]);
      await event(tx, "staff.deactivated", "staff", d.userId, actor);
    }
  });
}
