import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { loadStaffAccess } from "@/lib/permissions/access";
import { InternalShell } from "@/components/internal/internal-shell";

const KEIN_ZUGRIFF = "/intern/kein-zugriff";

export const Route = createFileRoute("/intern")({
  beforeLoad: async ({ location }) => {
    const { authed, staff } = await loadStaffAccess();
    if (!authed) throw redirect({ to: "/login" });
    if (!staff) {
      // The denied page itself must render (it offers sign-out); everything
      // else under /intern is off limits without an active staff profile.
      if (location.pathname !== KEIN_ZUGRIFF) {
        throw redirect({ to: KEIN_ZUGRIFF });
      }
      return { staff: null };
    }
    return { staff };
  },
  component: InternalLayout,
});

function InternalLayout() {
  const { staff } = Route.useRouteContext();
  return (
    <InternalShell staff={staff}>
      <Outlet />
    </InternalShell>
  );
}
