/**
 * Server-only AI helpers for the lead intake engine.
 * All calls go through the Lovable AI Gateway with LOVABLE_API_KEY, which never
 * leaves the server. Every helper returns `null` (never fabricated data) when AI
 * is unavailable, so intake still records the genuine enquiry.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const TEXT_MODEL = "google/gemini-3.8-flash";
const TRANSCRIBE_MODEL = "google/gemini-3.5-transcribe";

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AiGatewayError";
  }
}

export function aiKey(): string | null {
  return process.env["LOVABLE_API_KEY"] ?? null;
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

async function chatJson(
  system: string,
  content: string | ContentPart[],
): Promise<{ data: unknown; model: string } | null> {
  const key = aiKey();
  if (!key) return null;

  const response = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AiGatewayError(response.status, detail.slice(0, 500) || response.statusText);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content ?? "";
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  if (!cleaned) return null;
  try {
    return { data: JSON.parse(cleaned) as unknown, model: TEXT_MODEL };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  1. Enquiry extraction (text messages + voice transcripts)          */
/* ------------------------------------------------------------------ */

export type ExtractedField = {
  field: string;
  value: string;
  quote?: string;
  confidence?: number;
};

const EXTRACTION_SYSTEM = `You are a medical-tourism enquiry parser for a healthcare CRM.
Extract ONLY information that is explicitly stated in the patient's message.
NEVER guess, infer, complete, translate-into-diagnosis or normalise missing data.
If a field is not stated, omit it entirely. Do not diagnose. Do not infer a medical
condition from tone, emotion, urgency words, treatment names, medicines or hospitals.

Allowed field keys:
patient_name, phone_number, whatsapp_number, country, city, language, age, gender,
condition, treatment_requested, symptoms, current_issue, previous_treatment,
preferred_hospital, preferred_doctor, preferred_treatment_location,
expected_timeframe, stated_urgency, other_information.

Return strict JSON:
{"fields":[{"field":"<key>","value":"<verbatim or lightly cleaned value>","quote":"<exact supporting text from the message>","confidence":0.0-1.0}],
 "is_genuine_enquiry": true|false,
 "language_detected": "<language name or null>"}`;

export async function extractEnquiryFields(text: string): Promise<{
  fields: ExtractedField[];
  isGenuineEnquiry: boolean;
  languageDetected: string | null;
  model: string;
} | null> {
  if (!text.trim()) return null;
  const result = await chatJson(EXTRACTION_SYSTEM, `Patient message:\n"""\n${text.slice(0, 12000)}\n"""`);
  if (!result) return null;
  const data = result.data as {
    fields?: ExtractedField[];
    is_genuine_enquiry?: boolean;
    language_detected?: string | null;
  };
  return {
    fields: Array.isArray(data.fields) ? data.fields.filter((f) => f?.field && f?.value) : [],
    isGenuineEnquiry: data.is_genuine_enquiry !== false,
    languageDetected: data.language_detected ?? null,
    model: result.model,
  };
}

/* ------------------------------------------------------------------ */
/*  2. Voice transcription                                             */
/* ------------------------------------------------------------------ */

export async function transcribeAudio(
  bytes: Uint8Array,
  mimeType: string,
  fileName = "voice-note",
): Promise<{ transcript: string; model: string } | null> {
  const key = aiKey();
  if (!key) return null;

  const ext =
    ({
      "audio/wav": "wav",
      "audio/x-wav": "wav",
      "audio/mpeg": "mp3",
      "audio/mp3": "mp3",
      "audio/mp4": "mp4",
      "audio/m4a": "m4a",
      "audio/webm": "webm",
      "audio/ogg": "ogg",
    } as Record<string, string>)[mimeType.split(";")[0]] ?? "mp3";

  const form = new FormData();
  form.append("model", TRANSCRIBE_MODEL);
  form.append("file", new Blob([bytes as unknown as BlobPart], { type: mimeType }), `${fileName}.${ext}`);

  const response = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AiGatewayError(response.status, detail.slice(0, 500) || response.statusText);
  }

  const payload = (await response.json()) as { text?: string };
  const transcript = (payload.text ?? "").trim();
  if (!transcript) return null;
  return { transcript, model: TRANSCRIBE_MODEL };
}

/* ------------------------------------------------------------------ */
/*  3. Medical document extraction                                     */
/* ------------------------------------------------------------------ */

export type DocumentProcessorKey =
  | "medical_report"
  | "discharge_summary"
  | "prescription"
  | "lab_report"
  | "pathology_report"
  | "radiology_report"
  | "other";

