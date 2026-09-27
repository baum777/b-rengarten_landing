import { randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { shouldProvisionFirstAdmin } from "./roles";

/**
 * One-time, env-bound first-admin bootstrap (owner disposition 2026-09-27:
 * ADOPT: ONE-TIME ENV-BOUND BOOTSTRAP).
 *
 * `ADMIN_BOOTSTRAP_EMAIL` is consulted ONLY while zero ADMIN profiles exist:
 * an already-authenticated identity whose verified email matches gets an ADMIN
 * `staff_profile` atomically. As soon as any ADMIN exists the path is dead —
 * the env var never becomes a standing backdoor mapping, and email is never
 * an authority key anywhere else (authority is `user_id`).
 *
 * Called from `resolveStaffContext` right after a successful login resolved
 * without a profile; safe to call on every request (cheap count query, inert
 * without the env var).
 */
export async function maybeProvisionFirstAdmin(
  sql: Sql,
  userId: string,
): Promise<void> {
  const bootstrapEmail = env("ADMIN_BOOTSTRAP_EMAIL");

  const countRows = await sql<{ n: number }>`
    select count(*) as n from staff_profiles where role = 'ADMIN'
  `;
  const adminCount = Number(countRows[0]?.n ?? 0);

  const userRows = await sql<{ name: string; email: string }>`
    select "name", "email" from "user" where "id" = ${userId} limit 1
  `;
  const user = userRows[0];
  if (!user) return;

  if (
    !shouldProvisionFirstAdmin({
      email: user.email,
      bootstrapEmail,
      adminCount,
    })
  ) {
    return;
  }

  // `on conflict` keeps a concurrent double-fire of the same first login
  // harmless; distinct users can never race because Better Auth emails are
  // unique and only the one bootstrap email passes the gate.
  await sql`
    insert into staff_profiles
      (id, user_id, email, display_name, role, department, active, created_by)
    values
      (${randomUUID()}, ${userId}, ${user.email}, ${user.name}, 'ADMIN',
       'MANAGEMENT', true, 'bootstrap:ADMIN_BOOTSTRAP_EMAIL')
    on conflict (user_id) do nothing
  `;
}
