/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * ON since Phase 1 of the internal area (INTERN-IMPLEMENTATION-MAPPING.md).
 * Staff sign in with email/password; public sign-up stays FORBIDDEN
 * (`disableSignUp: true` in `server.ts` — owner disposition 2026-09-27:
 * ADMIN-MANAGED / INVITE-ONLY). Accounts are provisioned by ADMIN, never by
 * self-service sign-up.
 *
 * Do NOT edit `server.ts` for this — that file is frozen pre-wired config.
 */
export const emailAndPasswordEnabled = true;
