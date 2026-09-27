import { randomUUID } from "node:crypto";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { z } from "zod";
import { audit, event, staff, departments } from "./operations.mjs";
export const provisionInput = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((x) => x.toLowerCase()),
    name: z.string().trim().min(2).max(160),
    password: z.string().min(12).max(128),
    department: z.enum(departments),
  })
  .strict();
// Offline-only factory: never mount its handler in an HTTP route. The supported
// Better Auth admin API gets a dialect pinned to the caller's transaction.
export async function provisionAccount(
  pool,
  input,
  { bootstrapEmail, actorId, bootstrap = false, secret },
) {
  const d = provisionInput.parse(input);
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET_REQUIRED");
  if (bootstrap && (!bootstrapEmail?.trim() || d.email !== bootstrapEmail.trim().toLowerCase()))
    throw new Error("BOOTSTRAP_IDENTITY_DENIED");
  const client = await pool.connect();
  const tx = { query: async (text, params = []) => (await client.query(text, params)).rows };
  try {
    await client.query("BEGIN");
    if (bootstrap) {
      const [state] = await tx.query(
        "select closed_at from bootstrap_state where id=true for update",
      );
      if (
        !state ||
        state.closed_at ||
        (await tx.query("select id from staff_profiles where role='ADMIN' limit 1")).length
      )
        throw new Error("BOOTSTRAP_CLOSED");
    } else {
      if (!actorId) throw new Error("ACCESS_DENIED");
      await staff(tx, actorId, true);
    }
    const dialect = new PostgresDialect({
      pool: {
        connect: async () => ({ query: client.query.bind(client), release() {} }),
        end: async () => {},
      },
    });
    const auth = betterAuth({
      baseURL: "http://localhost:8080",
      secret,
      database: { dialect, type: "postgres" },
      emailAndPassword: { enabled: true, disableSignUp: true },
      plugins: [admin()],
    });
    const { user } = await auth.api.createUser({
      body: { email: d.email, name: d.name, password: d.password, role: "user" },
    });
    // Offline operator explicitly establishes the bootstrap identity. Ordinary
    // employee emails remain unverified until a future verification workflow.
    if (bootstrap) {
      await createBootstrapFromOperator(tx, user, d, bootstrapEmail);
    } else {
      await tx.query(
        "insert into staff_profiles(id,user_id,email,display_name,role,department,created_by) values($1,$2,$3,$4,'STAFF',$5,$6)",
        [randomUUID(), user.id, d.email, d.name, d.department, actorId],
      );
      await audit(tx, actorId, "staff.provision", user.id, null, {
        role: "STAFF",
        department: d.department,
      });
      await event(tx, "staff.provisioned", "staff", user.id, actorId);
    }
    await client.query("COMMIT");
    return user.id;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
async function createBootstrapFromOperator(tx, user, d, bootstrapEmail) {
  if (d.email !== bootstrapEmail.trim().toLowerCase()) throw new Error("BOOTSTRAP_IDENTITY_DENIED");
  await tx.query(
    "insert into staff_profiles(id,user_id,email,display_name,role,department,created_by) values($1,$2,$3,$4,'ADMIN','MANAGEMENT','offline-bootstrap')",
    [randomUUID(), user.id, d.email, d.name],
  );
  await tx.query("update bootstrap_state set closed_at=now() where id=true");
  await audit(tx, user.id, "bootstrap.admin.created", user.id, null, { role: "ADMIN" });
  await event(tx, "staff.provisioned", "staff", user.id, user.id);
}
