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
    const typeLabel = { ROOM: "Zimmer", TABLE: "Tisch", OCCASION: "Anlass" }[d.type];
    await event(tx, type, "inquiry", inquiryId, null, inquiryId, "INPUT");
    await tx.query(
      "insert into tasks(id,title,department,source_type,source_id) values($1,$2,$3,$4,$5)",
      [
        taskId,
        `Neue ${typeLabel}-Anfrage bearbeiten`,
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
/**
 * Analytic range ids accepted by readDashboard. "heute" keeps operative KPIs
 * unchanged (they are always today) and switches the inquiry chart to hourly
 * buckets — the only granularity the underlying data actually has.
 */
const DASHBOARD_RANGES = { heute: 1, "7tage": 7, "30tage": 30 };

/**
 * @param options.range analytic range id (see DASHBOARD_RANGES)
 * @param options.staleInquiryHours age that defines the "still in status NEW"
 *   attention set — comes from the metric registry, never from a SQL literal
 * @param options.responseTargetMinutes / responseWarningMinutes /
 *   responseCriticalMinutes age bands of the inquiry response metric
 */
export async function readDashboard(db, actor, options = {}) {
  const {
    range: rangeId = "7tage",
    staleInquiryHours = 24,
    responseTargetMinutes = 30,
    responseWarningMinutes = 60,
    responseCriticalMinutes = 120,
  } = options;
  const days = DASHBOARD_RANGES[rangeId] ?? DASHBOARD_RANGES["7tage"];
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const [clock] = await tx.query(
      "select now()::text as generated_at, (now() at time zone 'Europe/Berlin')::date::text as today",
    );
    const [counts] = await tx.query(`select
 (select count(*)::int from inquiries where status not in ('CLOSED','DECLINED','CONFIRMED')) as open_inquiries,
 (select count(*)::int from inquiries where (created_at at time zone 'Europe/Berlin')::date=(now() at time zone 'Europe/Berlin')::date) as new_inquiries_today,
 (select count(*)::int from inquiries where status='NEW' and created_at < now() - ($1::int * interval '1 hour')) as stale_inquiries,
 (select min(created_at)::text from inquiries where status='NEW') as oldest_new_inquiry_at,
 (select count(*)::int from tasks where status not in ('DONE','CANCELLED')) as open_tasks,
 (select count(*)::int from tasks where status not in ('DONE','CANCELLED') and due_at<now()) as overdue_tasks,
 (select count(*)::int from tasks where status='BLOCKED') as blocked_tasks,
 (select count(*)::int from tasks where (completed_at at time zone 'Europe/Berlin')::date=(now() at time zone 'Europe/Berlin')::date) as completed_tasks_today,
 (select count(*)::int from staff_profiles where active) as active_staff`,
      [staleInquiryHours]);
    const [occupancyToday] = await tx.query(
      `select date::text as date, occupancy_rate::float as occupancy_rate, arrivals, departures,
              rooms_total, rooms_occupied, captured_at::text as captured_at, source
       from occupancy_snapshots
       where date=(now() at time zone 'Europe/Berlin')::date
       order by captured_at desc limit 1`,
    );
    // Latest snapshot per day; occupancy has day resolution (manual capture),
    // never invent intraday values.
    const occupancySeries = await tx.query(
      `select distinct on (date) date::text as date, occupancy_rate::float as value
       from occupancy_snapshots
       where date > (now() at time zone 'Europe/Berlin')::date - $1::int
       order by date, captured_at desc`,
      [days],
    );
    const [occupancyCompare] = await tx.query(
      `select
        (select avg(occupancy_rate)::float from occupancy_snapshots
          where date > (now() at time zone 'Europe/Berlin')::date - $1::int) as current_avg,
        (select avg(occupancy_rate)::float from occupancy_snapshots
          where date > (now() at time zone 'Europe/Berlin')::date - (2 * $1::int)
            and date <= (now() at time zone 'Europe/Berlin')::date - $1::int) as previous_avg`,
      [days],
    );
    const granularity = days === 1 ? "hour" : "day";
    const bucket = granularity === "hour"
      ? "to_char((created_at at time zone 'Europe/Berlin'), 'YYYY-MM-DD HH24:00')"
      : "(created_at at time zone 'Europe/Berlin')::date::text";
    const bucketWhere = granularity === "hour"
      ? "(created_at at time zone 'Europe/Berlin')::date = (now() at time zone 'Europe/Berlin')::date"
      : `created_at >= ((now() at time zone 'Europe/Berlin')::date - ($1::int - 1)) at time zone 'Europe/Berlin'`;
    const inquiryRows = await tx.query(
      `select ${bucket} as bucket,
              cast(count(*) filter (where type='ROOM') as int) as room_count,
              cast(count(*) filter (where type='TABLE') as int) as table_count,
              cast(count(*) filter (where type='OCCASION') as int) as occasion_count
       from inquiries where ${bucketWhere}
       group by 1 order by 1`,
      granularity === "hour" ? [] : [days],
    );
    const inquirySeries = {
      granularity,
      points: inquiryRows.map((r) => ({
        bucket: r.bucket,
        ROOM: r.room_count,
        TABLE: r.table_count,
        OCCASION: r.occasion_count,
      })),
    };
    // Fixed 7-day window: this sparkline contextualizes the operative task
    // KPIs (which stay "today") and deliberately ignores the chart range.
    const taskRows = await tx.query(
      `select (completed_at at time zone 'Europe/Berlin')::date::text as date, count(*)::int as value
       from tasks
       where completed_at >= ((now() at time zone 'Europe/Berlin')::date - 6) at time zone 'Europe/Berlin'
       group by 1 order by 1`,
    );
    const recentInquiries = await tx.query(
      `select i.request_id, i.type, i.status, i.created_at::text as created_at,
              i.guest_name, i.arrival::text as arrival, i.departure::text as departure,
              i.guest_count, i.payload_json->>'room' as room, i.payload_json->>'occasion' as occasion,
              t.status as task_status, sp.display_name as task_assignee
       from inquiries i
       left join lateral (
         select * from tasks where source_type='inquiry' and source_id=i.id
         order by created_at desc limit 1
       ) t on true
       left join staff_profiles sp on sp.user_id=t.assignee_user_id
       order by i.created_at desc limit 8`,
    );
    const actionTasks = await tx.query(
      `select t.id, t.title, t.department, t.priority, t.status, t.due_at::text as due_at,
              (t.due_at < now()) as overdue, sp.display_name as assignee_name
       from tasks t
       left join staff_profiles sp on sp.user_id=t.assignee_user_id
       where t.status in ('OPEN','IN_PROGRESS','BLOCKED')
       order by (t.due_at < now()) desc nulls last,
                (t.priority='URGENT') desc,
                (t.status='BLOCKED') desc,
                t.due_at asc nulls last,
                t.created_at desc
       limit 8`,
    );
    // Time-to-first-action for the inquiry response metric. "Unanswered" is
    // event-sourced, not guessed: an inquiry counts as answered once its status
    // left NEW or its auto-created follow-up task produced any event other
    // than task.created (assigned/started/blocked/completed).
    const [response] = await tx.query(
      `with unanswered as (
   select i.created_at
   from inquiries i
   where i.status='NEW'
     and not exists (
       select 1 from tasks t join task_events e on e.task_id=t.id
       where t.source_type='inquiry' and t.source_id=i.id and e.event_type<>'task.created'
     )
 )
 select (select count(*)::int from unanswered) as unanswered,
   (select count(*)::int from unanswered where created_at < now() - ($1::int * interval '1 minute')) as beyond_target,
   (select count(*)::int from unanswered where created_at < now() - ($2::int * interval '1 minute')) as beyond_warning,
   (select count(*)::int from unanswered where created_at < now() - ($3::int * interval '1 minute')) as beyond_critical,
   (select min(created_at)::text from unanswered) as oldest_unanswered_at`,
      [responseTargetMinutes, responseWarningMinutes, responseCriticalMinutes],
    );
    // Data-quality facts: availability (counts), freshness (newest record),
    // completeness (incomplete records) and consistency (records that
    // contradict the rest of the data set). All aggregate, no row transfer.
    const [health] = await tx.query(`select
 (select count(*)::int from inquiries where status not in ('CLOSED','DECLINED','CONFIRMED')) as website_records,
 (select max(created_at)::text from inquiries) as website_last_at,
 (select count(*)::int from inquiries where status not in ('CLOSED','DECLINED','CONFIRMED') and arrival is null) as website_incomplete,
 (select count(*)::int from inquiries i where i.status not in ('CLOSED','DECLINED','CONFIRMED')
   and not exists (select 1 from tasks t where t.source_type='inquiry' and t.source_id=i.id)) as website_inconsistent,
 (select count(*)::int from tasks where status not in ('DONE','CANCELLED')) as task_records,
 (select max(updated_at)::text from tasks) as task_last_at,
 (select count(*)::int from tasks where status not in ('DONE','CANCELLED') and due_at is null) as task_incomplete,
 (select count(*)::int from staff_profiles where active) as staff_records,
 (select max(updated_at)::text from staff_profiles) as staff_last_at,
 (select count(*)::int from occupancy_snapshots where date=(now() at time zone 'Europe/Berlin')::date) as occupancy_records,
 (select max(captured_at)::text from occupancy_snapshots) as occupancy_last_at,
 (select count(*)::int from occupancy_snapshots where date=(now() at time zone 'Europe/Berlin')::date
   and (arrivals is null or departures is null)) as occupancy_incomplete,
 (select count(*)::int from occupancy_snapshots where date=(now() at time zone 'Europe/Berlin')::date and rooms_total>0
   and abs(occupancy_rate - (rooms_occupied::float/rooms_total)) > 0.01) as occupancy_inconsistent`);
    return {
      generated_at: clock.generated_at,
      today: clock.today,
      range: { id: rangeId in DASHBOARD_RANGES ? rangeId : "7tage", days },
      counts,
      occupancy_today: occupancyToday ?? null,
      occupancy_series: occupancySeries,
      occupancy_compare: occupancyCompare,
      inquiry_series: inquirySeries,
      task_series: taskRows,
      recent_inquiries: recentInquiries,
      action_tasks: actionTasks,
      response: {
        unanswered: response.unanswered,
        beyond_target: response.beyond_target,
        beyond_warning: response.beyond_warning,
        beyond_critical: response.beyond_critical,
        oldest_unanswered_at: response.oldest_unanswered_at,
        bands: {
          targetMinutes: responseTargetMinutes,
          warningMinutes: responseWarningMinutes,
          criticalMinutes: responseCriticalMinutes,
        },
      },
      data_health: {
        website: {
          records: health.website_records,
          lastRecordAt: health.website_last_at,
          incomplete: health.website_incomplete,
          inconsistent: health.website_inconsistent,
        },
        tasks: {
          records: health.task_records,
          lastRecordAt: health.task_last_at,
          incomplete: health.task_incomplete,
          inconsistent: 0,
        },
        staff: {
          records: health.staff_records,
          lastRecordAt: health.staff_last_at,
          incomplete: 0,
          inconsistent: 0,
        },
        occupancy_manual: {
          records: health.occupancy_records,
          lastRecordAt: health.occupancy_last_at,
          incomplete: health.occupancy_incomplete,
          inconsistent: health.occupancy_inconsistent,
        },
        pms: { records: 0, lastRecordAt: null, incomplete: 0, inconsistent: 0 },
      },
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
const INQUIRY_STATUSES = ["NEW", "REVIEWED", "CONTACTED", "CONFIRMED", "DECLINED", "CLOSED"];
export async function readInquiries(db, actor) {
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const [clock] = await tx.query("select now()::text as generated_at");
    // Active inquiries only (the pipeline pages never show terminal ones);
    // same "taken over" definition as the dashboard response metric: the
    // follow-up task carries any event beyond task.created.
    const rows = await tx.query(
      `select i.id, i.type, i.guest_name, i.email, i.phone,
              i.arrival::text as arrival, i.departure::text as departure,
              i.guest_count, i.status,
              i.payload_json->>'notes' as notes,
              i.payload_json->>'room' as room,
              i.payload_json->>'occasion' as occasion,
              i.payload_json->>'time' as time,
              i.created_at::text as created_at,
              t.id as task_id, t.status as task_status,
              t.assignee_user_id as task_assignee_id,
              p.display_name as task_assignee_name,
              exists (
                select 1 from task_events e
                where e.task_id = t.id and e.event_type <> 'task.created'
              ) as task_started
       from inquiries i
       left join tasks t on t.source_type='inquiry' and t.source_id = i.id
       left join staff_profiles p on p.user_id = t.assignee_user_id
       where i.status not in ('CLOSED','DECLINED','CONFIRMED')
       order by i.created_at asc
       limit 100`,
    );
    const inquiries = rows.map((r) => ({
      id: r.id,
      type: r.type,
      guest_name: r.guest_name,
      email: r.email,
      phone: r.phone,
      arrival: r.arrival,
      departure: r.departure,
      guest_count: r.guest_count,
      status: r.status,
      notes: r.notes,
      room: r.room,
      occasion: r.occasion,
      time: r.time,
      created_at: r.created_at,
      task: r.task_id
        ? {
            id: r.task_id,
            status: r.task_status,
            assignee_id: r.task_assignee_id,
            assignee_name: r.task_assignee_name,
            started: r.task_started,
          }
        : null,
    }));
    const isUnanswered = (r) => r.status === "NEW" && r.task !== null && !r.task.started;
    const isInProgress = (r) =>
      r.task !== null && r.task.started && !["DONE", "CANCELLED"].includes(r.task.status);
    const unanswered = inquiries.filter(isUnanswered);
    const inProgress = inquiries.filter((r) => !isUnanswered(r) && isInProgress(r));
    const other = inquiries.filter((r) => !isUnanswered(r) && !isInProgress(r));
    return {
      generated_at: clock.generated_at,
      counts: {
        total: inquiries.length,
        unanswered: unanswered.length,
        in_progress: inProgress.length,
        other: other.length,
      },
      unanswered,
      in_progress: inProgress,
      other,
    };
  });
}
export async function changeInquiryStatus(db, actor, input) {
  const d = z
    .object({ id, status: z.enum(INQUIRY_STATUSES) })
    .strict()
    .parse(input);
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const [cur] = await tx.query("select status from inquiries where id=$1 for update", [d.id]);
    if (!cur) throw new Error("NOT_FOUND");
    const transitions = {
      NEW: ["REVIEWED", "DECLINED", "CLOSED"],
      REVIEWED: ["CONTACTED", "DECLINED", "CLOSED"],
      CONTACTED: ["CONFIRMED", "DECLINED", "CLOSED"],
      CONFIRMED: ["CLOSED"],
      DECLINED: [],
      CLOSED: [],
    };
    if (!transitions[cur.status].includes(d.status)) throw new Error("INVALID_TRANSITION");
    await tx.query("update inquiries set status=$2, updated_at=now() where id=$1", [
      d.id,
      d.status,
    ]);
    const type = {
      REVIEWED: "inquiry.reviewed",
      CONTACTED: "inquiry.contacted",
      CONFIRMED: "inquiry.confirmed",
      DECLINED: "inquiry.declined",
      CLOSED: "inquiry.closed",
    }[d.status];
    await event(tx, type, "inquiry", d.id, actor, d.id, "INTERNAL");
    await audit(tx, actor, "inquiry.status.changed", d.id, { status: cur.status }, {
      status: d.status,
    });
  });
}
export async function readTasks(db, actor) {
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const [clock] = await tx.query(
      "select now()::text as generated_at, (now() at time zone 'Europe/Berlin')::date::text as today",
    );
    // Active tasks with their assignee; group assignment (overdue vs open vs
    // in progress vs blocked) happens here so every consumer shares one
    // definition of overdue: active with a due date in the past.
    const rows = await tx.query(
      `select t.id, t.title, t.description, t.department, t.priority, t.status,
              t.assignee_user_id as assignee_id, p.display_name as assignee_name,
              t.due_at::text as due_at, t.created_at::text as created_at,
              t.source_type, t.source_id
       from tasks t
       left join staff_profiles p on p.user_id = t.assignee_user_id
       where t.status in ('OPEN','IN_PROGRESS','BLOCKED')
       order by (t.due_at is null), t.due_at asc, t.created_at asc
       limit 200`,
    );
    const now = Date.parse(clock.generated_at);
    const active = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      department: r.department,
      priority: r.priority,
      status: r.status,
      assignee_id: r.assignee_id,
      assignee_name: r.assignee_name,
      due_at: r.due_at,
      created_at: r.created_at,
      source_type: r.source_type,
      source_id: r.source_id,
      overdue: r.due_at !== null && Date.parse(r.due_at) < now,
    }));
    const overdue = active.filter((t) => t.overdue);
    const inProgress = active.filter((t) => !t.overdue && t.status === "IN_PROGRESS");
    const blocked = active.filter((t) => !t.overdue && t.status === "BLOCKED");
    const open = active.filter(
      (t) => !t.overdue && t.status === "OPEN" && !inProgress.includes(t) && !blocked.includes(t),
    );
    const doneToday = await tx.query(
      `select t.id, t.title, t.department, t.priority,
              p.display_name as assignee_name, t.completed_at::text as completed_at
       from tasks t
       left join staff_profiles p on p.user_id = t.assignee_user_id
       where t.status='DONE'
         and (t.completed_at at time zone 'Europe/Berlin')::date
             = (now() at time zone 'Europe/Berlin')::date
       order by t.completed_at desc
       limit 50`,
    );
    return {
      generated_at: clock.generated_at,
      today: clock.today,
      counts: {
        open: open.length,
        overdue: overdue.length,
        in_progress: inProgress.length,
        blocked: blocked.length,
        done_today: doneToday.length,
      },
      overdue,
      open,
      in_progress: inProgress,
      blocked,
      done_today: doneToday,
    };
  });
}
/**
 * Occupancy page read: today's capture (strictly the Berlin day), the most
 * recent capture overall (fallback state + capacity prefill), the per-day
 * trend over the last 30 Berlin days and the 30-vs-previous-30 average
 * comparison — all with the exact semantics of the dashboard's occupancy
 * card: latest snapshot per day, day resolution, never invented values.
 */
