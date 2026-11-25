import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findDuplicateLead,
  intakeSecretMatches,
  newLeadCaseFields,
  normalizePhoneToE164,
  n8nLeadSchema,
} from "./n8n";

describe("n8n lead intake rules", () => {
  it("accepts only the configured header key", () => {
    assert.equal(intakeSecretMatches("secret-from-test", "secret-from-test"), true);
    assert.equal(intakeSecretMatches("wrong", "secret-from-test"), false);
    assert.equal(intakeSecretMatches(null, "secret-from-test"), false);
    assert.equal(intakeSecretMatches("secret-from-test", undefined), false);
  });

  it("matches the same source and external sender ID", () => {
    assert.equal(
      findDuplicateLead(
        [{ lead_id: "case-1", source: "instagram", external_id: "ig-user-77", normalized_phone: null }],
        "instagram",
        "ig-user-77",
        null,
      ),
      "case-1",
    );
  });

  it("matches a normalized phone across different sources", () => {
    assert.equal(
      findDuplicateLead(
        [{ lead_id: "case-2", source: "website", external_id: "web-1", normalized_phone: "+918589868653" }],
        "whatsapp",
        "wa-2",
        "+918589868653",
      ),
      "case-2",
    );
  });

  it("normalizes formatted Indian numbers to E.164", () => {
    assert.equal(normalizePhoneToE164("+91 (85898) 68653", "India"), "+918589868653");
    assert.equal(normalizePhoneToE164("08589868653", "IN"), "+918589868653");
    assert.equal(normalizePhoneToE164("8589868653", null), null);
  });

  it("creates new leads at New and unassigned", () => {
    assert.deepEqual(newLeadCaseFields("website", "2026-11-24T10:30:00.000Z"), {
      status: "new",
      workflow_stage: "lead_captured",
      urgency: "medium",
      decision_status: "pending",
      lead_source: "website",
      coordinator_id: null,
      enquiry_date: "2026-11-24",
      is_demo: false,
    });
    assert.equal(newLeadCaseFields("lead_ad", "2026-11-24T10:30:00.000Z").lead_source, "lead_ad");
  });

  it("rejects non-HTTP attachment URLs and unknown sources", () => {
    const valid = {
      source: "website",
      external_id: "web-123",
      received_at: "2026-11-24T10:30:00.000Z",
      raw_payload: {},
    };
    assert.equal(
      n8nLeadSchema.safeParse({ ...valid, attachments: [{ url: "javascript:alert(1)", type: "image" }] }).success,
      false,
    );
    assert.equal(n8nLeadSchema.safeParse({ ...valid, source: "sms" }).success, false);
  });
});