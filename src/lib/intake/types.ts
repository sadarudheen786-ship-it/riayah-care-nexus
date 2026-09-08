/**
 * Shared, client-safe types for the RiayahOS AI Lead Capture & Intelligence Engine.
 * No secrets, no server-only imports — safe to import from UI code.
 */

import type { Database } from "@/integrations/supabase/types";

export type IntakeChannel = Database["public"]["Enums"]["intake_channel"];
export type IntakeStatus = Database["public"]["Enums"]["intake_status"];
export type EvidenceSource = Database["public"]["Enums"]["evidence_source"];
export type FactStatus = Database["public"]["Enums"]["fact_status"];
export type ExtractionStatus = Database["public"]["Enums"]["extraction_status"];
export type UrgencyLevel = Database["public"]["Enums"]["urgency_level"];
export type LeadSource = Database["public"]["Enums"]["lead_source"];
export type WorkflowStage = Database["public"]["Enums"]["workflow_stage"];

export const INTAKE_CHANNELS: { value: IntakeChannel; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "messenger", label: "Facebook Messenger" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "facebook_lead_ad", label: "Facebook Lead Ad" },
  { value: "instagram_lead_ad", label: "Instagram Lead Ad" },
  { value: "referral", label: "Referral" },
  { value: "manual", label: "Manual" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export const EVIDENCE_SOURCE_LABELS: Record<EvidenceSource, string> = {
  patient_message: "Patient stated",
  voice_transcript: "Voice transcript",
  medical_report: "Medical report",
  discharge_summary: "Discharge summary",
  prescription: "Prescription",
  lab_report: "Laboratory report",
  pathology_report: "Pathology report",
  radiology_report: "Radiology report",
  other_document: "Other document",
  existing_record: "Existing CRM record",
  doctor_opinion: "Doctor opinion",
  hospital_opinion: "Hospital opinion",
  manual_entry: "Entered by staff",
  lead_form: "Lead form",
};

/** Channel → CRM lead_source mapping. Keeps one intake architecture for all channels. */
export const CHANNEL_TO_LEAD_SOURCE: Record<IntakeChannel, LeadSource> = {
  website: "website",
  whatsapp: "whatsapp",
  messenger: "messenger",
  instagram: "instagram",
  facebook: "facebook",
  facebook_lead_ad: "facebook_lead_ad",
  instagram_lead_ad: "instagram_lead_ad",
  referral: "referral",
  manual: "manual",
  email: "email",
  other: "other",
};

/** Every field the text/voice extractor may return. Never guessed — omitted when not stated. */
export const ENQUIRY_FIELDS = [
  "patient_name",
  "phone_number",
  "whatsapp_number",
  "country",
  "city",
  "language",
  "age",
  "gender",
  "condition",
  "treatment_requested",
  "symptoms",
  "current_issue",
  "previous_treatment",
  "preferred_hospital",
  "preferred_doctor",
  "preferred_treatment_location",
  "expected_timeframe",
  "stated_urgency",
  "other_information",
] as const;
export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];

export type ExtractedFactInput = {
  fieldGroup: string;
  fieldKey: string;
  fieldLabel?: string | null;
  valueText?: string | null;
  valueJson?: unknown;
  source: EvidenceSource;
  sourceQuote?: string | null;
  confidence?: number | null;
};

export type AttributionInput = {
  platform?: string | null;
  campaignName?: string | null;
  campaignId?: string | null;
  adsetName?: string | null;
  adsetId?: string | null;
  adName?: string | null;
  adId?: string | null;
  formId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrerUrl?: string | null;
  landingUrl?: string | null;
};

export type IntakeContact = {
  name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  handle?: string | null;
  country?: string | null;
  language?: string | null;
};

export type IntakeMedia = {
  /** base64 (no data: prefix) */
  base64: string;
  mimeType: string;
  kind: "audio" | "document" | "image";
  fileName?: string;
  durationSeconds?: number | null;
};

export type IntakeInput = {
  channel: IntakeChannel;
  provider?: string | null;
  externalEventId?: string | null;
  receivedAt?: string | null;
  contact: IntakeContact;
  message?: string | null;
  attribution?: AttributionInput | null;
  media?: IntakeMedia | null;
  rawPayload?: unknown;
  isDemo?: boolean;
  createdBy?: string | null;
};

export type IntakeResult = {
  intakeEventId: string;
  personId: string | null;
  caseId: string | null;
  status: IntakeStatus;
  duplicateOfEventId?: string | null;
  needsIdentityReview?: boolean;
  conflicts?: number;
  aiAvailable: boolean;
  notes: string[];
};
