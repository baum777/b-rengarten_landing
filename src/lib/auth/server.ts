/**
 * Self-hosted Better Auth for the Bärengarten internal area (server-only).
 *
 * The app runs its own Better Auth at `/api/auth/*`; sessions stay on this
 * app's own origin. Employee authentication is intentionally limited to
 * pre-provisioned email/password accounts. Public self-sign-up is disabled.
 *
 * Identity-provider-specific authorization does not live here: permissions are
 * resolved separately through `staff_profiles` / the permissions layer.
 */
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { pgliteDialect } from "./pglite-dialect";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Local/dev signing secret must outlive module reloads because PGLite session
 * rows survive HMR within the process. Production must provide
 * `BETTER_AUTH_SECRET`.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __baerengartenAuthDevSecret__?: string;
};
function localAuthSecret(): string {
  globalAuthRef.__baerengartenAuthDevSecret__ ??=
    randomBytes(32).toString("hex");
  return globalAuthRef.__baerengartenAuthDevSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

// Explicit off-switch used by local/dev tooling.
const authDisabled = env("VITE_AUTH_ENABLED") === "false";

/** True when the employee authentication path is active. */
export const authConfigured =
  !authDisabled && emailAndPasswordEnabled;

const explicitBaseURL = env("BETTER_AUTH_URL");

const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];

// Vercel exposes these host names without protocol.
const vercelHosts = [
  env("VERCEL_PROJECT_PRODUCTION_URL"),
  env("VERCEL_URL"),
].filter((host): host is string => Boolean(host));
const vercelOrigins = vercelHosts.map((host) => `https://${host}`);

const baseURL = explicitBaseURL ?? {
  allowedHosts: [
    ...vercelHosts,
    "localhost",
    "127.0.0.1",
    "[::1]",
  ],
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

const trustedOrigins: string[] = explicitBaseURL
  ? [explicitBaseURL, ...LOCAL_DEV_ORIGINS]
  : [...vercelOrigins, ...LOCAL_DEV_ORIGINS];

const databaseUrl = env("DATABASE_URL");

// Real Postgres when `DATABASE_URL` is set; otherwise local PGLite.
const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? localAuthSecret(),
  database,
  trustedOrigins,

  account: {
    accountLinking: {
      enabled: true,
      // Keep the platform preview gate isolated from employee credentials.
      trustedProviders: [GATE_PROVIDER_ID],
      requireLocalEmailVerified: false,
    },
  },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  ...(emailAndPasswordEnabled
    ? { emailAndPassword: { enabled: true, disableSignUp: true } }
    : {}),

  // Host-only secure cookies prevent sibling-domain cookie tossing.
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: {
        name: "__Host-baerengarten-auth.session_token",
      },
      session_data: {
        name: "__Host-baerengarten-auth.session_data",
      },
      account_data: {
        name: "__Host-baerengarten-auth.account_data",
      },
      dont_remember: {
        name: "__Host-baerengarten-auth.dont_remember",
      },
    },
  },

  plugins: [
    // Platform preview identity remains isolated from the employee login.
    gateIdentitySessions(),

    // Bridges Better Auth's Set-Cookie into TanStack Start responses.
    tanstackStartCookies(),
  ],
});
