#!/usr/bin/env node
// Password and identity arrive on stdin JSON, never argv or application logs.
import pg from "pg";
import { provisionAccount } from "./provisioning.mjs";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
const mode = process.argv[2];
if (!["bootstrap", "staff"].includes(mode))
  throw new Error("Usage: provision-staff.mjs bootstrap|staff (JSON on stdin)");
let raw = "";
for await (const chunk of process.stdin) {
  raw += chunk;
  if (raw.length > 8192) throw new Error("INPUT_TOO_LARGE");
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const data = JSON.parse(raw);
  const { actorId, ...input } = data;
  const userId = await provisionAccount(pool, input, {
    actorId,
    bootstrap: mode === "bootstrap",
    bootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL,
    secret: process.env.BETTER_AUTH_SECRET,
  });
  console.log(JSON.stringify({ ok: true, userId }));
} catch {
  console.error("Provisioning denied or failed; transaction rolled back.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
