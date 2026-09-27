import { createMiddleware } from "@tanstack/react-start";

/**
 * Auth middleware for server functions — the standard way to get the caller's
 * verified user id. The Better Auth session cookie is same-origin and rides
 * along automatically.
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireUserId } = await import("./verify.server");

    // Reject scripted cross-site/sibling requests before touching per-user data.
    assertSameSiteRequest();

    const userId = await requireUserId();
    return next({ context: { userId } });
  },
);
