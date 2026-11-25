import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findDuplicateLead,
  intakeSecretMatches,
  newLeadCaseFields,
  normalizePhoneToE164,
  n8nLeadSchema,
  sortLeadsByAiBrief,
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

  it("accepts the complete optional internal AI brief and rejects unsupported values", () => {
    const valid = {
      source: "website",
      external_id: "web-123",
      received_at: "2026-11-24T10:30:00.000Z",
      raw_payload: {},
    };
    const aiBrief = {
      seriousness: "critical",
      seriousness_reason: "Rapidly worsening symptoms",
      temperature: "hot",
      score: 92.5,
      summary: "The patient requested urgent specialist review.",
      key_findings: ["Symptoms began recently"],
      likely_specialty: "Cardiology",
      suggested_hospitals: ["Riayah partner hospital"],
      missing_info: ["Recent test results"],
      talking_points: ["Confirm symptom progression"],
      questions_to_ask: ["When did symptoms worsen?"],
      red_flags: ["New chest pain"],
      residence_confirmed: true,
      language: "en",
      generated_at: "2026-11-24T10:30:00.000Z",
    };

    const accepted = n8nLeadSchema.safeParse({ ...valid, ai_brief: aiBrief });
    assert.equal(accepted.success, true);
    assert.equal(n8nLeadSchema.safeParse({ ...valid, ai_brief: { ...aiBrief, temperature: "urgent" } }).success, false);
    assert.equal(n8nLeadSchema.safeParse({ ...valid, ai_brief: { ...aiBrief, language: "fr" } }).success, false);
  });

  it("orders Critical + Hot first and leaves leads without briefs last", () => {
    const sorted = sortLeadsByAiBrief([
      { id: "no-brief", aiSeriousness: null, aiTemperature: null, createdAt: "2026-11-24T12:00:00.000Z" },
      { id: "high-hot", aiSeriousness: "high", aiTemperature: "hot", createdAt: "2026-11-24T11:00:00.000Z" },
      { id: "critical-hot", aiSeriousness: "critical", aiTemperature: "hot", createdAt: "2026-11-24T09:00:00.000Z" },
      { id: "critical-cold", aiSeriousness: "critical", aiTemperature: "cold", createdAt: "2026-11-24T10:00:00.000Z" },
    ]);

    assert.deepEqual(sorted.map((lead) => lead.id), ["critical-hot", "critical-cold", "high-hot", "no-brief"]);
  });

  it("rejects insecure attachment URLs and unknown sources", () => {
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
    assert.equal(
      n8nLeadSchema.safeParse({ ...valid, attachments: [{ url: "http://files.example.org/report.pdf", type: "pdf" }] }).success,
      false,
    );
    assert.equal(
      n8nLeadSchema.safeParse({ ...valid, attachments: [{ url: "https://127.0.0.1/report.pdf", type: "pdf" }] }).success,
      false,
    );
    assert.equal(n8nLeadSchema.safeParse({ ...valid, source: "sms" }).success, false);
  });
});