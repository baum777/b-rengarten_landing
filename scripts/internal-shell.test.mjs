import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Password self-service contracts as deterministic static checks:
 *  - the shell lists the route (no dead navigation) with optional capability
 *  - the page carries exactly the three agreed fields
 *  - error/success are announced to assistive technology
 *  - the minimum length matches the bootstrap provisioning contract
 */
const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

describe("internal shell: password self-service", () => {
  const shell = read("src/components/internal/internal-shell.tsx");
  const page = read("src/routes/intern/passwort.tsx");

  it("shell lists the password route — no dead navigation", () => {
    assert.ok(shell.includes('{ to: "/intern/passwort", label: "Passwort" }'));
  });

  it("shell lists the inquiries route behind its manage capability", () => {
    assert.ok(
      shell.includes('{ to: "/intern/anfragen", label: "Anfragen", capability: "inquiries:manage" }'),
    );
  });

  it("shell lists the tasks route behind the read-all capability", () => {
    assert.ok(
      shell.includes('{ to: "/intern/aufgaben", label: "Aufgaben", capability: "tasks:read:all" }'),
    );
  });

  it("capability is optional and only self-service items omit it", () => {
    assert.ok(shell.includes("capability?: Capability"));
    assert.match(shell, /item\.capability === undefined \|\| can\(/);
  });

  it("page has exactly the three agreed password fields", () => {
    assert.equal((page.match(/type="password"/g) ?? []).length, 3);
    for (const id of ["pw-current", "pw-next", "pw-confirm"]) {
      assert.ok(page.includes(`id="${id}"`), `missing field ${id}`);
    }
  });

  it("error and success are announced (role=alert / role=status)", () => {
    assert.ok(page.includes('role="alert"'));
    assert.ok(page.includes('role="status"'));
  });

  it("minimum length matches the bootstrap provisioning contract", () => {
    const prov = read("scripts/provisioning.mjs");
    assert.ok(prov.includes("min(12)"), "provisioning must require 12 chars");
    assert.ok(page.includes("MIN_LENGTH = 12"));
  });

  it("fields use distinct autoComplete hints for password managers", () => {
    assert.ok(page.includes('autoComplete="current-password"'));
    assert.equal((page.match(/autoComplete="new-password"/g) ?? []).length, 2);
  });
});

describe("internal shell: occupancy page", () => {
  const shell = read("src/components/internal/internal-shell.tsx");
  const page = read("src/routes/intern/auslastung.tsx");

  it("shell lists the occupancy route behind the admin-only read capability", () => {
    assert.ok(
      shell.includes('{ to: "/intern/auslastung", label: "Auslastung", capability: "occupancy:read" }'),
    );
  });

  it("page renders the honest 0–100 % trend chart, not a custom scale", () => {
    assert.ok(page.includes("OccupancyTrendChart"));
    assert.ok(page.includes("value: d.occupancy_rate"));
  });

  it("capture form carries exactly the six agreed fields", () => {
    // five numeric fields flow through the numberField helper, the date
    // field carries its id literally
    assert.ok(page.includes('id="occ-date"'));
    for (const id of [
      "occ-total",
      "occ-free",
      "occ-occupied",
      "occ-arrivals",
      "occ-departures",
    ]) {
      assert.ok(page.includes(`numberField("${id}"`), `missing field ${id}`);
    }
  });

  it("capture goes through the existing audited writer, not a hand-rolled insert", () => {
    assert.ok(page.includes("addOccupancy"));
    assert.ok(!page.includes("insert into occupancy_snapshots"));
  });

  it("capture errors and success are announced (role=alert / role=status)", () => {
    assert.ok(page.includes('role="alert"'));
    assert.ok(page.includes('role="status"'));
  });
});
