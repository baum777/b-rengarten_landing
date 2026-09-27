#!/usr/bin/env node
/**
 * Content import boundary (R2): public-facing code must not import the
 * non-public content domains directly — only `@/content/public` (or the
 * `src/lib/site` facade) may feed the UI. Deterministic file scan, no
 * tooling beyond node:test.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");

/** Public-facing trees that must consume only the projection. */
const PUBLIC_TREES = [
  "src/routes",
  "src/components/site",
  "src/components/sections",
  "src/components/forms",
];

const FORBIDDEN = /content\/(operator|transitional)/;

function* walkTs(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) yield* walkTs(path);
    else if (/\.(ts|tsx)$/.test(entry)) yield path;
  }
}

describe("content import boundary", () => {
  it("public-facing code never imports operator/transitional content", () => {
    const offenders = [];
    for (const tree of PUBLIC_TREES) {
      for (const file of walkTs(join(repoRoot, tree))) {
        const src = readFileSync(file, "utf8");
        if (FORBIDDEN.test(src)) offenders.push(file);
      }
    }
    assert.deepEqual(offenders, []);
  });

  it("the public projection itself imports neither operator nor transitional", () => {
    const src = readFileSync(join(repoRoot, "src/content/public.ts"), "utf8");
    assert.doesNotMatch(src, /from "\.\/(operator|transitional)(\.ts)?"/);
  });

  it("the public projection is fed from property truth (positive control)", () => {
    const src = readFileSync(join(repoRoot, "src/content/public.ts"), "utf8");
    assert.match(src, /from "\.\/property(\.ts)?"/);
  });
});
