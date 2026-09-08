/**
 * Server functions backing the Lead Management module.
 * Everything here reads REAL database records only — no sample data, no
 * fabricated counters. Demo records (is_demo) are excluded from all metrics.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type Urgency = Database["public"]["Enums"]["urgency_level"];

export const LEAD_FUNNEL_STAGES = [
  "New Lead",
  "Contacted",
  "Reports Requested",
  "Reports Received",
  "Medical Review",
  "Hospital Opinion",
  "Proposal",
  "Follow-up",
  "Converted",
  "Lost",
] as const;
export type LeadFunnelStage = (typeof LEAD_FUNNEL_STAGES)[number];

const STAGE_MAP: Record<string, LeadFunnelStage> = {
  lead_captured: "New Lead",
  reports_requested: "Reports Requested",
  reports_received: "Reports Received",
  medical_review: "Medical Review",
  hospital_shortlist: "Medical Review",
  hospital_opinion_requested: "Hospital Opinion",
  hospital_opinion_received: "Hospital Opinion",
  quotation_prepared: "Proposal",
  quotation_sent: "Proposal",
  patient_decision: "Follow-up",
  confirmed: "Converted",
  visa_processing: "Converted",
  travel_booking: "Converted",
  arrival: "Converted",
  op_consultation: "Converted",
  admission: "Converted",
  surgery: "Converted",
  icu: "Converted",
  recovery: "Converted",
  discharge: "Converted",
  follow_up: "Converted",
  closed: "Converted",
};

export function funnelStageFor(
  workflowStage: string,
  status: string,
  contacted: boolean,
): LeadFunnelStage {
  if (status === "lost" || status === "cancelled") return "Lost";
  const mapped = STAGE_MAP[workflowStage] ?? "New Lead";
  if (mapped === "New Lead" && contacted) return "Contacted";
  return mapped;
}

export type LeadRow = {
  caseId: string;
  personId: string;
  name: string;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  source: string | null;
  channelLabel: string | null;
  condition: string | null;
  specialty: string | null;
  stage: LeadFunnelStage;
  workflowStage: string;
  status: string;
  urgency: Urgency;
  aiPriority: Urgency | null;
  aiPriorityReason: string | null;
  humanConfirmed: boolean;
  coordinator: string | null;
  createdAt: string;
  lastContactAt: string | null;
  hasConflicts: boolean;
  documentsCount: number;
};

export type LeadDashboard = {
  kpis: {
    totalLeads: number;
    newLeads: number;
    uncontacted: number;
    reportsPending: number;
    medicalReviewPending: number;
    hospitalOpinionPending: number;
    proposalStage: number;
    converted: number;
    lost: number;
    unassigned: number;
    needsIdentityReview: number;
    conflictingFacts: number;
  };
  funnel: Array<{ stage: LeadFunnelStage; count: number }>;
  bySource: Array<{ source: string; count: number }>;
  leads: LeadRow[];
  intakeHealth: {
    receivedToday: number;
    failed: number;
    needsReview: number;
    lastEventAt: string | null;
  };
};

export const getLeadDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LeadDashboard> => {
    const supabase = context.supabase;

    const { data: cases, error } = await supabase
      .from("cases")
      .select(
        `id, person_id, status, workflow_stage, urgency, lead_source, disease, specialty,
         created_at, coordinator_id, is_demo,
         persons!cases_person_id_fkey ( first_name, last_name, country_of_residence, primary_phone, whatsapp_number ),
         users!cases_coordinator_id_fkey ( full_name )`,
      )
      .eq("is_demo", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    const caseIds = (cases ?? []).map((c) => c.id);

    const [triage, comms, facts, docs, intake, identity] = await Promise.all([
      caseIds.length
        ? supabase
            .from("ai_triage_assessments")
            .select("case_id, recommended_priority, reason, decided_by_type, created_at")
            .in("case_id", caseIds)
            .eq("is_current", true)
        : Promise.resolve({ data: [], error: null }),
      caseIds.length
        ? supabase
            .from("communications")
            .select("case_id, occurred_at, direction")
            .in("case_id", caseIds)
            .is("deleted_at", null)
            .order("occurred_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      caseIds.length
        ? supabase.from("extracted_facts").select("case_id").in("case_id", caseIds).eq("status", "conflicted")
        : Promise.resolve({ data: [], error: null }),
      caseIds.length
        ? supabase.from("documents").select("case_id").in("case_id", caseIds).is("deleted_at", null)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("lead_intake_events")
        .select("id, status, received_at")
        .eq("is_demo", false)
        .order("received_at", { ascending: false })
        .limit(200),
      supabase.from("identity_match_candidates").select("id").eq("resolution", "pending"),
    ]);

    const triageByCase = new Map(
      (triage.data ?? []).map((t) => [t.case_id ?? "", t]),
    );
    const lastContact = new Map<string, string>();
    const contacted = new Set<string>();
    for (const comm of comms.data ?? []) {
      if (!comm.case_id) continue;
      if (!lastContact.has(comm.case_id)) lastContact.set(comm.case_id, comm.occurred_at);
      if (comm.direction === "outgoing") contacted.add(comm.case_id);
    }
    const conflictCases = new Set((facts.data ?? []).map((f) => f.case_id ?? ""));
    const docCount = new Map<string, number>();
    for (const doc of docs.data ?? []) {
      if (doc.case_id) docCount.set(doc.case_id, (docCount.get(doc.case_id) ?? 0) + 1);
    }

    const leads: LeadRow[] = (cases ?? []).map((c) => {
      const person = c.persons as unknown as {
        first_name: string;
        last_name: string | null;
        country_of_residence: string | null;
        primary_phone: string | null;
        whatsapp_number: string | null;
      } | null;
      const coordinator = c.users as unknown as { full_name: string } | null;
      const t = triageByCase.get(c.id);
      return {
        caseId: c.id,
        personId: c.person_id,
        name: [person?.first_name, person?.last_name].filter(Boolean).join(" ") || "Unnamed enquiry",
        country: person?.country_of_residence ?? null,
        phone: person?.primary_phone ?? null,
        whatsapp: person?.whatsapp_number ?? null,
        source: c.lead_source,
        channelLabel: c.lead_source ? c.lead_source.replace(/_/g, " ") : null,
        condition: c.disease,
        specialty: c.specialty,
        stage: funnelStageFor(c.workflow_stage, c.status, contacted.has(c.id)),
        workflowStage: c.workflow_stage,
        status: c.status,
        urgency: c.urgency,
        aiPriority: (t?.recommended_priority as Urgency | null) ?? null,
        aiPriorityReason: t?.reason ?? null,
        humanConfirmed: t?.decided_by_type === "human",
        coordinator: coordinator?.full_name ?? null,
        createdAt: c.created_at,
        lastContactAt: lastContact.get(c.id) ?? null,
        hasConflicts: conflictCases.has(c.id),
        documentsCount: docCount.get(c.id) ?? 0,
      };
    });

    const countStage = (stage: LeadFunnelStage) => leads.filter((l) => l.stage === stage).length;
    const bySourceMap = new Map<string, number>();
    for (const lead of leads) {
      const key = lead.source ?? "unknown";
      bySourceMap.set(key, (bySourceMap.get(key) ?? 0) + 1);
    }

    const today = new Date().toISOString().slice(0, 10);
    const intakeRows = intake.data ?? [];

    return {
      kpis: {
        totalLeads: leads.length,
        newLeads: countStage("New Lead"),
        uncontacted: leads.filter((l) => !contacted.has(l.caseId) && l.stage !== "Lost").length,
        reportsPending: countStage("Reports Requested"),
        medicalReviewPending: countStage("Medical Review"),
        hospitalOpinionPending: countStage("Hospital Opinion"),
        proposalStage: countStage("Proposal"),
        converted: countStage("Converted"),
        lost: countStage("Lost"),
        unassigned: leads.filter((l) => !l.coordinator && l.stage !== "Lost").length,
        needsIdentityReview: (identity.data ?? []).length,
        conflictingFacts: conflictCases.size,
      },
      funnel: LEAD_FUNNEL_STAGES.map((stage) => ({ stage, count: countStage(stage) })),
      bySource: Array.from(bySourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      leads,
      intakeHealth: {
        receivedToday: intakeRows.filter((r) => r.received_at.slice(0, 10) === today).length,
        failed: intakeRows.filter((r) => r.status === "failed").length,
        needsReview: intakeRows.filter((r) => r.status === "needs_review").length,
        lastEventAt: intakeRows[0]?.received_at ?? null,
      },
    };
  });

/* ------------------------------------------------------------------ */
/*  Lead detail: evidence, triage history, communications              */
/* ------------------------------------------------------------------ */

