import { getSql } from "@/lib/db";
import { maybeProvisionFirstAdmin } from "./bootstrap.server";
import type { Department, StaffContext, StaffRole } from "./roles";

/**
 * Server-side hotel authorization resolution — the ONLY bridge between Better
 * Auth identity and the internal area. Server-only module; client-safe callers
 * go through `guards.ts` / `access.ts`.
 *
 * Fail-closed: an authenticated user without an active profile resolves to
 * `null` — callers deny, they never fall through.
 */

type StaffProfileRow = {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  department: string;
  active: boolean;
};

async function loadStaffProfile(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<StaffProfileRow | null> {
  const rows = await sql<StaffProfileRow>`
    select id, user_id, email, display_name, role, department, active
    from staff_profiles
    where user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

/**
 * Resolve the verified operating context for a Better Auth user id, or `null`
 * when the identity is not staff (no profile / inactive profile). Runs the
 * one-time first-admin bootstrap on the "no profile" path, so the very first
 * ADMIN materializes at login, not by DB seeding.
 */
export async function resolveStaffContext(
  userId: string,
): Promise<StaffContext | null> {
  const sql = await getSql();
  let profile = await loadStaffProfile(sql, userId);
  if (!profile) {
    await maybeProvisionFirstAdmin(sql, userId);
    profile = await loadStaffProfile(sql, userId);
  }
  if (!profile || !profile.active) return null;
  return {
    userId: profile.user_id,
    staffId: profile.id,
    role: profile.role as StaffRole,
    department: profile.department as Department,
    displayName: profile.display_name,
  };
}
