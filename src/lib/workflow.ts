/**
 * RiayahOS – Intelligent Workflow Engine (Module 2.3)
 *
 * Central definition of the international patient journey. Every module
 * (Lead Management, Case Workspace, Executive Dashboard, Command Center,
 * Finance, Reports, Follow-ups) reads workflow state from these helpers so
 * a single stage change automatically propagates across the entire OS.
 *
 * The definitions here are intentionally declarative — no side effects, no
 * network calls — so the same code can drive:
 *   • The current in-memory demo data
 *   • Supabase-backed live data
 *   • Automations triggered from Evolution API → n8n → OpenAI → RiayahOS
 */

import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Phone,
  FileText,
  Inbox,
  Brain,
  MessageSquareQuote,
  Reply,
  ReceiptText,
  UserCheck,
  Stamp,
  Plane,
  PlaneLanding,
  ClipboardCheck,
  Stethoscope,
  BedDouble,
  HeartPulse,
  Bed,
  LogOut,
  PlaneTakeoff,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────
// Stage catalogue
// ────────────────────────────────────────────────────────────────

export type WorkflowStageId =
  | "new_lead"
  | "contacted"
  | "reports_requested"
  | "reports_received"
  | "medical_review"
  | "hospital_opinion_requested"
  | "hospital_opinion_received"
  | "quotation_generated"
  | "patient_decision"
  | "visa_processing"
  | "flight_booked"
  | "arrival"
  | "hospital_registration"
  | "op_consultation"
  | "admission"
  | "surgery"
  | "icu"
  | "ward_recovery"
  | "discharge"
  | "return_travel"
  | "post_treatment_followup"
  | "case_completed";

export type StageCategory =
  | "Lead"
  | "Medical"
  | "Commercial"
  | "Travel"
  | "Clinical"
  | "Recovery"
  | "Post-care";