export const getLeadDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ caseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;

    const [facts, triage, comms, summary, tasks, attribution, transcripts, extractions] =
      await Promise.all([
        supabase
          .from("extracted_facts")
          .select("*")
          .eq("case_id", data.caseId)
          .order("created_at", { ascending: false }),
        supabase
          .from("ai_triage_assessments")
          .select("*")
          .eq("case_id", data.caseId)
          .order("created_at", { ascending: false }),
        supabase
          .from("communications")
          .select("id, channel, direction, subject, body, occurred_at, attachment_path")
          .eq("case_id", data.caseId)
          .is("deleted_at", null)
          .order("occurred_at", { ascending: false })
          .limit(50),
        supabase
          .from("ai_analysis")
          .select("summary, output, confidence, created_at")
          .eq("case_id", data.caseId)
          .eq("analysis_type", "lead_summary")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("tasks")
          .select("id, title, status, priority, due_at")
          .eq("case_id", data.caseId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("lead_attribution")
          .select("*")
          .eq("case_id", data.caseId)
          .order("created_at", { ascending: true }),
        supabase
          .from("voice_transcripts")
          .select("id, transcript, status, audio_storage_path, created_at")
          .eq("case_id", data.caseId)
          .order("created_at", { ascending: false }),
        supabase
          .from("document_extractions")
          .select("id, processor_key, status, detected_document_type, created_at")
          .eq("case_id", data.caseId)
          .order("created_at", { ascending: false }),
      ]);

    return {
      facts: facts.data ?? [],
      triage: triage.data ?? [],
      communications: comms.data ?? [],
      summary: summary.data ?? null,
      tasks: tasks.data ?? [],
      attribution: attribution.data ?? [],
      transcripts: transcripts.data ?? [],
      extractions: extractions.data ?? [],
    };
  });