export async function readOccupancy(db, actor) {
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const [clock] = await tx.query(
      "select now()::text as generated_at, (now() at time zone 'Europe/Berlin')::date::text as today",
    );
    const cols = `date::text as date, occupancy_rate::float as occupancy_rate, arrivals, departures,
        rooms_total, rooms_occupied, (rooms_total - rooms_occupied) as rooms_free,
        captured_at::text as captured_at, source`;
    const [todaySnapshot] = await tx.query(
      `select ${cols} from occupancy_snapshots
       where date = (now() at time zone 'Europe/Berlin')::date
       order by captured_at desc limit 1`,
    );
    const [latestSnapshot] = await tx.query(
      `select ${cols} from occupancy_snapshots
       order by date desc, captured_at desc limit 1`,
    );
    // One row per day (latest capture wins), ascending — this feeds both the
    // trend chart and the history list, so they can never disagree.
    const days = await tx.query(
      `select distinct on (date) ${cols}
       from occupancy_snapshots
       where date > (now() at time zone 'Europe/Berlin')::date - 30
       order by date asc, captured_at desc`,
    );
    const [compare] = await tx.query(
      `select
        (select avg(occupancy_rate)::float from occupancy_snapshots
          where date > (now() at time zone 'Europe/Berlin')::date - 30) as current_avg,
        (select avg(occupancy_rate)::float from occupancy_snapshots
          where date > (now() at time zone 'Europe/Berlin')::date - 60
            and date <= (now() at time zone 'Europe/Berlin')::date - 30) as previous_avg`,
    );
    return {
      generated_at: clock.generated_at,
      today: clock.today,
      today_snapshot: todaySnapshot ?? null,
      latest_snapshot: latestSnapshot ?? null,
      days,
      compare,
    };
  });
}
const EVALUATION_RANGES = [30, 90];
/**
 * Evaluation read over a sliding window (Berlin days): inquiry pipeline with
 * event-proven response times, task volume and completion speed, occupancy
 * window aggregates. Every number is derived from real columns/events only —
 * nothing is interpolated across days without captures, and response/completion
 * speeds are averaged solely over rows where both timestamps exist.
 */
