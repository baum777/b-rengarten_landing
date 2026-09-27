import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ACTIVE_AUTH_FILES = [
  "src/routes/login.tsx",
  "src/lib/auth/client.ts",
  "src/lib/auth/server.ts",
  "src/lib/auth/middleware.ts",
  "src/lib/auth/verify.server.ts",
  "vite.config.ts",
];

const FORBIDDEN_AUTH_MARKERS = [
  "GROK_AUTH_",
  "GROK_PROVIDERS",
  "genericOAuth",
  "genericOAuthClient",
  "/auth/popup",
  "grok-auth-popup",
];

test("active Bärengarten auth has no Grok broker dependency", () => {
  for (const path of ACTIVE_AUTH_FILES) {
    const source = readFileSync(path, "utf8");
    for (const marker of FORBIDDEN_AUTH_MARKERS) {
      assert.equal(
        source.includes(marker),
        false,
        `${path} must not contain ${marker}`,
      );
    }
  }
});