/* ------------------------------------------------------------------ */
/*  Human override of the AI triage recommendation                     */
/* ------------------------------------------------------------------ */

export const overrideLeadPriority = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        caseId: z.string().uuid(),
        priority: z.enum(["low", "medium", "high", "critical"]),
        reason: z.string().min(3).max(1000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;

    const { data: staff } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", context.userId)
      .maybeSingle();

    const { data: caseRow, error: caseError } = await supabase
      .from("cases")
      .select("id, person_id, urgency")
      .eq("id", data.caseId)
      .single();
    if (caseError) throw caseError;

    const { data: current } = await supabase
      .from("ai_triage_assessments")
      .select("id, recommended_priority")
      .eq("case_id", data.caseId)
      .eq("is_current", true)
      .maybeSingle();

    const { data: inserted, error } = await supabase
      .from("ai_triage_assessments")
      .insert({
        case_id: data.caseId,
        person_id: caseRow.person_id,
        decided_by_type: "human",
        recommended_priority: data.priority,
        previous_priority: current?.recommended_priority ?? caseRow.urgency,
        reason: data.reason,
        change_reason: "Human override",
        requires_human_review: false,
        is_current: true,
        overridden_by: staff?.id ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;

    if (current) {
      await supabase
        .from("ai_triage_assessments")
        .update({ is_current: false, superseded_by: inserted.id })
        .eq("id", current.id);
    }

    await supabase.from("cases").update({ urgency: data.priority }).eq("id", data.caseId);

    await supabase.from("ai_intake_audit").insert({
      case_id: data.caseId,
      person_id: caseRow.person_id,
      action: "priority_override",
      human_change: {
        priority: data.priority,
        reason: data.reason,
        previous: current?.recommended_priority ?? caseRow.urgency,
      },
      changed_by: staff?.id ?? null,
    });

    return { ok: true, assessmentId: inserted.id };
  });

/* ------------------------------------------------------------------ */
/*  Confirming / rejecting AI-extracted information                    */
/* ------------------------------------------------------------------ */

export const reviewExtractedFact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        factId: z.string().uuid(),
        decision: z.enum(["confirmed", "rejected"]),
        note: z.string().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { data: staff } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", context.userId)
      .maybeSingle();

    const { error } = await supabase
      .from("extracted_facts")
      .update({
        status: data.decision,
        confirmed_by: staff?.id ?? null,
        confirmed_at: new Date().toISOString(),
        review_note: data.note ?? null,
      })
      .eq("id", data.factId);
    if (error) throw error;
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/*  Manual lead entry — same intake pipeline as every other channel    */
/* ------------------------------------------------------------------ */

export const createManualLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1).max(200),
        phone: z.string().max(40).optional(),
        whatsapp: z.string().max(40).optional(),
        email: z.string().email().max(200).optional().or(z.literal("")),
        country: z.string().max(100).optional(),
        message: z.string().max(8000).optional(),
        channel: z.enum(["manual", "referral", "website", "whatsapp", "email"]).default("manual"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    if (!data.phone && !data.whatsapp && !data.email) {
      throw new Error("Provide at least a phone number, WhatsApp number or email address.");
    }
    const { data: staff } = await context.supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", context.userId)
      .maybeSingle();

    const { ingestIntakeEvent } = await import("@/lib/intake/pipeline.server");
    const result = await ingestIntakeEvent({
      channel: data.channel,
      provider: "manual_entry",
      contact: {
        name: data.name,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        country: data.country || null,
      },
      message: data.message || null,
      createdBy: staff?.id ?? null,
    });
    return result;
  });

/* ------------------------------------------------------------------ */
/*  Duplicate-patient review queue                                     */
/* ------------------------------------------------------------------ */

export const resolveIdentityMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        matchId: z.string().uuid(),
        resolution: z.enum(["same_patient", "different_patient"]),
        note: z.string().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { data: staff } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", context.userId)
      .maybeSingle();

    const { error } = await supabase
      .from("identity_match_candidates")
      .update({
        resolution: data.resolution,
        resolved_by: staff?.id ?? null,
        resolved_at: new Date().toISOString(),
        note: data.note ?? null,
      })
      .eq("id", data.matchId);
    if (error) throw error;
    return { ok: true };
  });