const DOC_SCHEMAS: Record<DocumentProcessorKey, string> = {
  medical_report: `patient:{name,age,gender,location}, clinical:{diagnosed_condition,specialty,current_issue,symptoms,duration,investigation_results,key_findings,previous_treatment,previous_procedure,current_treatment,current_medications,recommended_treatment,recommended_procedure,recommended_specialty}, current_care:{hospital,doctor,city,institution,referral_information}, document:{document_type,hospital,doctor,report_date,procedure_date,key_findings,impression,recommendations}`,
  discharge_summary: `document:{document_type,hospital,doctor,report_date}, discharge:{admission_date,discharge_date,primary_diagnosis,secondary_diagnoses,procedures_performed,hospital_course,discharge_medications,follow_up_recommendations,treating_doctor,hospital}`,
  prescription: `prescription:{doctor,hospital,prescription_date,medicines:[{name,dosage,frequency,duration,instructions}],instructions,diagnosis_if_explicitly_stated}`,
  lab_report: `investigation:{test_type,test_date,facility,doctor,key_findings,impression,results:[{parameter,value,unit,reference_range}]}`,
  pathology_report: `investigation:{test_type,test_date,facility,doctor,key_findings,impression,results:[{parameter,value,unit,reference_range}]}`,
  radiology_report: `investigation:{test_type,test_date,facility,doctor,key_findings,impression,results:[{parameter,value,unit,reference_range}]}`,
  other: `document:{document_type,issuer,date,summary}`,
};

const DOC_SYSTEM = `You are a clinical document extractor for a medical-tourism CRM.
Extract ONLY information explicitly present in the document. If a field is absent, use null.
NEVER infer a diagnosis from a medicine, procedure, department or hospital name.
NEVER add clinical interpretation of your own. Copy values as written in the document.
Return strict JSON with this shape (unknown fields must be null):
{"document_type":"<detected type or null>","extraction":{ ... },"evidence":[{"field":"<dot.path>","quote":"<exact text from the document>"}],"confidence":0.0-1.0}`;

export async function extractDocument(params: {
  processor: DocumentProcessorKey;
  mimeType: string;
  base64: string;
  fileName?: string;
}): Promise<{
  documentType: string | null;
  extraction: Record<string, unknown>;
  evidence: Array<{ field: string; quote: string }>;
  confidence: number | null;
  model: string;
} | null> {
  const dataUrl = `data:${params.mimeType};base64,${params.base64}`;
  const instruction = `Expected structure for a ${params.processor.replace(/_/g, " ")}: ${DOC_SCHEMAS[params.processor]}`;

  const parts: ContentPart[] = [{ type: "text", text: instruction }];
  if (params.mimeType.startsWith("image/")) {
    parts.push({ type: "image_url", image_url: { url: dataUrl } });
  } else {
    parts.push({
      type: "file",
      file: { filename: params.fileName ?? "document.pdf", file_data: dataUrl },
    });
  }

  const result = await chatJson(DOC_SYSTEM, parts);
  if (!result) return null;
  const data = result.data as {
    document_type?: string | null;
    extraction?: Record<string, unknown>;
    evidence?: Array<{ field: string; quote: string }>;
    confidence?: number | null;
  };
  return {
    documentType: data.document_type ?? null,
    extraction: data.extraction ?? {},
    evidence: Array.isArray(data.evidence) ? data.evidence : [],
    confidence: typeof data.confidence === "number" ? data.confidence : null,
    model: result.model,
  };
}

/* ------------------------------------------------------------------ */
/*  4. Triage recommendation + lead summary + next best action         */
/* ------------------------------------------------------------------ */

const TRIAGE_SYSTEM = `You are an AI triage assistant for a medical-tourism coordination team.
You do NOT diagnose and you do NOT replace a doctor. You produce a routing recommendation only,
which a human must review.

Rules:
- Base the recommendation on documented clinical evidence, not on urgent wording, tone,
  emotion, channel (WhatsApp/ad), or the fact that a voice note was sent.
- If the evidence is thin, recommend "low" or "medium" and say what is missing.
- Cite the evidence you used and where it came from.

Return strict JSON:
{"recommended_priority":"low|medium|high|critical",
 "reason":"<one or two sentences, no diagnosis>",
 "evidence":[{"summary":"<what supported this>","source":"<patient_message|voice_transcript|medical_report|discharge_summary|lab_report|pathology_report|radiology_report|existing_record|doctor_opinion|hospital_opinion>"}],
 "confidence":0.0-1.0,
 "summary":"<concise lead summary: who the patient is, where from, what they seek, condition only if actually known, documents available>",
 "missing_information":["..."],
 "next_best_action":"<one operational action for the coordinator>"}`;

export async function assessLead(context: string): Promise<{
  priority: "low" | "medium" | "high" | "critical" | null;
  reason: string | null;
  evidence: Array<{ summary: string; source: string }>;
  confidence: number | null;
  summary: string | null;
  missingInformation: string[];
  nextBestAction: string | null;
  model: string;
} | null> {
  const result = await chatJson(TRIAGE_SYSTEM, context.slice(0, 20000));
  if (!result) return null;
  const data = result.data as {
    recommended_priority?: string;
    reason?: string;
    evidence?: Array<{ summary: string; source: string }>;
    confidence?: number;
    summary?: string;
    missing_information?: string[];
    next_best_action?: string;
  };
  const allowed = ["low", "medium", "high", "critical"] as const;
  const priority = allowed.includes(data.recommended_priority as (typeof allowed)[number])
    ? (data.recommended_priority as (typeof allowed)[number])
    : null;
  return {
    priority,
    reason: data.reason ?? null,
    evidence: Array.isArray(data.evidence) ? data.evidence : [],
    confidence: typeof data.confidence === "number" ? data.confidence : null,
    summary: data.summary ?? null,
    missingInformation: Array.isArray(data.missing_information) ? data.missing_information : [],
    nextBestAction: data.next_best_action ?? null,
    model: result.model,
  };
}
