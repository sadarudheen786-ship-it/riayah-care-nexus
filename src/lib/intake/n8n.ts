import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const N8N_LEAD_SOURCES = [
  "instagram",
  "facebook",
  "whatsapp",
  "website",
  "lead_ad",
  "email",
] as const;

export type N8nLeadSource = (typeof N8N_LEAD_SOURCES)[number];
type IntakeChannel = Database["public"]["Enums"]["intake_channel"];
type LeadSource = Database["public"]["Enums"]["lead_source"];

export const AI_BRIEF_SERIOUSNESS = ["critical", "high", "moderate", "low"] as const;
export const AI_BRIEF_TEMPERATURE = ["hot", "warm", "cold"] as const;
export type AiBriefSeriousness = (typeof AI_BRIEF_SERIOUSNESS)[number];
export type AiBriefTemperature = (typeof AI_BRIEF_TEMPERATURE)[number];

const aiBriefTextListSchema = z.array(z.string().trim().max(2000)).max(50);

export const n8nAiBriefSchema = z.object({
  seriousness: z.enum(AI_BRIEF_SERIOUSNESS),
  seriousness_reason: z.string().trim().max(5000),
  temperature: z.enum(AI_BRIEF_TEMPERATURE),
  score: z.number().finite(),
  summary: z.string().trim().max(10000),
  key_findings: aiBriefTextListSchema,
  likely_specialty: z.string().trim().max(200),
  suggested_hospitals: aiBriefTextListSchema,
  missing_info: aiBriefTextListSchema,
  talking_points: aiBriefTextListSchema,
  questions_to_ask: aiBriefTextListSchema,
  red_flags: aiBriefTextListSchema,
  residence_confirmed: z.boolean(),
  language: z.enum(["ar", "en"]),
  generated_at: z.string().datetime({ offset: true }),
});

function isIpAddressLiteral(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
}

export function isSafeExternalAttachmentUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    const blockedSuffixes = [".localhost", ".local", ".internal", ".test", ".invalid", ".example"];
    if (
      url.protocol !== "https:" ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      (url.port.length > 0 && url.port !== "443") ||
      !hostname.includes(".") ||
      hostname === "localhost" ||
      isIpAddressLiteral(hostname) ||
      blockedSuffixes.some((suffix) => hostname.endsWith(suffix))
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const secureAttachmentUrlSchema = z
  .string()
  .max(2048)
  .url()
  .refine(isSafeExternalAttachmentUrl, "Attachment URLs must use a public HTTPS URL.");

export const n8nLeadSchema = z.object({
  source: z.enum(N8N_LEAD_SOURCES),
  external_id: z.string().trim().min(1).max(255),
  name: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email().max(200).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  message_text: z.string().max(20_000).nullable().optional(),
  ai_brief: n8nAiBriefSchema.optional(),
  attachments: z
    .array(z.object({ url: secureAttachmentUrlSchema, type: z.string().trim().min(1).max(100) }))
    .max(20)
    .default([]),
  raw_payload: z.record(z.string(), z.unknown()).default({}),
  received_at: z.string().datetime({ offset: true }),
});

export type N8nLeadPayload = z.infer<typeof n8nLeadSchema>;

export const N8N_SOURCE_TO_INTAKE_CHANNEL: Record<N8nLeadSource, IntakeChannel> = {
  instagram: "instagram",
  facebook: "facebook",
  whatsapp: "whatsapp",
  website: "website",
  lead_ad: "lead_ad",
  email: "email",
};

export const N8N_SOURCE_TO_LEAD_SOURCE: Record<N8nLeadSource, LeadSource> = {
  instagram: "instagram",
  facebook: "facebook",
  whatsapp: "whatsapp",
  website: "website",
  lead_ad: "lead_ad",
  email: "email",
};

const COUNTRY_CALLING_CODES: Record<string, string> = {
  AE: "971",
  "UNITED ARAB EMIRATES": "971",
  UAE: "971",
  SA: "966",
  "SAUDI ARABIA": "966",
  KSA: "966",
  QA: "974",
  QATAR: "974",
  KW: "965",
  KUWAIT: "965",
  BH: "973",
  BAHRAIN: "973",
  OM: "968",
  OMAN: "968",
  IN: "91",
  INDIA: "91",
  PK: "92",
  PAKISTAN: "92",
  BD: "880",
  BANGLADESH: "880",
  NP: "977",
  NEPAL: "977",
  LK: "94",
  "SRI LANKA": "94",
  GB: "44",
  UK: "44",
  "UNITED KINGDOM": "44",
  US: "1",
  USA: "1",
  "UNITED STATES": "1",
  CA: "1",
  CANADA: "1",
  AU: "61",
  AUSTRALIA: "61",
  DE: "49",
  GERMANY: "49",
  FR: "33",
  FRANCE: "33",
  IT: "39",
  ITALY: "39",
  ES: "34",
  SPAIN: "34",
  NL: "31",
  NETHERLANDS: "31",
  SG: "65",
  SINGAPORE: "65",
  MY: "60",
  MALAYSIA: "60",
  NG: "234",
  NIGERIA: "234",
  ZA: "27",
  "SOUTH AFRICA": "27",
};

function validE164(digits: string): boolean {
  return digits.length >= 8 && digits.length <= 15 && /^[1-9]\d+$/.test(digits);
}

export function normalizePhoneToE164(
  phone: string | null | undefined,
  country: string | null | undefined,
): string | null {
  if (!phone?.trim()) return null;

  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  let internationalDigits: string | null = null;
  if (trimmed.startsWith("+")) {
    internationalDigits = digits;
  } else if (trimmed.startsWith("00")) {
    internationalDigits = digits.slice(2);
  } else if (trimmed.startsWith("011")) {
    internationalDigits = digits.slice(3);
  } else {
    const countryKey = (country ?? "").trim().replace(/[._-]+/g, " ").toUpperCase();
    const callingCode = COUNTRY_CALLING_CODES[countryKey];
    if (!callingCode) return null;

    const nationalDigits = digits.startsWith(callingCode) && digits.length > callingCode.length + 6
      ? digits
      : digits.replace(/^0+/, "");
    internationalDigits = nationalDigits.startsWith(callingCode)
      ? nationalDigits
      : `${callingCode}${nationalDigits}`;
  }

  return validE164(internationalDigits) ? `+${internationalDigits}` : null;
}

export function intakeSecretMatches(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const encoder = new TextEncoder();
  const providedBytes = encoder.encode(provided);
  const expectedBytes = encoder.encode(expected);
  let difference = providedBytes.length ^ expectedBytes.length;
  const length = Math.max(providedBytes.length, expectedBytes.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (providedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }
  return difference === 0;
}

export type LeadIdentityCandidate = {
  lead_id: string;
  source: string;
  external_id: string;
  normalized_phone: string | null;
};

export function findDuplicateLead(
  candidates: LeadIdentityCandidate[],
  source: N8nLeadSource,
  externalId: string,
  normalizedPhone: string | null,
): string | null {
  const senderMatch = candidates.find(
    (candidate) => candidate.source === source && candidate.external_id === externalId,
  );
  if (senderMatch) return senderMatch.lead_id;

  if (!normalizedPhone) return null;
  return candidates.find((candidate) => candidate.normalized_phone === normalizedPhone)?.lead_id ?? null;
}

export function newLeadCaseFields(source: N8nLeadSource, receivedAt: string) {
  return {
    status: "new" as const,
    workflow_stage: "lead_captured" as const,
    urgency: "medium" as const,
    decision_status: "pending" as const,
    lead_source: N8N_SOURCE_TO_LEAD_SOURCE[source],
    coordinator_id: null,
    enquiry_date: new Date(receivedAt).toISOString().slice(0, 10),
    is_demo: false,
  };
}

export type AiBriefPrioritizedLead = {
  aiSeriousness: AiBriefSeriousness | null;
  aiTemperature: AiBriefTemperature | null;
  createdAt: string;
};

export function sortLeadsByAiBrief<T extends AiBriefPrioritizedLead>(leads: readonly T[]): T[] {
  const seriousnessRank: Record<AiBriefSeriousness, number> = {
    critical: 4,
    high: 3,
    moderate: 2,
    low: 1,
  };
  const temperatureRank: Record<AiBriefTemperature, number> = { hot: 2, warm: 1, cold: 0 };
  const rank = (lead: AiBriefPrioritizedLead) => {
    if (!lead.aiSeriousness || !lead.aiTemperature) return -1;
    if (lead.aiSeriousness === "critical" && lead.aiTemperature === "hot") return 100;
    return seriousnessRank[lead.aiSeriousness] * 3 + temperatureRank[lead.aiTemperature];
  };

  return [...leads].sort((left, right) => {
    const rankDifference = rank(right) - rank(left);
    if (rankDifference !== 0) return rankDifference;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}