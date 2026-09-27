import { createServerFn } from "@tanstack/react-start";
import type { StaffContext } from "./roles";

/**
 * Route-guard resolution for SSR loaders (`/login`, `/intern/*`): one call
 * returns authentication + authorization so routes can redirect per the
 * frozen Phase-1 contract (ADMIN -> dashboard, STAFF -> heute, NONE/INACTIVE
 * -> kein-zugriff) instead of erroring.
 *
 * Client-safe module: server-only dependencies are imported dynamically
 * inside the handler so they never enter the client bundle (same pattern as
 * `@/lib/auth/middleware`).
 */
export const loadStaffAccess = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ authed: boolean; staff: StaffContext | null }> => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const { resolveStaffContext } = await import("./require-staff.server");
    const user = await getSessionUser();
    if (!user) return { authed: false, staff: null };
    const staff = await resolveStaffContext(user.id);
    return { authed: true, staff };
  },
);