export interface WorkflowStage {
  id: WorkflowStageId;
  name: string;
  description: string;
  category: StageCategory;
  icon: LucideIcon;
  /** SLA duration in hours from stage entry. */
  slaHours: number;
  /** Stage may be skipped in certain clinical paths (e.g. OP-only). */
  optional?: boolean;
  /** Documents that must exist before the stage can be marked complete. */
  requiredDocuments: string[];
  /** Operational checklist auto-created on stage entry. */
  requiredTasks: string[];
  /** Guard evaluated before entering the stage — returns list of blockers. */
  entryRequirements?: string[];
  /** Default recommendation shown while the case is in this stage. */
  nextBestAction: string;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "new_lead",
    name: "New Lead",
    description: "Enquiry captured from any source (WhatsApp, form, Meta ads, referral).",
    category: "Lead",
    icon: Sparkles,
    slaHours: 2,
    requiredDocuments: [],
    requiredTasks: ["Acknowledge enquiry within 30 min", "Assign coordinator", "Capture patient basics"],
    nextBestAction: "Contact patient within 30 minutes to acknowledge the enquiry.",
  },
  {
    id: "contacted",
    name: "Contacted",
    description: "First conversation completed — language, timezone and preferred channel confirmed.",
    category: "Lead",
    icon: Phone,
    slaHours: 24,
    requiredDocuments: [],
    requiredTasks: [
      "Log first call / message",
      "Confirm preferred language & channel",
      "Explain Riayah Care process",
    ],
    nextBestAction: "Request medical reports and identity documents.",
  },
  {
    id: "reports_requested",
    name: "Reports Requested",
    description: "Medical report checklist sent to patient / family.",
    category: "Medical",
    icon: FileText,
    slaHours: 48,
    requiredDocuments: [],
    requiredTasks: [
      "Send report checklist (WhatsApp / email)",
      "Reminder after 24h",
      "Reminder after 48h",
    ],
    nextBestAction: "Follow up daily until reports arrive.",
  },
  {
    id: "reports_received",
    name: "Reports Received",
    description: "Medical reports uploaded to the case file and organised by type.",
    category: "Medical",
    icon: Inbox,
    slaHours: 24,
    requiredDocuments: ["Patient Reports", "Passport"],
    requiredTasks: [
      "Verify report completeness",
      "Translate reports if required",
      "Tag reports by specialty",
    ],
    entryRequirements: ["At least one medical report uploaded"],
    nextBestAction: "Route to medical team for clinical review.",
  },
  {
    id: "medical_review",
    name: "Medical Review",
    description: "In-house medical team reviews reports and drafts a summary.",
    category: "Medical",
    icon: Brain,
    slaHours: 24,
    requiredDocuments: ["Medical Summary"],
    requiredTasks: [
      "Assign case to reviewing doctor",
      "Complete clinical summary",
      "Shortlist hospitals & doctors",
    ],
    nextBestAction: "Send anonymised case to shortlisted hospitals.",
  },
  {
    id: "hospital_opinion_requested",
    name: "Hospital Opinion Requested",
    description: "Case sent to one or more partner hospitals for a specialist opinion.",
    category: "Medical",
    icon: MessageSquareQuote,
    slaHours: 48,
    requiredDocuments: ["Case Summary"],
    requiredTasks: [
      "Send hospital email with reports",
      "Confirm receipt with hospital coordinator",
      "Reminder after 24h",
      "Reminder after 48h",
    ],
    nextBestAction: "Chase hospital coordinator until opinion is received.",
  },
  {
    id: "hospital_opinion_received",
    name: "Hospital Opinion Received",
    description: "Specialist opinion + preliminary plan returned by hospital.",
    category: "Medical",
    icon: Reply,
    slaHours: 24,
    requiredDocuments: ["Hospital Opinion"],
    requiredTasks: [
      "Translate opinion to patient language",
      "Prepare cost estimate request",
    ],
    entryRequirements: ["Hospital opinion document uploaded"],
    nextBestAction: "Request detailed quotation from hospital finance desk.",
  },
  {
    id: "quotation_generated",
    name: "Quotation Generated",
    description: "Riayah proposal built from hospital quotation, including service charges & FX.",
    category: "Commercial",
    icon: ReceiptText,
    slaHours: 24,
    requiredDocuments: ["Hospital Quotation", "Riayah Proposal"],
    requiredTasks: [
      "Attach hospital quotation",
      "Apply FX + service charges",
      "Send proposal to patient",
    ],
    entryRequirements: ["Hospital opinion received"],
    nextBestAction: "Present proposal on a call and answer questions same day.",
  },
  {
    id: "patient_decision",
    name: "Patient Decision",
    description: "Patient confirms acceptance, requests revision, or declines.",
    category: "Commercial",
    icon: UserCheck,
    slaHours: 72,
    requiredDocuments: ["Signed Acceptance"],
    requiredTasks: [
      "Daily follow-up until decision",
      "Handle objections / negotiate",
      "Record decision & reason",
    ],
    entryRequirements: ["Proposal sent to patient"],
    nextBestAction: "Follow up patient every 24h until a decision is recorded.",
  },
  {
    id: "visa_processing",
    name: "Visa Processing",
    description: "Medical visa invitation issued, application submitted and tracked.",
    category: "Travel",
    icon: Stamp,
    slaHours: 120,
    requiredDocuments: ["Passport", "Invitation Letter", "Visa Copy"],
    requiredTasks: [
      "Collect passport & photos",
      "Generate invitation letter",
      "Send visa documents to patient",
      "Confirm visa approval",
    ],
    entryRequirements: ["Patient accepted proposal"],
    nextBestAction: "Chase embassy status daily and share updates with the family.",
  },
  {
    id: "flight_booked",
    name: "Flight Booked",
    description: "Travel itinerary confirmed for patient and attendants.",
    category: "Travel",
    icon: Plane,
    slaHours: 48,
    requiredDocuments: ["Flight Ticket", "Hotel Confirmation"],
    requiredTasks: [
      "Confirm arrival airport & date",
      "Book hotel near hospital",
      "Share full itinerary with family",
    ],
    entryRequirements: ["Visa approved"],
    nextBestAction: "Share full arrival plan (airport pickup, hotel, hospital) with the family.",
  },
  {
    id: "arrival",
    name: "Arrival in India",
    description: "Patient landed — pickup executed, hotel check-in complete.",
    category: "Travel",
    icon: PlaneLanding,
    slaHours: 12,
    requiredDocuments: ["Arrival Confirmation"],
    requiredTasks: [
      "Airport pickup",
      "Hotel check-in",
      "Assign on-ground translator",
    ],
    entryRequirements: ["Flight booked"],
    nextBestAction: "Confirm hospital appointment for next morning.",
  },
  {
    id: "hospital_registration",
    name: "Hospital Registration",
    description: "Patient registered at hospital with MRN and initial paperwork completed.",
    category: "Clinical",
    icon: ClipboardCheck,
    slaHours: 24,
    requiredDocuments: ["Hospital MRN", "Consent Forms"],
    requiredTasks: [
      "Complete hospital registration",
      "Upload MRN to case file",
      "Confirm consulting doctor slot",
    ],
    entryRequirements: ["Patient arrived in India"],
    nextBestAction: "Accompany patient to first OP consultation.",
  },
  {
    id: "op_consultation",
    name: "OP Consultation",
    description: "First out-patient consultation with the consulting doctor.",
    category: "Clinical",
    icon: Stethoscope,
    slaHours: 24,
    requiredDocuments: ["Consultation Note"],
    requiredTasks: [
      "Attend consultation with translator",
      "Capture doctor's plan",
      "Confirm next step: admission / medical / discharge",
    ],
    nextBestAction: "Convert doctor's plan into the next workflow decision.",
  },
  {
    id: "admission",
    name: "Admission",
    description: "Patient admitted to hospital for procedure or treatment.",
    category: "Clinical",
    icon: BedDouble,
    slaHours: 12,
    optional: true,
    requiredDocuments: ["Admission Note", "Pre-op Consent"],
    requiredTasks: [
      "Complete admission formalities",
      "Verify insurance / payment mode",
      "Brief family on admission plan",
    ],
    nextBestAction: "Confirm surgery / procedure schedule with the OT desk.",
  },
  {
    id: "surgery",
    name: "Surgery / Procedure",
    description: "Surgery or major intervention performed.",
    category: "Clinical",
    icon: HeartPulse,
    slaHours: 24,
    optional: true,
    requiredDocuments: ["OT Note", "Post-op Instructions"],
    requiredTasks: [
      "Confirm OT completion with surgeon",
      "Update family in real time",
      "Log post-op instructions",
    ],
    nextBestAction: "Track ICU / ward transfer and update the family.",
  },
  {
    id: "icu",
    name: "ICU",
    description: "Critical monitoring in intensive care unit.",
    category: "Recovery",
    icon: Bed,
    slaHours: 48,
    optional: true,
    requiredDocuments: ["ICU Progress Note"],
    requiredTasks: ["Daily ICU update to family", "Track vitals & investigations"],
    nextBestAction: "Coordinate ward transfer when patient is stable.",
  },
  {
    id: "ward_recovery",
    name: "Ward Recovery",
    description: "Patient recovering in the ward — physio, medication, monitoring.",
    category: "Recovery",
    icon: Bed,
    slaHours: 96,
    optional: true,
    requiredDocuments: ["Daily Progress Notes"],
    requiredTasks: [
      "Daily update to family",
      "Coordinate physio / diet",
      "Prepare discharge checklist",
    ],
    nextBestAction: "Confirm discharge date and start discharge paperwork.",
  },
  {
    id: "discharge",
    name: "Discharge",
    description: "Discharge summary, final bill and medication handover complete.",
    category: "Recovery",
    icon: LogOut,
    slaHours: 24,
    requiredDocuments: ["Discharge Summary", "Hospital Bill", "Prescriptions"],
    requiredTasks: [
      "Collect discharge summary",
      "Settle hospital bill",
      "Brief patient on medications & follow-up",
    ],
    nextBestAction: "Schedule return travel and post-treatment follow-up.",
  },
  {
    id: "return_travel",
    name: "Return Travel",
    description: "Patient return flight booked and family safely home.",
    category: "Travel",
    icon: PlaneTakeoff,
    slaHours: 48,
    requiredDocuments: ["Return Ticket"],
    requiredTasks: ["Book return flight", "Airport drop", "Confirm safe arrival home"],
    entryRequirements: ["Discharge complete"],
    nextBestAction: "Schedule the first tele-follow-up within 7 days.",
  },
  {
    id: "post_treatment_followup",
    name: "Post Treatment Follow-up",
    description: "Structured follow-ups at 7 / 30 / 90 days with doctor input.",
    category: "Post-care",
    icon: CalendarClock,
    slaHours: 168,
    requiredDocuments: ["Follow-up Notes"],
    requiredTasks: [
      "7-day tele-follow-up",
      "30-day tele-follow-up",
      "90-day tele-follow-up",
      "Collect testimonial",
    ],
    nextBestAction: "Complete scheduled tele-follow-ups and log outcomes.",
  },
  {
    id: "case_completed",
    name: "Case Completed",
    description: "Case archived — outcome, revenue and NPS captured.",
    category: "Post-care",
    icon: CheckCircle2,
    slaHours: 0,
    requiredDocuments: [],
    requiredTasks: ["Log final outcome", "Record NPS / testimonial", "Archive case"],
    nextBestAction: "Archive the case and feed learnings into the intelligence engine.",
  },
];

