import { createMiddleware } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { ForbiddenError } from "./errors";
import { resolveGuardDecision } from "./roles";

/**
 * Server-side hotel authorization guards — the Phase-1 primitives. Call sites
 * must use `requireStaff` / `requireAdmin`, never inline role checks; the UI
 * is never the security boundary.
 *
 *   request -> Better Auth -> authMiddleware (userId) -> resolveStaffContext
 *           -> requireStaff / requireAdmin -> handler
 *
 * This file is dual client/server (like `@/lib/auth/middleware`): the
 * middlewares must be importable from server-function modules that client code
 * also imports, so ALL `*.server` imports happen dynamically inside the
 * `.server()` callbacks and never reach the client bundle.
 */

/** Every internal server function requires at least an active staff profile. */
export const requireStaff = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const { resolveStaffContext } = await import("./require-staff.server");
    const staff = await resolveStaffContext(context.userId);
    // `staff` exists ⇒ active: resolveStaffContext filters inactive profiles.
    const decision = resolveGuardDecision({
      profile: staff && { active: true, role: staff.role },
      required: "STAFF",
    });
    if (!staff || decision !== "allow") {
      throw new ForbiddenError("Staff access required");
    }
    return next({ context: { staff } });
  });

/** Admin-only server functions chain on `requireStaff` and raise the bar. */
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireStaff])
  .server(async ({ next, context }) => {
    // Same invariant as above: context.staff came through requireStaff.
    const decision = resolveGuardDecision({
      profile: { active: true, role: context.staff.role },
      required: "ADMIN",
    });
    if (decision !== "allow") {
      throw new ForbiddenError("Admin access required");
    }
    return next({ context: { staff: context.staff } });
  });
