import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { betterAuth } from "better-auth";
import { provisionAccount } from "./provisioning.mjs";
import { bootstrapProfile } from "./bootstrap.mjs";
import {
  persistInquiry,
  createTask,
  changeTask,
  publishBriefing,
  acknowledgeBriefing,
  recordOccupancy,
  readToday,
  readDashboard,
  changeStaff,
} from "./operations.mjs";
const url = process.env.TEST_DATABASE_URL;
const suite = url ? test : test.skip;
let pool, db, adminId, staffId, otherId;
const secret = randomBytes(32).toString("hex"),
  password = randomBytes(24).toString("hex");
const schema = `closure_${randomUUID().replaceAll("-", "")}`;
const identity = (email) => ({ email, name: "Test Identity", password, department: "RECEPTION" });
function wrap(client) {
  return { query: async (text, values = []) => (await client.query(text, values)).rows };
}
before(async () => {
  if (!url) return;
  const control = new pg.Pool({ connectionString: url });
  await control.query(`create schema "${schema}"`);
  await control.end();
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 8 });
  db = {
    ...wrap(pool),
    transaction: async (work) => {
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        const v = await work(wrap(c));
        await c.query("COMMIT");
        return v;
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
    },
  };
  const env = { ...process.env, DATABASE_URL: url, PGOPTIONS: `-c search_path=${schema}` };
  const first = execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, encoding: "utf8" });
  assert.match(first, /4 migration/);
  const second = execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, encoding: "utf8" });
  assert.match(second, /up to date/);
});
after(async () => {
  if (pool) await pool.end();
});
suite("migration inventory, indexes, FK and enum constraints", async () => {
  assert.equal((await db.query("select * from _migrations")).length, 4);
  assert.equal(
    (
      await db.query(
        "select tablename from pg_tables where schemaname=current_schema() and tablename in ('staff_profiles','inquiries','tasks','task_events','briefings','briefing_reads','operational_events','occupancy_snapshots','audit_log')",
      )
    ).length,
    9,
  );
  assert.ok(
    (await db.query("select indexname from pg_indexes where schemaname=current_schema()")).length >=
      25,
  );
  await assert.rejects(
    db.query(
      "insert into staff_profiles(id,user_id,email,display_name,role,department) values('bad','missing','a','a','STAFF','GENERAL')",
    ),
    { code: "23503" },
  );
  await assert.rejects(
    db.query("insert into tasks(id,title,department,status) values('bad','bad','GENERAL','BAD')"),
    { code: "23514" },
  );
});
suite(
  "bootstrap missing env and wrong email denied, parallel exactly once, permanently closed",
  async () => {
    await assert.rejects(
      provisionAccount(pool, identity("owner@example.invalid"), { bootstrap: true, secret }),
    );
    await assert.rejects(
      provisionAccount(pool, identity("wrong@example.invalid"), {
        bootstrap: true,
        bootstrapEmail: "owner@example.invalid",
        secret,
      }),
    );
    const results = await Promise.allSettled(
      [1, 2].map(() =>
        provisionAccount(pool, identity("OWNER@example.invalid"), {
          bootstrap: true,
          bootstrapEmail: "owner@example.invalid",
          secret,
        }),
      ),
    );
    assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
    adminId = results.find((x) => x.status === "fulfilled").value;
    assert.equal((await db.query("select * from staff_profiles where role='ADMIN'")).length, 1);
    await assert.rejects(
      provisionAccount(pool, identity("second@example.invalid"), {
        bootstrap: true,
        bootstrapEmail: "second@example.invalid",
        secret,
      }),
    );
    assert.equal(
      (await db.query("select * from audit_log where action='bootstrap.admin.created'")).length,
      1,
    );
  },
);
suite(
  "atomic Better Auth API provisioning, password hashing, login and signup denial",
  async () => {
    staffId = await provisionAccount(pool, identity("staff@example.invalid"), {
      actorId: adminId,
      secret,
    });
    otherId = await provisionAccount(pool, identity("other@example.invalid"), {
      actorId: adminId,
      secret,
    });
    await assert.rejects(
      provisionAccount(pool, identity("escalate@example.invalid"), { actorId: staffId, secret }),
    );
    await assert.rejects(
      provisionAccount(
        pool,
        { ...identity("mass@example.invalid"), role: "ADMIN" },
        { actorId: adminId, secret },
      ),
    );
    const [a] = await db.query('select password from account where "userId"=$1', [staffId]);
    assert.notEqual(a.password, password);
    assert.ok(a.password.length > 30);
    const auth = betterAuth({
      baseURL: "http://localhost:8080",
      secret,
      database: pool,
      emailAndPassword: { enabled: true, disableSignUp: true },
    });
    await assert.rejects(
      auth.api.signUpEmail({ body: { email: "public@example.invalid", name: "Public", password } }),
    );
    await assert.rejects(
      auth.api.signInEmail({
        body: { email: "staff@example.invalid", password: "wrong-password" },
      }),
    );
    const session = await auth.api.signInEmail({
      body: { email: "staff@example.invalid", password },
    });
    assert.equal(session.user.id, staffId);
    await db.query(
      "create function reject_audit_insert() returns trigger language plpgsql as $$ begin raise exception 'test rollback'; end $$",
    );
    await db.query(
      "create trigger injected_audit_failure before insert on audit_log for each row execute function reject_audit_insert()",
    );
    await assert.rejects(
      provisionAccount(pool, identity("rollback@example.invalid"), { actorId: adminId, secret }),
    );
    assert.equal(
      (await db.query('select id from "user" where email=$1', ["rollback@example.invalid"])).length,
      0,
    );
    await db.query("drop trigger injected_audit_failure on audit_log");
  },
);
suite("anonymous, no profile, STAFF/admin and inactive boundaries", async () => {
  await assert.rejects(readToday(db, "anonymous"));
  await db.query(
    'insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values($1,$2,$3,false,now(),now())',
    ["unprofiled", "No Profile", "no-profile@example.invalid"],
  );
  await assert.rejects(readToday(db, "unprofiled"));
  await assert.rejects(readDashboard(db, staffId));
  assert.ok(await readToday(db, staffId));
  assert.equal((await readDashboard(db, adminId)).occupancy_today, null);
  await db.query("update staff_profiles set active=false where user_id=$1", [staffId]);
  await assert.rejects(readToday(db, staffId));
  await db.query("update staff_profiles set active=true where user_id=$1", [staffId]);
  await assert.rejects(
    db.transaction((tx) => bootstrapProfile(tx, "unprofiled", "no-profile@example.invalid")),
  );
});
suite("inquiry transaction, no partial writes, bounded input and parameterization", async () => {
  const input = {
    type: "ROOM",
    name: "O'Guest",
    email: "guest@example.invalid",
    arrival: "2030-01-01",
    departure: "2030-01-03",
    guests: 2,
  };
  const inquiry = await persistInquiry(db, input);
  assert.equal((await db.query("select * from inquiries where id=$1", [inquiry])).length, 1);
  assert.equal((await db.query("select * from tasks where source_id=$1", [inquiry])).length, 1);
  assert.equal(
    (await db.query("select * from operational_events where correlation_id=$1", [inquiry])).length,
    2,
  );
  for (const type of ["TABLE", "OCCASION"]) await persistInquiry(db, { ...input, type });
  await assert.rejects(persistInquiry(db, { ...input, notes: "x".repeat(20000) }));
  await db.query(
    "create function reject_event_insert() returns trigger language plpgsql as $$ begin raise exception 'test rollback'; end $$",
  );
  await db.query(
    "create trigger injected_event_failure before insert on operational_events for each row execute function reject_event_insert()",
  );
  const before = (await db.query("select count(*)::int as n from inquiries"))[0].n;
  await assert.rejects(persistInquiry(db, input));
  assert.equal((await db.query("select count(*)::int as n from inquiries"))[0].n, before);
  await db.query("drop trigger injected_event_failure on operational_events");
});
suite("task assign, cross-user denial, transition and append-only history", async () => {
  const tid = await createTask(db, adminId, { title: "Inspect room", department: "RECEPTION" });
  await changeTask(db, adminId, { id: tid, assigneeUserId: staffId });
  await assert.rejects(changeTask(db, otherId, { id: tid, status: "IN_PROGRESS" }));
  await assert.rejects(changeTask(db, staffId, { id: tid, assigneeUserId: otherId }));
  await changeTask(db, staffId, { id: tid, status: "IN_PROGRESS" });
  await changeTask(db, staffId, { id: tid, status: "DONE" });
  await assert.rejects(changeTask(db, staffId, { id: tid, status: "IN_PROGRESS" }));
  assert.equal((await db.query("select * from task_events where task_id=$1", [tid])).length, 4);
  for (const table of ["task_events", "operational_events", "audit_log"])
    await assert.rejects(db.query(`delete from ${table}`));
});
suite(
  "briefing publication, acknowledgment deduplication, visibility; real occupancy",
  async () => {
    const bid = await publishBriefing(db, adminId, {
      title: "Today",
      body: "Shift information",
      department: "RECEPTION",
    });
    await acknowledgeBriefing(db, staffId, bid);
    await acknowledgeBriefing(db, staffId, bid);
    assert.equal(
      (await db.query("select * from briefing_reads where briefing_id=$1", [bid])).length,
      1,
    );
    const privateId = await publishBriefing(db, adminId, {
      title: "Kitchen",
      body: "Kitchen briefing",
      department: "KITCHEN",
    });
    await assert.rejects(acknowledgeBriefing(db, staffId, privateId));
    // Berlin-day anchoring (not current_date): readDashboard buckets by the
    // Berlin calendar, so fixtures must use the same "today" even when the
    // UTC day has already rolled over.
    const [{ today }] = await db.query(
      "select (now() at time zone 'Europe/Berlin')::date::text as today",
    );
    await recordOccupancy(db, adminId, {
      date: today,
      roomsTotal: 10,
      roomsAvailable: 6,
      roomsOccupied: 4,
      arrivals: 2,
      departures: null,
    });
    const kpi = await readDashboard(db, adminId);
    assert.equal(kpi.occupancy_today.occupancy_rate, 0.4);
    assert.equal(kpi.occupancy_today.departures, null);
    assert.equal(kpi.counts.open_inquiries, 3);
    assert.equal(kpi.counts.new_inquiries_today, 3);
    assert.ok(kpi.generated_at);
    assert.ok(kpi.today);
    assert.equal(kpi.range.id, "7tage");
    assert.ok(kpi.inquiry_series.granularity === "day");
    assert.ok(kpi.recent_inquiries.length >= 3);
    const linked = kpi.recent_inquiries.find((i) => i.guest_name === "O'Guest");
    assert.ok(linked);
    assert.equal(linked.task_status, "OPEN");
    assert.equal(linked.task_assignee, null);
    assert.ok(linked.arrival);
    await assert.rejects(
      recordOccupancy(db, staffId, {
        date: today,
        roomsTotal: 10,
        roomsAvailable: 6,
        roomsOccupied: 4,
        arrivals: 2,
        departures: 0,
      }),
    );
  },
);
suite(
  "control tower aggregation: staleness, assignment, action ordering, analytic ranges",
  async () => {
    await db.query(
      `insert into inquiries(id,request_id,type,guest_name,email,arrival,guest_count,status,created_at)
       values($1,$1,'ROOM','Old Guest','old@example.invalid','2030-01-01',2,'NEW', now() - interval '48 hours')`,
      [randomUUID()],
    );
    const overdueId = await createTask(db, adminId, {
      title: "Fix sauna lock",
      department: "TECHNICAL",
      dueAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    });
    const urgentId = await createTask(db, adminId, {
      title: "Prepare checkout",
      department: "RECEPTION",
      priority: "URGENT",
      dueAt: new Date(Date.now() + 6 * 3600_000).toISOString(),
    });
    await changeTask(db, adminId, { id: urgentId, assigneeUserId: staffId });
    const blockedId = await createTask(db, adminId, { title: "Wait for printer", department: "GENERAL" });
    await changeTask(db, adminId, { id: blockedId, status: "BLOCKED" });
    const [{ past }] = await db.query(
      "select ((now() at time zone 'Europe/Berlin')::date - 10)::text as past",
    );
    await recordOccupancy(db, adminId, {
      date: past,
      roomsTotal: 10,
      roomsAvailable: 5,
      roomsOccupied: 5,
      arrivals: 1,
      departures: 1,
    });

    const kpi = await readDashboard(db, adminId);
    assert.equal(kpi.counts.stale_inquiries, 1);
    assert.equal(kpi.counts.blocked_tasks, 1);
    assert.ok(kpi.counts.overdue_tasks >= 1);
    assert.equal(kpi.action_tasks[0].id, overdueId);
    assert.equal(kpi.action_tasks[0].overdue, true);
    assert.equal(kpi.action_tasks[1].id, urgentId);
    assert.equal(kpi.action_tasks[1].assignee_name, "Test Identity");
    assert.ok(kpi.occupancy_series.length >= 1);

    const hourly = await readDashboard(db, adminId, { range: "heute" });
    assert.equal(hourly.range.days, 1);
    assert.equal(hourly.inquiry_series.granularity, "hour");
    assert.ok(hourly.inquiry_series.points.length >= 1);
    assert.equal(hourly.occupancy_series.length, 1);

    const monthly = await readDashboard(db, adminId, { range: "30tage" });
    assert.equal(monthly.range.days, 30);
    assert.equal(monthly.inquiry_series.granularity, "day");
    assert.equal(monthly.occupancy_series.length, 2);
    assert.equal(monthly.occupancy_compare.current_avg === null, false);
    assert.equal(monthly.occupancy_compare.previous_avg, null);

    const unknown = await readDashboard(db, adminId, { range: "nonsense" });
    assert.equal(unknown.range.id, "7tage");
  },
);