export const STAGE_MAP: Record<WorkflowStageId, WorkflowStage> = Object.fromEntries(
  WORKFLOW_STAGES.map((s) => [s.id, s]),
) as Record<WorkflowStageId, WorkflowStage>;

// ────────────────────────────────────────────────────────────────
// Clinical paths
// ────────────────────────────────────────────────────────────────

export type ClinicalPathId = "op_only" | "surgery" | "medical_management";

export interface ClinicalPath {
  id: ClinicalPathId;
  label: string;
  description: string;
  stages: WorkflowStageId[];
}

const PRE_TREATMENT: WorkflowStageId[] = [
  "new_lead",
  "contacted",
  "reports_requested",
  "reports_received",
  "medical_review",
  "hospital_opinion_requested",
  "hospital_opinion_received",
  "quotation_generated",
  "patient_decision",
  "visa_processing",
  "flight_booked",
  "arrival",
  "hospital_registration",
];

export const CLINICAL_PATHS: Record<ClinicalPathId, ClinicalPath> = {
  op_only: {
    id: "op_only",
    label: "OP Consultation Only",
    description: "Out-patient consultation and departure — no admission required.",
    stages: [
      ...PRE_TREATMENT,
      "op_consultation",
      "discharge",
      "return_travel",
      "post_treatment_followup",
      "case_completed",
    ],
  },
  surgery: {
    id: "surgery",
    label: "Surgery",
    description: "Admission → surgery → ICU (if required) → ward recovery → discharge.",
    stages: [
      ...PRE_TREATMENT,
      "op_consultation",
      "admission",
      "surgery",
      "icu",
      "ward_recovery",
      "discharge",
      "return_travel",
      "post_treatment_followup",
      "case_completed",
    ],
  },
  medical_management: {
    id: "medical_management",
    label: "Medical Management",
    description: "Consultation and in-hospital medical treatment without surgery.",
    stages: [
      ...PRE_TREATMENT,
      "op_consultation",
      "admission",
      "ward_recovery",
      "discharge",
      "return_travel",
      "post_treatment_followup",
      "case_completed",
    ],
  },
};

