// Controlled local PostgreSQL + real browser smoke. Never run on production.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { openSync, closeSync } from "node:fs";
import pg from "pg";
import { chromium } from "playwright";
import { provisionAccount } from "./provisioning.mjs";
import { createTask, publishBriefing, changeStaff } from "./operations.mjs";
if (!process.env.TEST_DATABASE_URL || !process.env.SMOKE_LOG)
  throw new Error("TEST_DATABASE_URL and SMOKE_LOG required");
const schema = `smoke_${randomUUID().replaceAll("-", "")}`,
  secret = randomBytes(32).toString("hex"),
  password = randomBytes(24).toString("hex");
const url = new URL(process.env.TEST_DATABASE_URL);
url.searchParams.set("options", `-c search_path=${schema}`);
const control = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
await control.query(`create schema "${schema}"`);
await control.end();
const pool = new pg.Pool({ connectionString: url.toString() });
const env = {
  ...process.env,
  DATABASE_URL: url.toString(),
  BETTER_AUTH_SECRET: secret,
  ADMIN_BOOTSTRAP_EMAIL: "admin@example.invalid",
  VITE_AUTH_ENABLED: "true",
};
execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, stdio: "pipe" });
const a = await provisionAccount(
  pool,
  { email: "admin@example.invalid", name: "Test Admin", password, department: "MANAGEMENT" },
  { bootstrap: true, bootstrapEmail: env.ADMIN_BOOTSTRAP_EMAIL, secret },
);
const s = await provisionAccount(
  pool,
  { email: "staff@example.invalid", name: "Test Staff", password, department: "RECEPTION" },
  { actorId: a, secret },
);
const db = {
  transaction: async (fn) => {
    const c = await pool.connect();
    try {
      await c.query("BEGIN");
      const v = await fn({ query: async (t, p = []) => (await c.query(t, p)).rows });
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
await createTask(db, a, {
  title: "Smoke task",
  department: "RECEPTION",
  assigneeUserId: s,
  priority: "URGENT",
});
await publishBriefing(db, a, {
  title: "Smoke briefing",
  body: "Controlled local test",
  department: "RECEPTION",
});
const log = openSync(process.env.SMOKE_LOG, "a");
const server = spawn(
  process.execPath,
  [
    "scripts/with-app-env.mjs",
    "./node_modules/.bin/vite",
    "dev",
    "--host",
    "127.0.0.1",
    "--port",
    "8080",
    "--strictPort",
  ],
  { env, stdio: ["ignore", log, log] },
);
let browser;
try {
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null) throw new Error("SERVER_EXITED");
    try {
      if ((await fetch("http://localhost:8080/login")).ok) break;
    } catch {
      // Server startup can precede its first successful HTTP response.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  const authCheck = execFileSync(process.execPath, ["scripts/check-auth-invariant.mjs"], {
    env,
    encoding: "utf8",
  });
  assert.match(authCheck, /agree/);
  console.log("PASS auth build/dev invariant");
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.SMOKE_BROWSER_PATH,
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }),
    page = await context.newPage();
  page.on("pageerror", (error) => console.error("Browser error:", error.message));
  await page.goto("http://localhost:8080/intern");
  await page.waitForURL("**/login");
  await page.waitForLoadState("networkidle");
  console.log("PASS anonymous intern redirects login");
  assert.equal(await page.getByRole("button", { name: /Grok|Google|Twitter/ }).count(), 0);
  await page.getByLabel("E-Mail", { exact: true }).fill("staff@example.invalid");
  await page.getByLabel("Passwort", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.getByText("Anmeldung fehlgeschlagen.", { exact: false }).waitFor();
  console.log("PASS wrong password denied");
  await page.getByLabel("Passwort", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForURL("**/intern/heute");
  await page.getByText("Smoke task", { exact: true }).waitFor();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Starten", exact: true }).click();
  await page.getByRole("button", { name: "Erledigt", exact: true }).waitFor();
  await page.getByRole("button", { name: "Erledigt", exact: true }).click();
  await page.getByText("Keine offenen Aufgaben zugewiesen.").waitFor();
  await page.getByRole("button", { name: "Als gelesen bestätigen" }).click();
  await page.getByText("Gelesen", { exact: true }).waitFor();
  console.log("PASS STAFF landing, task transitions, briefing read");
  await page.goto("http://localhost:8080/intern/dashboard");
  assert.equal(await page.getByText("Offene Anfragen", { exact: true }).count(), 0);
  console.log("PASS STAFF dashboard denied");
  await changeStaff(db, a, { userId: s, active: false });
  await page.goto("http://localhost:8080/intern/heute");
  await page.waitForURL(/\/(login|intern\/kein-zugriff)$/);
  console.log("PASS inactive staff denied with existing session cookie");
  await context.close();
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto("http://localhost:8080/login");
  await adminPage.waitForLoadState("networkidle");
  await adminPage.getByLabel("E-Mail", { exact: true }).fill("admin@example.invalid");
  await adminPage.getByLabel("Passwort", { exact: true }).fill(password);
  await adminPage.getByRole("button", { name: "Anmelden", exact: true }).click();
  await adminPage.waitForURL("**/intern/dashboard");
  await adminPage.getByText("Offene Anfragen", { exact: true }).waitFor();
  assert.ok(await adminPage.getByText("Keine Daten", { exact: true }).count());
  console.log("PASS ADMIN landing, real KPIs, unknown occupancy");
  const response = await adminContext.request.post("http://localhost:8080/api/auth/sign-up/email", {
    data: { email: "public@example.invalid", password, name: "Public" },
    headers: { origin: "http://localhost:8080" },
  });
  assert.equal(response.status(), 400);
  console.log("PASS public signup denied");
  assert.ok(
    (
      await pool.query(
        "select count(*)::int n from operational_events where event_type='auth.login' and actor_type='USER'",
      )
    ).rows[0].n >= 2,
  );
  console.log("PASS auth.login ledger");
  const home = await adminPage.goto("http://localhost:8080/");
  assert.equal(home.status(), 200);
  console.log("PASS public homepage");
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto("http://localhost:8080/hotel/buchen");
  await guestPage.waitForLoadState("networkidle");
  await guestPage.getByLabel("Anreise", { exact: true }).fill("2030-01-01");
  await guestPage.getByLabel("Abreise", { exact: true }).fill("2030-01-03");
  await guestPage.getByLabel("Name", { exact: true }).fill("Smoke Guest");
  await guestPage.getByLabel("E-Mail", { exact: true }).fill("guest@example.invalid");
  await guestPage.getByRole("button", { name: "Verfügbarkeit anfragen", exact: true }).click();
  await guestPage.getByText("Wir haben Ihre Zimmeranfrage erhalten.", { exact: true }).waitFor();
  const [inquiry] = (
    await pool.query("select id from inquiries where email=$1", ["guest@example.invalid"])
  ).rows;
  assert.ok(inquiry);
  assert.equal(
    (await pool.query("select id from tasks where source_id=$1", [inquiry.id])).rows.length,
    1,
  );
  assert.equal(
    (await pool.query("select id from operational_events where correlation_id=$1", [inquiry.id]))
      .rows.length,
    2,
  );
  console.log("PASS anonymous public form -> PostgreSQL inquiry + event + task + task event");
  await guestContext.close();
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
  await pool.end();
  closeSync(log);
}
