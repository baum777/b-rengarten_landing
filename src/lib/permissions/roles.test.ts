import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  can,
  resolveGuardDecision,
  shouldProvisionFirstAdmin,
  type Capability,
} from "./roles.ts";

describe("can", () => {
  const staffOnly: Capability[] = [
    "tasks:read:own",
    "briefings:read",
    "reports:create",
  ];
  const adminOnly: Capability[] = [
    "tasks:read:all",
    "inquiries:manage",
    "occupancy:read",
    "kpis:read",
    "dataflows:read",
    "team:manage",
    "roles:manage",
    "audit:read",
  ];

  it("grants STAFF only the operational basics", () => {
    for (const capability of staffOnly) {
      assert.equal(can("STAFF", capability), true, capability);
    }
    for (const capability of adminOnly) {
      assert.equal(can("STAFF", capability), false, capability);
    }
  });

  it("grants ADMIN everything, including every STAFF capability", () => {
    for (const capability of [...staffOnly, ...adminOnly]) {
      assert.equal(can("ADMIN", capability), true, capability);
    }
  });
});

describe("resolveGuardDecision", () => {
  it("denies signed-out resolution defensively (no profile)", () => {
    assert.equal(
      resolveGuardDecision({ profile: null, required: "STAFF" }),
      "denied",
    );
    assert.equal(
      resolveGuardDecision({ profile: null, required: "ADMIN" }),
      "denied",
    );
  });

  it("denies authenticated users without a staff profile (fail closed)", () => {
    assert.equal(
      resolveGuardDecision({ profile: null, required: "STAFF" }),
      "denied",
    );
  });

  it("denies inactive staff profiles", () => {
    assert.equal(
      resolveGuardDecision({
        profile: { active: false, role: "STAFF" },
        required: "STAFF",
      }),
      "denied",
    );
    assert.equal(
      resolveGuardDecision({
        profile: { active: false, role: "ADMIN" },
        required: "ADMIN",
      }),
      "denied",
    );
  });

  it("forbids STAFF on ADMIN endpoints", () => {
    assert.equal(
      resolveGuardDecision({
        profile: { active: true, role: "STAFF" },
        required: "ADMIN",
      }),
      "forbidden",
    );
  });

  it("allows STAFF on STAFF endpoints", () => {
    assert.equal(
      resolveGuardDecision({
        profile: { active: true, role: "STAFF" },
        required: "STAFF",
      }),
      "allow",
    );
  });

  it("allows ADMIN on ADMIN endpoints", () => {
    assert.equal(
      resolveGuardDecision({
        profile: { active: true, role: "ADMIN" },
        required: "ADMIN",
      }),
      "allow",
    );
  });
});

describe("shouldProvisionFirstAdmin", () => {
  it("provisions when the email matches the bootstrap env and no admin exists", () => {
    assert.equal(
      shouldProvisionFirstAdmin({
        email: "owner@baerengarten.de",
        bootstrapEmail: "owner@baerengarten.de",
        adminCount: 0,
      }),
      true,
    );
  });

  it("normalizes case and whitespace on both sides", () => {
    assert.equal(
      shouldProvisionFirstAdmin({
        email: "  Owner@Bärengarten.de ",
        bootstrapEmail: " owner@bärengarten.de ",
        adminCount: 0,
      }),
      true,
    );
  });

  it("is dead once any ADMIN exists — the env var is not a standing mapping", () => {
    assert.equal(
      shouldProvisionFirstAdmin({
        email: "owner@baerengarten.de",
        bootstrapEmail: "owner@baerengarten.de",
        adminCount: 1,
      }),
      false,
    );
  });

  it("rejects identities that do not match the bootstrap email", () => {
    assert.equal(
      shouldProvisionFirstAdmin({
        email: "somebody@example.com",
        bootstrapEmail: "owner@baerengarten.de",
        adminCount: 0,
      }),
      false,
    );
  });

  it("is inert without the env var (unset, empty, whitespace)", () => {
    const noEnv = { email: "owner@baerengarten.de", adminCount: 0 };
    assert.equal(shouldProvisionFirstAdmin({ ...noEnv, bootstrapEmail: null }), false);
    assert.equal(shouldProvisionFirstAdmin({ ...noEnv, bootstrapEmail: undefined }), false);
    assert.equal(shouldProvisionFirstAdmin({ ...noEnv, bootstrapEmail: "" }), false);
    assert.equal(shouldProvisionFirstAdmin({ ...noEnv, bootstrapEmail: "   " }), false);
  });
});