// ────────────────────────────────────────────────────────────────
// Runtime state helpers
// ────────────────────────────────────────────────────────────────

export type SlaStatus = "on_track" | "due_soon" | "overdue" | "not_started";

export interface StageProgress {
  stageId: WorkflowStageId;
  status: "pending" | "in_progress" | "complete" | "skipped";
  entryDate?: string;
  exitDate?: string;
  assignedCoordinator?: string;
  completedTasks?: string[];
  uploadedDocuments?: string[];
  waitingHours?: number;
}

export interface WorkflowState {
  pathId: ClinicalPathId;
  currentStageId: WorkflowStageId;
  progress: Partial<Record<WorkflowStageId, StageProgress>>;
}

export function getPathStages(pathId: ClinicalPathId): WorkflowStage[] {
  return CLINICAL_PATHS[pathId].stages.map((id) => STAGE_MAP[id]);
}

export function getStageIndex(state: WorkflowState): number {
  return CLINICAL_PATHS[state.pathId].stages.indexOf(state.currentStageId);
}

export function getNextStage(state: WorkflowState): WorkflowStage | null {
  const stages = CLINICAL_PATHS[state.pathId].stages;
  const idx = stages.indexOf(state.currentStageId);
  if (idx === -1 || idx >= stages.length - 1) return null;
  return STAGE_MAP[stages[idx + 1]];
}

export function getPreviousStage(state: WorkflowState): WorkflowStage | null {
  const stages = CLINICAL_PATHS[state.pathId].stages;
  const idx = stages.indexOf(state.currentStageId);
  if (idx <= 0) return null;
  return STAGE_MAP[stages[idx - 1]];
}

