#!/usr/bin/env node
import { spawn } from "node:child_process";
if (!process.env.TEST_DATABASE_URL?.trim()) {
  console.error("TEST_DATABASE_URL_REQUIRED: database verification cannot silently skip.");
  process.exit(2);
}
const child = spawn(process.execPath, ["--test", "scripts/db-integration.test.mjs"], {
  stdio: "inherit",
  env: process.env,
});
child.on("error", () => process.exit(1));
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