export async function readEvaluation(db, actor, options = {}) {
  const days = EVALUATION_RANGES.includes(options.days) ? options.days : 30;
  return db.transaction(async (tx) => {
    await staff(tx, actor, true);
    const [clock] = await tx.query(
      `select now()::text as generated_at,
              (now() at time zone 'Europe/Berlin')::date::text as today,
              ((now() at time zone 'Europe/Berlin')::date - $1::int + 1)::text as window_from`,
      [days],
    );
    const span = "now() - ($1::int * interval '1 day')";
    const [inquiries] = await tx.query(
      `select count(*)::int as total,
        count(*) filter (where status='NEW')::int as s_new,
        count(*) filter (where status='REVIEWED')::int as s_reviewed,
        count(*) filter (where status='CONTACTED')::int as s_contacted,
        count(*) filter (where status='CONFIRMED')::int as s_confirmed,
        count(*) filter (where status='DECLINED')::int as s_declined,
        count(*) filter (where status='CLOSED')::int as s_closed,
        count(*) filter (where type='ROOM')::int as t_room,
        count(*) filter (where type='TABLE')::int as t_table,
        count(*) filter (where type='OCCASION')::int as t_occasion,
        count(arrival)::int as with_arrival,
        avg(arrival - (created_at at time zone 'Europe/Berlin')::date)::float as avg_lead_days
       from inquiries where created_at > ${span}`,
      [days],
    );
    // Response time is event-proven: first INTERNAL status event per inquiry
    // (inquiry.reviewed/contacted/…) — never inferred from status alone,
    // because rows predating the event log have no measurable response.
    const [response] = await tx.query(
      `select count(*)::int as responded,
        avg(extract(epoch from (fe.first_at - i.created_at)) / 60)::float as avg_response_minutes
       from inquiries i
       join lateral (
         select min(occurred_at) as first_at from operational_events e
         where e.entity_type='inquiry' and e.entity_id=i.id and e.direction='INTERNAL'
       ) fe on true
       where i.created_at > ${span} and fe.first_at is not null`,
      [days],
    );
    const [taskVolume] = await tx.query(
      `select count(*) filter (where created_at > ${span})::int as created,
        count(*) filter (where completed_at > ${span})::int as completed
       from tasks`,
      [days],
    );
    const [taskSpeed] = await tx.query(
      `select count(*)::int as completed,
        avg(extract(epoch from (completed_at - created_at)) / 3600)::float as avg_complete_hours
       from tasks where completed_at > ${span}`,
      [days],
    );
    const taskByDepartment = await tx.query(
      `select department, count(*)::int as completed
       from tasks where completed_at > ${span}
       group by department order by completed desc, department asc`,
      [days],
    );
    const [occupancy] = await tx.query(
      `select count(*)::int as days_captured,
        avg(occupancy_rate)::float as avg_rate,
        coalesce(sum(arrivals), 0)::int as arrivals_total,
        coalesce(sum(departures), 0)::int as departures_total
       from occupancy_snapshots
       where date > (now() at time zone 'Europe/Berlin')::date - $1::int`,
      [days],
    );
    const [best] = await tx.query(
      `select date::text as date, occupancy_rate::float as rate
       from occupancy_snapshots
       where date > (now() at time zone 'Europe/Berlin')::date - $1::int
       order by occupancy_rate desc, date asc limit 1`,
      [days],
    );
    const [worst] = await tx.query(
      `select date::text as date, occupancy_rate::float as rate
       from occupancy_snapshots
       where date > (now() at time zone 'Europe/Berlin')::date - $1::int
       order by occupancy_rate asc, date asc limit 1`,
      [days],
    );
    return {
      generated_at: clock.generated_at,
      today: clock.today,
      window: { days, from: clock.window_from },
      inquiries: { ...inquiries, ...response },
      tasks: {
        created: taskVolume.created,
        completed: taskVolume.completed,
        avg_complete_hours: taskSpeed.avg_complete_hours,
        by_department: taskByDepartment,
      },
      occupancy: {
        days_captured: occupancy.days_captured,
        avg_rate: occupancy.avg_rate,
        arrivals_total: occupancy.arrivals_total,
        departures_total: occupancy.departures_total,
        best: best ?? null,
        worst: worst ?? null,
      },
    };
  });
}
