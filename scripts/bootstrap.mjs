import { randomUUID } from "node:crypto";
import { audit, event } from "./operations.mjs";
export async function bootstrapProfile(tx, userId, bootstrapEmail) {
  if (!bootstrapEmail?.trim()) throw new Error("BOOTSTRAP_EMAIL_REQUIRED");
  const [state] = await tx.query("select closed_at from bootstrap_state where id=true for update");
  if (!state || state.closed_at) throw new Error("BOOTSTRAP_CLOSED");
  const [existing] = await tx.query("select id from staff_profiles where role='ADMIN' limit 1");
  if (existing) throw new Error("BOOTSTRAP_CLOSED");
  const [u] = await tx.query('select id,name,email,"emailVerified" from "user" where id=$1', [
    userId,
  ]);
  if (
    !u ||
    !u.emailVerified ||
    u.email.trim().toLowerCase() !== bootstrapEmail.trim().toLowerCase()
  )
    throw new Error("BOOTSTRAP_IDENTITY_DENIED");
  await tx.query(
    "insert into staff_profiles(id,user_id,email,display_name,role,department,created_by) values($1,$2,$3,$4,'ADMIN','MANAGEMENT','bootstrap')",
    [randomUUID(), userId, u.email, u.name],
  );
  await tx.query("update bootstrap_state set closed_at=now() where id=true");
  await audit(tx, userId, "bootstrap.admin.created", userId, null, { role: "ADMIN" });
  await event(tx, "staff.provisioned", "staff", userId, userId);
}
