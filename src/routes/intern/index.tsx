import { createFileRoute, redirect } from "@tanstack/react-router";
import { loadStaffAccess } from "@/lib/permissions/access";

/**
 * Role-based landing redirect (frozen Phase-1 contract):
 * ADMIN -> /intern/dashboard, STAFF -> /intern/heute, NONE -> kein-zugriff.
 */
export const Route = createFileRoute("/intern/")({
  beforeLoad: async () => {
    const { staff } = await loadStaffAccess();
    throw redirect({
      to: staff
        ? staff.role === "ADMIN"
          ? "/intern/dashboard"
          : "/intern/heute"
        : "/intern/kein-zugriff",
    });
  },
});
