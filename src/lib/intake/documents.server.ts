/**
 * Medical document processing. Supported processors extract structured clinical
 * information; unsupported types are still stored and attached, never discarded.
 * Every extracted fact keeps a reference to the originating document.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { AiGatewayError, extractDocument, type DocumentProcessorKey } from "./ai.server";
import { recordFacts } from "./pipeline.server";
import type { EvidenceSource } from "./types";

type Admin = SupabaseClient<Database>;
const BUCKET = "patient-intake";

export const PROCESSOR_BY_DOCUMENT_TYPE: Record<string, DocumentProcessorKey> = {
  medical_report: "medical_report",
  discharge_summary: "discharge_summary",
  prescription: "prescription",
  lab_report: "lab_report",
  pathology_report: "pathology_report",
  radiology_report: "radiology_report",
};

const SOURCE_BY_PROCESSOR: Record<DocumentProcessorKey, EvidenceSource> = {
  medical_report: "medical_report",
  discharge_summary: "discharge_summary",
  prescription: "prescription",
  lab_report: "lab_report",
  pathology_report: "pathology_report",
  radiology_report: "radiology_report",
  other: "other_document",
};

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Flattens a nested extraction object into `a.b.c` → value facts. */
function flatten(value: unknown, prefix = ""): Array<{ key: string; value: string }> {
  const out: Array<{ key: string; value: string }> = [];
  if (value === null || value === undefined || value === "") return out;
  if (Array.isArray(value)) {
    value.forEach((item, index) => out.push(...flatten(item, `${prefix}[${index}]`)));
    return out;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out.push(...flatten(child, prefix ? `${prefix}.${key}` : key));
    }
    return out;
  }
  out.push({ key: prefix, value: String(value) });
  return out;
}

export async function processStoredDocument(params: {
  documentId: string;
  /** Overrides the processor chosen from the document type. */
  processor?: DocumentProcessorKey;
}): Promise<{
  extractionId: string;
  status: Database["public"]["Enums"]["extraction_status"];
  factsRecorded: number;
  conflicts: number;
  message?: string;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as Admin;

  const { data: doc, error: docError } = await admin
    .from("documents")
    .select("id, case_id, person_id, document_type, storage_path, mime_type, title")
    .eq("id", params.documentId)
    .single();
  if (docError) throw docError;

  const processor: DocumentProcessorKey =
    params.processor ?? PROCESSOR_BY_DOCUMENT_TYPE[doc.document_type] ?? "other";

  const { data: extractionRow, error: rowError } = await admin
    .from("document_extractions")
    .insert({
      document_id: doc.id,
      case_id: doc.case_id,
      person_id: doc.person_id,
      processor_key: processor,
      status: processor === "other" ? "unsupported" : "processing",
    })
    .select("id")
    .single();
  if (rowError) throw rowError;

  // Unsupported document types are stored and linked, but not clinically parsed.
  if (processor === "other") {
    return {
      extractionId: extractionRow.id,
      status: "unsupported",
      factsRecorded: 0,
      conflicts: 0,
      message: "Document stored and attached. No specialised medical extraction for this type yet.",
    };
  }

  try {
    const { data: file, error: downloadError } = await admin.storage
      .from(BUCKET)
      .download(doc.storage_path);
    if (downloadError || !file) throw downloadError ?? new Error("Document file not found");

    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await extractDocument({
      processor,
      mimeType: doc.mime_type ?? file.type ?? "application/pdf",
      base64: bytesToBase64(bytes),
      fileName: doc.title,
    });

    if (!result) {
      await admin
        .from("document_extractions")
        .update({ status: "failed", error_message: "AI extraction returned no result" })
        .eq("id", extractionRow.id);
      return {
        extractionId: extractionRow.id,
        status: "failed",
        factsRecorded: 0,
        conflicts: 0,
        message: "Document stored. AI extraction returned no usable result.",
      };
    }

    const quoteFor = (key: string) =>
      result.evidence.find((e) => e.field === key)?.quote ?? null;

    const facts = flatten(result.extraction).map((f) => ({
      fieldKey: f.key,
      value: f.value,
      quote: quoteFor(f.key),
      confidence: result.confidence,
      fieldGroup: processor,
    }));

    let recorded = { inserted: 0, conflicts: 0 };
    if (doc.person_id) {
      recorded = await recordFacts(admin, {
        personId: doc.person_id,
        caseId: doc.case_id,
        intakeEventId: null,
        documentId: doc.id,
        source: SOURCE_BY_PROCESSOR[processor],
        facts,
      });
    }

    await admin
      .from("document_extractions")
      .update({
        status: "completed",
        extraction: toJson(result.extraction),
        detected_document_type: result.documentType,
        model: result.model,
        confidence: result.confidence,
      })
      .eq("id", extractionRow.id);

    await admin.from("ai_intake_audit").insert({
      case_id: doc.case_id,
      person_id: doc.person_id,
      action: "document_extracted",
      input_source: SOURCE_BY_PROCESSOR[processor],
      input_reference: toJson({ document_id: doc.id, storage_path: doc.storage_path }),
      model: result.model,
      output: toJson(result.extraction),
      evidence: toJson(result.evidence),
    });

    return {
      extractionId: extractionRow.id,
      status: "completed",
      factsRecorded: recorded.inserted,
      conflicts: recorded.conflicts,
    };
  } catch (error) {
    const message = error instanceof AiGatewayError ? `${error.status}: ${error.message}` : String(error);
    await admin
      .from("document_extractions")
      .update({ status: "failed", error_message: message.slice(0, 500) })
      .eq("id", extractionRow.id);
    return {
      extractionId: extractionRow.id,
      status: "failed",
      factsRecorded: 0,
      conflicts: 0,
      message: `Document stored. Extraction failed (${message.slice(0, 160)}).`,
    };
  }
}
