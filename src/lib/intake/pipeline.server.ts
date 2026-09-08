/**
 * Central lead intake pipeline.
 *
 * Every channel (website, WhatsApp, Messenger, Instagram, lead ads, referral,
 * manual entry) funnels through `ingestIntakeEvent`. There is exactly one lead
 * system: intake events attach to existing persons/cases whenever possible and
 * never create parallel lead records.
 *
 * Server-only: imports the service-role Supabase client and the AI gateway.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  CHANNEL_TO_LEAD_SOURCE,
  type EvidenceSource,
  type IntakeInput,
  type IntakeResult,
  type UrgencyLevel,
} from "./types";
import {
  AiGatewayError,
  aiKey,
  assessLead,
  extractEnquiryFields,
  transcribeAudio,
  type ExtractedField,
} from "./ai.server";

type Admin = SupabaseClient<Database>;

const BUCKET = "patient-intake";

/* ------------------------------------------------------------------ */
/*  Small utilities                                                    */
/* ------------------------------------------------------------------ */

export function digits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

function last9(value: string | null | undefined): string {
  const d = digits(value);
  return d.length > 9 ? d.slice(-9) : d;
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function splitName(full: string | null | undefined): { first: string; last: string | null } {
  const cleaned = (full ?? "").trim().replace(/\s+/g, " ");
  if (!cleaned) return { first: "Unknown", last: null };
  const parts = cleaned.split(" ");
  return { first: parts[0], last: parts.length > 1 ? parts.slice(1).join(" ") : null };
}

/** Maps an evidence source onto the CRM field it can populate. */
const FIELD_GROUPS: Record<string, string> = {
  patient_name: "identity",
  phone_number: "identity",
  whatsapp_number: "identity",
  country: "identity",
  city: "identity",
  language: "identity",
  age: "identity",
  gender: "identity",
  condition: "clinical",
  treatment_requested: "clinical",
  symptoms: "clinical",
  current_issue: "clinical",
  previous_treatment: "clinical",
  preferred_hospital: "preference",
  preferred_doctor: "preference",
  preferred_treatment_location: "preference",
  expected_timeframe: "enquiry",
  stated_urgency: "enquiry",
  other_information: "enquiry",
};

/* ------------------------------------------------------------------ */
/*  Identity resolution / duplicate detection                          */
/* ------------------------------------------------------------------ */

export type IdentityResolution = {
  personId: string;
  created: boolean;
  needsReview: boolean;
  candidateIds: string[];
  matchedOn: string[];
};

export async function resolveIdentity(
  admin: Admin,
  contact: IntakeInput["contact"],
  isDemo: boolean,
): Promise<IdentityResolution> {
  const phoneKey = last9(contact.phone);
  const waKey = last9(contact.whatsapp);
  const email = (contact.email ?? "").trim().toLowerCase();

  const filters: string[] = [];
  if (phoneKey) filters.push(`primary_phone.ilike.%${phoneKey}`, `whatsapp_number.ilike.%${phoneKey}`);
  if (waKey && waKey !== phoneKey)
    filters.push(`whatsapp_number.ilike.%${waKey}`, `primary_phone.ilike.%${waKey}`);
  if (email) filters.push(`email.eq.${email}`);

  let matches: Array<{
    id: string;
    first_name: string;
    last_name: string | null;
    primary_phone: string | null;
    whatsapp_number: string | null;
    email: string | null;
  }> = [];

  if (filters.length > 0) {
    const { data, error } = await admin
      .from("persons")
      .select("id, first_name, last_name, primary_phone, whatsapp_number, email")
      .or(filters.join(","))
      .is("deleted_at", null)
      .limit(10);
    if (error) throw error;
    matches = data ?? [];
  }

  const strong = matches.filter(
    (m) =>
      (phoneKey && (last9(m.primary_phone) === phoneKey || last9(m.whatsapp_number) === phoneKey)) ||
      (waKey && (last9(m.whatsapp_number) === waKey || last9(m.primary_phone) === waKey)) ||
      (email && (m.email ?? "").toLowerCase() === email),
  );

  if (strong.length === 1) {
    const matchedOn: string[] = [];
    if (phoneKey) matchedOn.push("phone");
    if (waKey) matchedOn.push("whatsapp");
    if (email) matchedOn.push("email");
    // Backfill contact identifiers we now know about, without overwriting existing values.
    const patch: Database["public"]["Tables"]["persons"]["Update"] = {};
    if (contact.whatsapp && !strong[0].whatsapp_number) patch.whatsapp_number = contact.whatsapp;
    if (contact.phone && !strong[0].primary_phone) patch.primary_phone = contact.phone;
    if (contact.email && !strong[0].email) patch.email = contact.email;
    if (Object.keys(patch).length > 0) {
      await admin.from("persons").update(patch).eq("id", strong[0].id);
    }
    return { personId: strong[0].id, created: false, needsReview: false, candidateIds: [], matchedOn };
  }

  const { first, last } = splitName(contact.name);
  const { data: created, error: insertError } = await admin
    .from("persons")
    .insert({
      first_name: first,
      last_name: last,
      primary_phone: contact.phone ?? null,
      whatsapp_number: contact.whatsapp ?? contact.phone ?? null,
      email: contact.email ?? null,
      country_of_residence: contact.country ?? null,
      preferred_language: contact.language ?? null,
      is_demo: isDemo,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;

  return {
    personId: created.id,
    created: true,
    needsReview: strong.length > 1,
    candidateIds: strong.map((m) => m.id),
    matchedOn: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Coordinator assignment (rule driven, never hard-coded)             */
/* ------------------------------------------------------------------ */

export async function assignCoordinator(
  admin: Admin,
  criteria: {
    channel: IntakeInput["channel"];
    country?: string | null;
    language?: string | null;
    specialty?: string | null;
    priority?: UrgencyLevel | null;
  },
): Promise<{ coordinatorId: string | null; ruleId: string | null }> {
  const { data: rules, error } = await admin
    .from("coordinator_assignment_rules")
    .select("*")
    .eq("is_active", true)
    .order("priority_order", { ascending: true });
  if (error) throw error;

  const matchesList = (list: string[] | null, value: string | null | undefined) =>
    !list || list.length === 0 || (!!value && list.some((v) => v.toLowerCase() === value.toLowerCase()));

  for (const rule of rules ?? []) {
    if (!matchesList(rule.match_countries, criteria.country)) continue;
    if (!matchesList(rule.match_languages, criteria.language)) continue;
    if (!matchesList(rule.match_specialties, criteria.specialty)) continue;
    if (
      rule.match_sources &&
      rule.match_sources.length > 0 &&
      !rule.match_sources.includes(criteria.channel)
    )
      continue;
    if (
      rule.match_priorities &&
      rule.match_priorities.length > 0 &&
      (!criteria.priority || !rule.match_priorities.includes(criteria.priority))
    )
      continue;

    if (rule.assign_to_user_id) return { coordinatorId: rule.assign_to_user_id, ruleId: rule.id };

    if (rule.assign_to_role) {
      const { data: roleRows } = await admin
        .from("user_roles")
        .select("user_id")
        .eq("role", rule.assign_to_role);
      const authIds = (roleRows ?? []).map((r) => r.user_id);
      if (authIds.length === 0) continue;

      const { data: staff } = await admin
        .from("users")
        .select("id")
        .in("auth_user_id", authIds)
        .eq("is_active", true)
        .is("deleted_at", null);
      const staffIds = (staff ?? []).map((s) => s.id);
      if (staffIds.length === 0) continue;

      if (!rule.balance_by_workload) return { coordinatorId: staffIds[0], ruleId: rule.id };

      const { data: openCases } = await admin
        .from("cases")
        .select("coordinator_id")
        .in("coordinator_id", staffIds)
        .is("deleted_at", null)
        .not("status", "in", "(completed,cancelled,lost)");
      const load = new Map<string, number>(staffIds.map((id) => [id, 0]));
      for (const row of openCases ?? []) {
        if (row.coordinator_id) load.set(row.coordinator_id, (load.get(row.coordinator_id) ?? 0) + 1);
      }
      const eligible = staffIds.filter(
        (id) => !rule.max_open_cases || (load.get(id) ?? 0) < rule.max_open_cases,
      );
      if (eligible.length === 0) continue;
      eligible.sort((a, b) => (load.get(a) ?? 0) - (load.get(b) ?? 0));
      return { coordinatorId: eligible[0], ruleId: rule.id };
    }
  }

  // No confident automatic assignment → unassigned queue.
  return { coordinatorId: null, ruleId: null };
}

/* ------------------------------------------------------------------ */
/*  Evidence-tracked fact writing with conflict flagging               */
/* ------------------------------------------------------------------ */

export async function recordFacts(
  admin: Admin,
  params: {
    personId: string;
    caseId: string | null;
    intakeEventId: string | null;
    communicationId?: string | null;
    documentId?: string | null;
    medicalReportId?: string | null;
    source: EvidenceSource;
    facts: Array<{
      fieldKey: string;
      value: string;
      quote?: string | null;
      confidence?: number | null;
      fieldGroup?: string;
    }>;
  },
): Promise<{ inserted: number; conflicts: number }> {
  if (params.facts.length === 0) return { inserted: 0, conflicts: 0 };

  const keys = params.facts.map((f) => f.fieldKey);
  const existingQuery = admin
    .from("extracted_facts")
    .select("id, field_key, value_text, source, status")
    .in("field_key", keys)
    .in("status", ["proposed", "confirmed"]);
  const { data: existing, error: existingError } = params.caseId
    ? await existingQuery.eq("case_id", params.caseId)
    : await existingQuery.eq("person_id", params.personId);
  if (existingError) throw existingError;

  let conflicts = 0;
  const rows = params.facts.map((fact) => {
    const clash = (existing ?? []).find(
      (row) =>
        row.field_key === fact.fieldKey &&
        (row.value_text ?? "").trim().toLowerCase() !== fact.value.trim().toLowerCase(),
    );
    if (clash) conflicts += 1;
    return {
      person_id: params.personId,
      case_id: params.caseId,
      field_group: fact.fieldGroup ?? FIELD_GROUPS[fact.fieldKey] ?? "other",
      field_key: fact.fieldKey,
      field_label: fact.fieldKey.replace(/_/g, " "),
      value_text: fact.value,
      source: params.source,
      source_quote: fact.quote ?? null,
      intake_event_id: params.intakeEventId,
      communication_id: params.communicationId ?? null,
      document_id: params.documentId ?? null,
      medical_report_id: params.medicalReportId ?? null,
      confidence: fact.confidence ?? null,
      observed_at: new Date().toISOString(),
      status: clash ? ("conflicted" as const) : ("proposed" as const),
      conflict_group: clash ? `${params.caseId ?? params.personId}:${fact.fieldKey}` : null,
    };
  });

  const { error } = await admin.from("extracted_facts").insert(rows);
  if (error) throw error;

  // Flag the pre-existing side of every conflict too, so both values stay visible.
  const conflictKeys = rows.filter((r) => r.conflict_group).map((r) => r.field_key);
  if (conflictKeys.length > 0) {
    const ids = (existing ?? [])
      .filter((row) => conflictKeys.includes(row.field_key))
      .map((row) => row.id);
    if (ids.length > 0) {
      await admin.from("extracted_facts").update({ status: "conflicted" }).in("id", ids);
    }
  }

  return { inserted: rows.length, conflicts };
}

/* ------------------------------------------------------------------ */
/*  Triage assessment (AI recommendation, human review required)       */
/* ------------------------------------------------------------------ */

export async function recordTriage(
  admin: Admin,
  params: {
    caseId: string;
    personId: string;
    intakeEventId: string | null;
    priority: UrgencyLevel | null;
    reason: string | null;
    evidence: unknown;
    informationUsed: unknown;
    confidence: number | null;
    model: string;
    changeReason?: string | null;
  },
) {
  const { data: current } = await admin
    .from("ai_triage_assessments")
    .select("id, recommended_priority")
    .eq("case_id", params.caseId)
    .eq("is_current", true)
    .maybeSingle();

  const { data: inserted, error } = await admin
    .from("ai_triage_assessments")
    .insert({
      case_id: params.caseId,
      person_id: params.personId,
      intake_event_id: params.intakeEventId,
      decided_by_type: "ai",
      recommended_priority: params.priority,
      previous_priority: current?.recommended_priority ?? null,
      reason: params.reason,
      evidence: toJson(params.evidence),
      information_used: toJson(params.informationUsed),
      confidence: params.confidence,
      model: params.model,
      requires_human_review: true,
      is_current: true,
      change_reason: params.changeReason ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (current) {
    // Previous assessments are never deleted — only superseded.
    await admin
      .from("ai_triage_assessments")
      .update({ is_current: false, superseded_by: inserted.id })
      .eq("id", current.id);
  }
  return inserted.id;
}

/* ------------------------------------------------------------------ */
/*  Main pipeline                                                      */
/* ------------------------------------------------------------------ */

export async function ingestIntakeEvent(input: IntakeInput): Promise<IntakeResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as Admin;
  const notes: string[] = [];
  const isDemo = input.isDemo === true;

  /* 1. Duplicate-event protection ---------------------------------- */
  if (input.externalEventId && input.provider) {
    const { data: seen } = await admin
      .from("lead_intake_events")
      .select("id, person_id, case_id, status")
      .eq("provider", input.provider)
      .eq("external_event_id", input.externalEventId)
      .maybeSingle();
    if (seen) {
      return {
        intakeEventId: seen.id,
        personId: seen.person_id,
        caseId: seen.case_id,
        status: "duplicate_ignored",
        duplicateOfEventId: seen.id,
        aiAvailable: !!aiKey(),
        notes: ["Event already processed — ignored."],
      };
    }
  }

  /* 2. Record the raw event ---------------------------------------- */
  const { data: event, error: eventError } = await admin
    .from("lead_intake_events")
    .insert({
      channel: input.channel,
      provider: input.provider ?? null,
      external_event_id: input.externalEventId ?? null,
      received_at: input.receivedAt ?? new Date().toISOString(),
      status: "processing",
      contact_name: input.contact.name ?? null,
      contact_phone: input.contact.phone ?? null,
      contact_whatsapp: input.contact.whatsapp ?? null,
      contact_email: input.contact.email ?? null,
      contact_handle: input.contact.handle ?? null,
      locale: input.contact.language ?? null,
      raw_content: input.message ?? null,
      raw_payload: toJson(input.rawPayload),
      media_mime_type: input.media?.mimeType ?? null,
      is_demo: isDemo,
      created_by: input.createdBy ?? null,
    })
    .select("id")
    .single();
  if (eventError) throw eventError;
  const intakeEventId = event.id;

  const fail = async (message: string) => {
    await admin
      .from("lead_intake_events")
      .update({ status: "failed", status_reason: message.slice(0, 500) })
      .eq("id", intakeEventId);
  };

  try {
    /* 3. Store original media --------------------------------------- */
    let mediaPath: string | null = null;
    let mediaBytes: Uint8Array | null = null;
    if (input.media) {
      mediaBytes = base64ToBytes(input.media.base64);
      const ext = input.media.fileName?.split(".").pop() ?? input.media.mimeType.split("/")[1] ?? "bin";
      mediaPath = `${isDemo ? "demo" : "intake"}/${intakeEventId}/${input.media.kind}.${ext}`;
      const { error: uploadError } = await admin.storage
        .from(BUCKET)
        .upload(mediaPath, mediaBytes as unknown as ArrayBufferView, {
          contentType: input.media.mimeType,
          upsert: true,
        });
      if (uploadError) {
        notes.push(`Original media could not be stored: ${uploadError.message}`);
        mediaPath = null;
      } else {
        await admin
          .from("lead_intake_events")
          .update({ media_storage_path: mediaPath })
          .eq("id", intakeEventId);
      }
    }

    /* 4. Voice transcription ---------------------------------------- */
    let transcript: string | null = null;
    if (input.media?.kind === "audio" && mediaBytes) {
      const { data: voiceRow } = await admin
        .from("voice_transcripts")
        .insert({
          intake_event_id: intakeEventId,
          audio_storage_path: mediaPath,
          audio_mime_type: input.media.mimeType,
          duration_seconds: input.media.durationSeconds ?? null,
          status: "processing",
        })
        .select("id")
        .single();

      try {
        const result = await transcribeAudio(mediaBytes, input.media.mimeType, "voice-note");
        if (result) {
          transcript = result.transcript;
          if (voiceRow)
            await admin
              .from("voice_transcripts")
              .update({ transcript: result.transcript, model: result.model, status: "completed" })
              .eq("id", voiceRow.id);
        } else if (voiceRow) {
          await admin
            .from("voice_transcripts")
            .update({ status: "failed", error_message: "Transcription unavailable" })
            .eq("id", voiceRow.id);
          notes.push("Voice note stored; transcription unavailable.");
        }
      } catch (error) {
        const message = error instanceof AiGatewayError ? `${error.status}: ${error.message}` : String(error);
        if (voiceRow)
          await admin
            .from("voice_transcripts")
            .update({ status: "failed", error_message: message.slice(0, 500) })
            .eq("id", voiceRow.id);
        notes.push(`Voice note stored; transcription failed (${message.slice(0, 120)}).`);
      }
    }

    /* 5. AI extraction from the message / transcript ----------------- */
    const corpus = [input.message, transcript].filter(Boolean).join("\n\n");
    let extracted: ExtractedField[] = [];
    let extractionModel: string | null = null;
    if (corpus.trim()) {
      try {
        const result = await extractEnquiryFields(corpus);
        if (result) {
          extracted = result.fields;
          extractionModel = result.model;
        } else {
          notes.push("AI extraction unavailable — enquiry stored as received.");
        }
      } catch (error) {
        const message = error instanceof AiGatewayError ? `${error.status}: ${error.message}` : String(error);
        notes.push(`AI extraction failed (${message.slice(0, 120)}).`);
      }
    }

    const stated = (key: string) => extracted.find((f) => f.field === key)?.value ?? null;
    const contact = {
      ...input.contact,
      name: input.contact.name ?? stated("patient_name"),
      phone: input.contact.phone ?? stated("phone_number"),
      whatsapp: input.contact.whatsapp ?? stated("whatsapp_number"),
      country: input.contact.country ?? stated("country"),
      language: input.contact.language ?? stated("language"),
    };

    /* 6. Identity resolution ----------------------------------------- */
    const identity = await resolveIdentity(admin, contact, isDemo);
    if (identity.needsReview) {
      await admin.from("identity_match_candidates").insert(
        identity.candidateIds.map((candidateId) => ({
          intake_event_id: intakeEventId,
          new_person_id: identity.personId,
          candidate_person_id: candidateId,
          match_score: 0.6,
          matched_on: toJson({ phone: contact.phone, whatsapp: contact.whatsapp, email: contact.email }),
          resolution: "pending",
          note: "Multiple possible existing patients — human confirmation required before merging.",
        })),
      );
      notes.push("Possible duplicate patient flagged for human confirmation.");
    }

    /* 7. Attach to an open case, or open a new lead ------------------ */
    const { data: openCase } = await admin
      .from("cases")
      .select("id, urgency, specialty, coordinator_id, target_country")
      .eq("person_id", identity.personId)
      .is("deleted_at", null)
      .not("status", "in", "(completed,cancelled,lost)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let caseId = openCase?.id ?? null;
    let caseCreated = false;
    if (!caseId) {
      const { data: newCase, error: caseError } = await admin
        .from("cases")
        .insert({
          person_id: identity.personId,
          status: "new",
          workflow_stage: "lead_captured",
          lead_source: CHANNEL_TO_LEAD_SOURCE[input.channel],
          enquiry_date: (input.receivedAt ?? new Date().toISOString()).slice(0, 10),
          disease: stated("condition"),
          notes: stated("other_information"),
          is_demo: isDemo,
        })
        .select("id")
        .single();
      if (caseError) throw caseError;
      caseId = newCase.id;
      caseCreated = true;
    }

    /* 8. Attribution -------------------------------------------------- */
    const a = input.attribution ?? {};
    await admin.from("lead_attribution").insert({
      intake_event_id: intakeEventId,
      case_id: caseId,
      person_id: identity.personId,
      channel: input.channel,
      platform: a.platform ?? null,
      campaign_name: a.campaignName ?? null,
      campaign_id: a.campaignId ?? null,
      adset_name: a.adsetName ?? null,
      adset_id: a.adsetId ?? null,
      ad_name: a.adName ?? null,
      ad_id: a.adId ?? null,
      form_id: a.formId ?? null,
      utm_source: a.utmSource ?? null,
      utm_medium: a.utmMedium ?? null,
      utm_campaign: a.utmCampaign ?? null,
      utm_content: a.utmContent ?? null,
      utm_term: a.utmTerm ?? null,
      referrer_url: a.referrerUrl ?? null,
      landing_url: a.landingUrl ?? null,
      is_first_touch: caseCreated,
    });

    /* 9. Conversation history ---------------------------------------- */
    let communicationId: string | null = null;
    if (corpus.trim() || input.media) {
      const channelMap: Record<string, Database["public"]["Enums"]["comm_channel"]> = {
        whatsapp: "whatsapp",
        email: "email",
        manual: "note",
      };
      const { data: comm } = await admin
        .from("communications")
        .insert({
          case_id: caseId,
          person_id: identity.personId,
          channel: input.media?.kind === "audio" ? "voice_note" : (channelMap[input.channel] ?? "note"),
          direction: "incoming",
          subject: `Enquiry via ${input.channel.replace(/_/g, " ")}`,
          body: corpus || null,
          from_identifier: contact.phone ?? contact.handle ?? contact.email ?? null,
          external_message_id: input.externalEventId ?? null,
          provider: input.provider ?? null,
          occurred_at: input.receivedAt ?? new Date().toISOString(),
          attachment_path: mediaPath,
          duration_seconds: input.media?.durationSeconds ?? null,
        })
        .select("id")
        .maybeSingle();
      communicationId = comm?.id ?? null;
      if (communicationId) {
        await admin
          .from("lead_intake_events")
          .update({ communication_id: communicationId })
          .eq("id", intakeEventId);
        await admin.from("voice_transcripts").update({
          communication_id: communicationId,
          person_id: identity.personId,
          case_id: caseId,
        }).eq("intake_event_id", intakeEventId);
      }
    }

    /* 10. Evidence-tracked facts -------------------------------------- */
    const source: EvidenceSource =
      input.channel === "manual"
        ? "manual_entry"
        : input.media?.kind === "audio"
          ? "voice_transcript"
          : input.channel === "facebook_lead_ad" || input.channel === "instagram_lead_ad"
            ? "lead_form"
            : "patient_message";

    const { conflicts } = await recordFacts(admin, {
      personId: identity.personId,
      caseId,
      intakeEventId,
      communicationId,
      source,
      facts: extracted.map((f) => ({
        fieldKey: f.field,
        value: String(f.value),
        quote: f.quote ?? null,
        confidence: f.confidence ?? null,
      })),
    });
    if (conflicts > 0) notes.push(`${conflicts} conflicting value(s) flagged for review.`);

    /* 11. AI triage + summary + next best action ----------------------- */
    let priority: UrgencyLevel | null = null;
    if (corpus.trim()) {
      try {
        const context = [
          `Channel: ${input.channel}`,
          `Existing patient: ${identity.created ? "no" : "yes"}`,
          `Patient message / voice transcript:\n${corpus.slice(0, 8000)}`,
          extracted.length
            ? `Structured information extracted from the message:\n${extracted
                .map((f) => `- ${f.field}: ${f.value}`)
                .join("\n")}`
            : "No structured information could be extracted.",
          "Documents available: none attached to this enquiry yet.",
        ].join("\n\n");

        const assessment = await assessLead(context);
        if (assessment) {
          priority = assessment.priority;
          await recordTriage(admin, {
            caseId: caseId!,
            personId: identity.personId,
            intakeEventId,
            priority,
            reason: assessment.reason,
            evidence: assessment.evidence,
            informationUsed: {
              message: !!input.message,
              voice_transcript: !!transcript,
              extracted_fields: extracted.map((f) => f.field),
            },
            confidence: assessment.confidence,
            model: assessment.model,
            changeReason: caseCreated ? "Initial enquiry received" : "New information received on existing case",
          });

          if (assessment.summary) {
            await admin.from("ai_analysis").insert({
              case_id: caseId,
              analysis_type: "lead_summary",
              summary: assessment.summary,
              output: toJson({
                missing_information: assessment.missingInformation,
                next_best_action: assessment.nextBestAction,
                evidence: assessment.evidence,
              }),
              confidence: assessment.confidence,
              model: assessment.model,
              reviewed: false,
            });
          }

          if (assessment.nextBestAction) {
            await admin.from("tasks").insert({
              case_id: caseId,
              title: assessment.nextBestAction.slice(0, 200),
              description: "AI-recommended next action — editable by the coordinator.",
              status: "open",
              priority:
                priority === "critical" ? "critical" : priority === "high" ? "high" : "medium",
            });
          }
        } else {
          notes.push("AI triage unavailable for this enquiry.");
        }
      } catch (error) {
        const message = error instanceof AiGatewayError ? `${error.status}: ${error.message}` : String(error);
        notes.push(`AI triage failed (${message.slice(0, 120)}).`);
      }
    }

    /* 12. Coordinator assignment --------------------------------------- */
    if (caseId && !openCase?.coordinator_id) {
      const { coordinatorId } = await assignCoordinator(admin, {
        channel: input.channel,
        country: contact.country,
        language: contact.language,
        specialty: openCase?.specialty ?? null,
        priority,
      });
      if (coordinatorId) {
        await admin.from("cases").update({ coordinator_id: coordinatorId }).eq("id", caseId);
      } else {
        notes.push("No matching assignment rule — lead placed in the unassigned queue.");
      }
    }

    /* 13. Audit trail ---------------------------------------------------- */
    await admin.from("ai_intake_audit").insert({
      intake_event_id: intakeEventId,
      case_id: caseId,
      person_id: identity.personId,
      action: caseCreated ? "lead_created" : "lead_updated",
      input_source: source,
      input_reference: toJson({
        provider: input.provider,
        external_event_id: input.externalEventId,
        communication_id: communicationId,
        media_storage_path: mediaPath,
      }),
      model: extractionModel,
      output: toJson({ extracted_fields: extracted, transcript_present: !!transcript }),
      evidence: toJson(extracted.map((f) => ({ field: f.field, quote: f.quote ?? null }))),
    });

    await admin
      .from("lead_intake_events")
      .update({
        status: identity.needsReview ? "needs_review" : "processed",
        person_id: identity.personId,
        case_id: caseId,
        processed_at: new Date().toISOString(),
        status_reason: notes.length ? notes.join(" ") : null,
      })
      .eq("id", intakeEventId);

    return {
      intakeEventId,
      personId: identity.personId,
      caseId,
      status: identity.needsReview ? "needs_review" : "processed",
      needsIdentityReview: identity.needsReview,
      conflicts,
      aiAvailable: !!aiKey(),
      notes,
    };
  } catch (error) {
    await fail(error instanceof Error ? error.message : String(error));
    throw error;
  }
}
