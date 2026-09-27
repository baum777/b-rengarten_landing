import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { publicContent } from "./public.ts";
import { propertyFacts } from "./property.ts";
import { transitionalFacts } from "./transitional.ts";
import { operatorFacts } from "./operator.ts";
import { liveFact, liveFactOrThrow, type ContentFact } from "./types.ts";

const serialized = JSON.stringify(publicContent);

describe("content state: exposure", () => {
  it("exposes PROPERTY_TRUTH + LIVE facts through the public projection", () => {
    assert.equal(publicContent.rooms, 12);
    assert.equal(publicContent.suites, 1);
    assert.equal(publicContent.address.street, "Schützenstraße 21");
    assert.equal(publicContent.address.zip, "88212");
    assert.match(publicContent.roomHeadline, /^12 Zimmer\. Eine Suite\.$/);
  });

  it("does not expose TRANSITIONAL + HOLD facts — the beer tank stays private", () => {
    assert.equal(transitionalFacts.beerTank.publicationState, "HOLD");
    assert.ok(!serialized.includes("14.000"), "tank capacity leaked");
    assert.ok(!serialized.includes("Biertank"), "tank leaked");
  });

  it("keeps every OPERATOR_STATE slot HIDDEN and out of the projection", () => {
    for (const fact of Object.values(operatorFacts)) {
      assert.equal(fact.publicationState, "HIDDEN", fact.key);
      assert.equal(fact.truthState, "OPERATOR_STATE", fact.key);
      assert.ok(!serialized.includes(fact.key), `${fact.key} leaked`);
    }
  });

  it("keeps TRANSITIONAL HOLD slots out of the projection entirely", () => {
    for (const fact of Object.values(transitionalFacts)) {
      if (fact.publicationState !== "LIVE") {
        assert.ok(!serialized.includes(fact.key), `${fact.key} leaked`);
      }
    }
  });

  it("handles LEGAL_REQUIRED explicitly instead of filtering it as marketing", () => {
    assert.equal(transitionalFacts.legalEmail.requirement, "LEGAL_REQUIRED");
    assert.equal(transitionalFacts.legalEmail.publicationState, "HOLD");
    assert.equal(transitionalFacts.legalEmail.value, null);
    assert.equal(propertyFacts.address.requirement, "LEGAL_REQUIRED");
  });

  it("fails loud when the projection reads a non-LIVE fact structurally", () => {
    const held: ContentFact<string | null> = {
      key: "test.hold",
      value: "geheim",
      truthState: "TRANSITIONAL",
      publicationState: "HOLD",
      requirement: "OPTIONAL",
    };
    assert.equal(liveFact(held), null);
    assert.throws(() => liveFactOrThrow(held), /not LIVE/);
  });
});

describe("content state: R1 claim regression fixtures", () => {
  it("never re-exposes removed room classes as canonical offerings", () => {
    for (const claim of ["Komfort", "Business", "Junior Suite"]) {
      assert.ok(!serialized.includes(claim), `${claim} leaked`);
    }
  });

  it("never re-exposes removed dish claims", () => {
    for (const claim of ["Zwiebelrostbraten", "Maultaschen"]) {
      assert.ok(!serialized.includes(claim), `${claim} leaked`);
    }
  });

  it("carries the neutral menu notice for the transitional menu state", () => {
    assert.match(publicContent.menuNotice, /Karte entsteht/);
  });
});
