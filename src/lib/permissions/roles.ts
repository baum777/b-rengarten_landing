/**
 * RBAC primitives — pure, no I/O, unit-testable.
 *
 * Authority model (owner dispositions 2026-09-27, see
 * INTERN-IMPLEMENTATION-MAPPING.md §8):
 *
 *   Authentication = Better Auth identity (IdP-swappable later).
 *   Authorization  = active staff_profiles row keyed by user id — never by
 *                    email, never by the UI.
 *
 * A valid login without an active staff profile is NOT staff. Every guarded
 * route and server function resolves through `resolveGuardDecision`, which
 * fails closed.
 */

export const STAFF_ROLES = ["ADMIN", "STAFF"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * Organizational context, deliberately NOT an authorization axis — a
 * Restaurantleiter can be `role: "ADMIN", department: "RESTAURANT"`.
 */
export const DEPARTMENTS = [
  "MANAGEMENT",
  "RECEPTION",
  "HOUSEKEEPING",
  "RESTAURANT",
  "SERVICE",
  "KITCHEN",
  "TECHNICAL",
  "GENERAL",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

/** Resolved, verified operating context for a guarded request. */
export type StaffContext = {
  userId: string;
  staffId: string;
  role: StaffRole;
  department: Department;
  displayName: string;
};

/**
 * Capabilities from the review matrix (§20). Call sites must check
 * capabilities via `can()` — never inline `role === "ADMIN"` checks.
 */
export type Capability =
  | "tasks:read:own"
  | "tasks:read:all"
  | "briefings:read"
  | "reports:create"
  | "inquiries:manage"
  | "occupancy:read"
  | "kpis:read"
  | "dataflows:read"
  | "team:manage"
  | "roles:manage"
  | "audit:read";

const STAFF_CAPABILITIES: readonly Capability[] = [
  "tasks:read:own",
  "briefings:read",
  "reports:create",
];

/** ADMIN holds everything STAFF holds, plus the whole management plane. */
export function can(role: StaffRole, capability: Capability): boolean {
  if (role === "ADMIN") return true;
  return STAFF_CAPABILITIES.includes(capability);
}

export type GuardRequired = "STAFF" | "ADMIN";

/**
 * Route/endpoint decision, fail-closed:
 *   "allow"     -> proceed
 *   "denied"    -> not staff (no profile or inactive) -> /intern/kein-zugriff
 *   "forbidden" -> staff, but below the required role level -> 403
 */
export type GuardDecision = "allow" | "forbidden" | "denied";

export function resolveGuardDecision(input: {
  profile: { active: boolean; role: StaffRole } | null;
  required: GuardRequired;
}): GuardDecision {
  if (!input.profile || !input.profile.active) return "denied";
  if (input.required === "ADMIN" && input.profile.role !== "ADMIN") {
    return "forbidden";
  }
  return "allow";
}

/**
 * One-time, env-bound first-admin bootstrap decision (owner disposition:
 * ADOPT: ONE-TIME ENV-BOUND BOOTSTRAP). Gated on `adminCount === 0`, so the
 * env var is dead as soon as the first ADMIN exists — never a standing
 * backdoor mapping.
 */
export function shouldProvisionFirstAdmin(input: {
  email: string;
  bootstrapEmail: string | null | undefined;
  adminCount: number;
}): boolean {
  if (!input.bootstrapEmail || !input.bootstrapEmail.trim()) return false;
  if (input.adminCount !== 0) return false;
  return (
    input.email.trim().toLowerCase() ===
    input.bootstrapEmail.trim().toLowerCase()
  );
}
