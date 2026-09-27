import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * The app's own Better Auth HTTP surface (`/api/auth/*`) — sign-in,
 * sign-out, sessions, OAuth callbacks. `auth` is the pre-wired instance from
 * `@/lib/auth/server` (server-only import is fine here: this file only ever
 * executes on the server; the route has no component).
 *
 * Email/password sign-IN works for staff; sign-UP is disabled server-side
 * (`disableSignUp: true` — owner disposition 2026-09-27, invite-only).
 */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return auth.handler(request);
      },
    },
  },
});
