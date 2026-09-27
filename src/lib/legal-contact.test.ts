import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  legalContactEmail,
  type MissingLegalContact,
  type VerifiedLegalContact,
} from "./legal-contact.ts";

describe("legalContactEmail", () => {
  it("returns null while the legal datum is unverified (fail closed)", () => {
    const missing: MissingLegalContact = {
      status: "MISSING_VERIFICATION",
      requiredDatum: "email",
    };
    assert.equal(legalContactEmail(missing), null);
  });

  it("returns the address only from an explicitly verified record", () => {
    const verified: VerifiedLegalContact = {
      status: "VERIFIED",
      email: "impressum@example.org",
    };
    assert.equal(legalContactEmail(verified), "impressum@example.org");
  });
});
