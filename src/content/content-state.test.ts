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

describe("content state: R3 homepage projection", () => {
  it("derives the fact strip from LIVE room/suite facts without capacity claims", () => {
    assert.deepEqual(
      publicContent.factStrip.map((fact) => fact.value),
      ["12", "1", "2009", "2018"],
    );
    for (const banned of ["14.000", "Plätze", "Sitze", "200 Sitz"]) {
      assert.ok(!serialized.includes(banned), `${banned} leaked`);
    }
  });

  it("renders the timeline from documented facts only", () => {
    assert.equal(publicContent.timeline.length, 4);
    assert.equal(publicContent.timeline[1].text, propertyFacts.conversion2009.value);
    assert.equal(publicContent.timeline[2].text, propertyFacts.extension2018.value);
    assert.match(publicContent.timeline[3].text, /neues Kapitel/);
    assert.equal(publicContent.rutenfestStory, propertyFacts.eventHistory.value);
    for (const banned of ["Öffnungszeiten", "Programm", "täglich"]) {
      assert.ok(!serialized.includes(banned), `${banned} leaked`);
    }
  });

  it("keeps garden and architecture copy grounded in the LIVE facts", () => {
    assert.ok(
      publicContent.gardenStory.startsWith(propertyFacts.gardenChestnut.value),
    );
    assert.ok(
      publicContent.architectureStory.startsWith(propertyFacts.architecture.value),
    );
  });
});