suite(
  "measurement layer: registry thresholds, response bands, data quality",
  async () => {
    // Thresholds are parameters, not SQL literals: a caller that declares a
    // wider staleness rule must see a different set, without touching SQL.
    const wide = await readDashboard(db, adminId, { staleInquiryHours: 96 });
    const narrow = await readDashboard(db, adminId, { staleInquiryHours: 1 });
    assert.equal(wide.counts.stale_inquiries, 0);
    assert.ok(narrow.counts.stale_inquiries >= 1);

    // Response metric: "unanswered" is event-sourced. An inquiry whose
    // follow-up task never left OPEN still counts; one that was started does not.
    const started = await persistInquiry(db, {
      type: "TABLE",
      name: "Started Guest",
      email: "started@example.invalid",
      guests: 4,
    });
    const [task] = await db.query("select id from tasks where source_id=$1", [started]);
    const before = await readDashboard(db, adminId, {
      responseTargetMinutes: 30,
      responseWarningMinutes: 60,
      responseCriticalMinutes: 120,
    });
    assert.ok(before.response.unanswered >= 1);
    assert.equal(before.response.bands.criticalMinutes, 120);
    assert.ok(before.response.oldest_unanswered_at);
    assert.ok(before.response.beyond_critical >= 1);
    await changeTask(db, adminId, { id: task.id, status: "IN_PROGRESS" });
    const after = await readDashboard(db, adminId, {});
    assert.equal(after.response.unanswered, before.response.unanswered - 1);

    // Data-quality facts: aggregates only, with honest gaps.
    const health = await readDashboard(db, adminId, {});
    assert.ok(health.data_health.website.records > 0);
    assert.ok(health.data_health.website.lastRecordAt);
    assert.ok(health.data_health.tasks.records > 0);
    assert.ok(health.data_health.staff.records >= 1);
    assert.equal(health.data_health.pms.records, 0);
    assert.equal(health.data_health.pms.lastRecordAt, null);
    // The recorded snapshot has departures=null, so it is incomplete by definition.
    assert.ok(health.data_health.occupancy_manual.incomplete >= 1);
    assert.equal(health.data_health.occupancy_manual.inconsistent, 0);
    // The hand-inserted stale inquiry has no follow-up task — a real gap.
    assert.ok(health.data_health.website.inconsistent >= 1);
  },
);
suite(
  "authority changes audited, last admin retained, deactivation denies cached identity",
  async () => {
    await assert.rejects(changeStaff(db, staffId, { userId: staffId, role: "ADMIN" }));
    await assert.rejects(changeStaff(db, adminId, { userId: adminId, active: false }));
    await changeStaff(db, adminId, { userId: otherId, role: "ADMIN" });
    await changeStaff(db, adminId, { userId: otherId, role: "STAFF", active: false });
    await assert.rejects(readToday(db, otherId));
    assert.equal(
      (
        await db.query(
          "select * from audit_log where action='staff.role.change' and entity_id=$1",
          [otherId],
        )
      ).length,
      2,
    );
  },
);
suite(
  "migration upgrade preserves existing identity, closes bootstrap, concurrent runs do not replay",
  async () => {
    const upgradeSchema = `upgrade_${randomUUID().replaceAll("-", "")}`;
    await pool.query(`create schema "${upgradeSchema}"`);
    const upgradePool = new pg.Pool({
      connectionString: url,
      options: `-c search_path=${upgradeSchema}`,
    });
    try {
      await upgradePool.query(
        "create table _migrations(name text primary key,applied_at timestamptz not null default now())",
      );
      for (const name of ["0001_auth.sql", "0002_staff.sql"]) {
        await upgradePool.query(await readFile(`migrations/${name}`, "utf8"));
        await upgradePool.query("insert into _migrations(name) values($1)", [name]);
      }
      await upgradePool.query(
        `insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('existing-admin','Existing Admin','existing@example.invalid',true,now(),now())`,
      );
      await upgradePool.query(
        `insert into staff_profiles(id,user_id,email,display_name,role,department) values('existing-profile','existing-admin','existing@example.invalid','Existing Admin','ADMIN','MANAGEMENT')`,
      );
      const run = promisify(execFile),
        env = { ...process.env, DATABASE_URL: url, PGOPTIONS: `-c search_path=${upgradeSchema}` };
      await Promise.all([1, 2].map(() => run(process.execPath, ["scripts/migrate.mjs"], { env })));
      assert.equal((await upgradePool.query("select * from _migrations")).rows.length, 4);
      assert.equal(
        (await upgradePool.query("select * from staff_profiles where user_id='existing-admin'"))
          .rows.length,
        1,
      );
      assert.ok(
        (await upgradePool.query("select closed_at from bootstrap_state")).rows[0].closed_at,
      );
      assert.equal((await upgradePool.query("select * from inquiries")).rows.length, 0);
      const constraints = (
        await upgradePool.query(
          "select count(*)::int n from pg_constraint where connamespace=current_schema()::regnamespace and contype='c'",
        )
      ).rows[0].n;
      assert.ok(constraints >= 15);
      const replay = await run(process.execPath, ["scripts/migrate.mjs"], { env });
      assert.match(replay.stdout, /up to date/);
    } finally {
      await upgradePool.end();
    }
  },
);
suite("bootstrap remains closed even after the original admin profile is removed", async () => {
  await db.query("delete from staff_profiles where user_id=$1", [adminId]);
  await assert.rejects(
    provisionAccount(pool, identity("replacement@example.invalid"), {
      bootstrap: true,
      bootstrapEmail: "replacement@example.invalid",
      secret,
    }),
    { message: "BOOTSTRAP_CLOSED" },
  );
});