export function computePipelineHours(state: WorkflowState): number {
  return Object.values(state.progress).reduce(
    (sum, p) => sum + (p?.waitingHours ?? 0),
    0,
  );
}

export interface AdvanceValidation {
  canAdvance: boolean;
  blockers: string[];
  missingDocuments: string[];
  missingTasks: string[];
}

/**
 * Validate whether a case can leave its current stage and enter the next one.
 * Runs entirely against the declarative stage config so the same rules apply
 * to manual advance clicks, n8n triggers, or Supabase RPC calls.
 */
export function validateAdvance(state: WorkflowState): AdvanceValidation {
  const stage = STAGE_MAP[state.currentStageId];
  const progress = state.progress[state.currentStageId];
  const uploaded = new Set(progress?.uploadedDocuments ?? []);
  const completed = new Set(progress?.completedTasks ?? []);

  const missingDocuments = stage.requiredDocuments.filter((d) => !uploaded.has(d));
  const missingTasks = stage.requiredTasks.filter((t) => !completed.has(t));

  const next = getNextStage(state);
  const blockers: string[] = [];
  if (missingDocuments.length) blockers.push(`Missing documents: ${missingDocuments.join(", ")}`);
  if (missingTasks.length) blockers.push(`Pending tasks: ${missingTasks.length}`);
  if (next?.entryRequirements) {
    for (const req of next.entryRequirements) blockers.push(`Required for ${next.name}: ${req}`);
  }

  return {
    canAdvance: missingDocuments.length === 0 && missingTasks.length === 0,
    blockers,
    missingDocuments,
    missingTasks,
  };
}

export function computeSlaStatus(
  stage: WorkflowStage,
  progress?: StageProgress,
): { status: SlaStatus; remainingHours: number } {
  if (!progress?.entryDate) return { status: "not_started", remainingHours: stage.slaHours };
  const entered = new Date(progress.entryDate).getTime();
  const elapsedHours = (Date.now() - entered) / 3_600_000;
  const remaining = stage.slaHours - elapsedHours;
  if (remaining < 0) return { status: "overdue", remainingHours: remaining };
  if (remaining < stage.slaHours * 0.2) return { status: "due_soon", remainingHours: remaining };
  return { status: "on_track", remainingHours: remaining };
}

export function formatSlaLabel(remainingHours: number): string {
  const abs = Math.abs(remainingHours);
  if (abs < 1) return `${Math.round(abs * 60)} min`;
  if (abs < 48) return `${abs.toFixed(1)} h`;
  return `${(abs / 24).toFixed(1)} d`;
}

// ────────────────────────────────────────────────────────────────
// Timeline / task event templates
// ────────────────────────────────────────────────────────────────

export interface WorkflowEvent {
  kind:
    | "stage_changed"
    | "document_uploaded"
    | "task_completed"
    | "sla_breached"
    | "automation_triggered";
  stageId: WorkflowStageId;
  message: string;
  at: string;
  actor?: string;
}

/**
 * Build the timeline events that should be emitted when a case moves from
 * `from` → `to`. Downstream code (Supabase writer, activity log, executive
 * dashboard) can subscribe to these events without knowing workflow rules.
 */
export function buildStageChangeEvents(
  from: WorkflowStageId,
  to: WorkflowStageId,
  actor?: string,
): WorkflowEvent[] {
  const now = new Date().toISOString();
  return [
    {
      kind: "stage_changed",
      stageId: to,
      message: `Stage moved from ${STAGE_MAP[from].name} to ${STAGE_MAP[to].name}`,
      at: now,
      actor,
    },
  ];
}

// ────────────────────────────────────────────────────────────────
// Downstream propagation (documented contract for future backend)
// ────────────────────────────────────────────────────────────────

/**
 * Every stage change should trigger the following operational updates.
 * Kept as a contract that Supabase functions / n8n workflows will implement.
 */
export const STAGE_CHANGE_PROPAGATION = [
  "Case Health Score recalculated",
  "Revenue Probability updated",
  "Executive Dashboard KPIs refreshed",
  "Executive Command Center feed updated",
  "Expected Revenue + 30/60/90 forecast recomputed",
  "Timeline event appended",
  "Activity log entry created",
  "Next Best Action recomputed",
  "SLA timers reset for the new stage",
  "Automatic tasks + reminders created for the new stage",
] as const;
