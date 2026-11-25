import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  findDuplicateLead,
  isSafeExternalAttachmentUrl,
  intakeSecretMatches,
  normalizePhoneToE164,
  n8nLeadSchema,
  newLeadCaseFields,
  type N8nLeadSource,
} from "./n8n";

type AdminClient = SupabaseClient<Database>;

const MAX_BODY_BYTES = 2_000_000;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 30 * 1024 * 1024;
const REPORT_BUCKET = "patient-intake";

const MIME_EXTENSIONS = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/tiff": "tif",
  "text/plain": "txt",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
} as const;

type SupportedMimeType = keyof typeof MIME_EXTENSIONS;
type PreparedAttachment = {
  attachmentType: string;
  fileName: string;
  mimeType: SupportedMimeType;
  bytes: Uint8Array;
  sourceUrl: string;
};

function supportedMimeType(value: string | null): SupportedMimeType | null {
  const normalized = value?.split(";")[0]?.trim().toLowerCase();
  if (!normalized || !Object.prototype.hasOwnProperty.call(MIME_EXTENSIONS, normalized)) return null;
  return normalized as SupportedMimeType;
}

function mimeTypeForExtension(extension: string): SupportedMimeType | null {
  const normalized = extension.replace(/^\./, "").toLowerCase();
  const match = Object.entries(MIME_EXTENSIONS).find(([, value]) => value === normalized)?.[0];
  return supportedMimeType(match ?? null);
}

function attachmentFileName(urlValue: string, mimeType: SupportedMimeType): string {
  const url = new URL(urlValue);
  const lastPathSegment = url.pathname.split("/").filter(Boolean).pop() ?? "report";
  let decodedName = lastPathSegment;
  try {
    decodedName = decodeURIComponent(lastPathSegment);
  } catch {
    decodedName = lastPathSegment;
  }
  const stem = decodedName
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "report";
  return `${stem}.${MIME_EXTENSIONS[mimeType]}`;
}

async function readBoundedResponse(response: Response): Promise<Uint8Array> {
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_ATTACHMENT_BYTES) {
    throw new Error("Attachment exceeds the per-file limit.");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Attachment response has no file body.");
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_ATTACHMENT_BYTES) {
        await reader.cancel();
        throw new Error("Attachment exceeds the per-file limit.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  if (body.byteLength === 0) throw new Error("Attachment is empty.");
  return body;
}

async function prepareAttachments(
  attachments: Array<{ url: string; type: string }>,
): Promise<PreparedAttachment[]> {
  const prepared: PreparedAttachment[] = [];
  let totalBytes = 0;

  for (const attachment of attachments) {
    if (!isSafeExternalAttachmentUrl(attachment.url)) {
      throw new Error("Attachment URL is not allowed.");
    }
    const response = await fetch(attachment.url, {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: { accept: Object.keys(MIME_EXTENSIONS).join(", ") },
    });
    if (!response.ok) throw new Error("Attachment could not be fetched.");

    const responseType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? null;
    let mimeType = supportedMimeType(responseType);
    if (!mimeType) {
      if (responseType && responseType !== "application/octet-stream" && responseType !== "binary/octet-stream") {
        throw new Error("Attachment file type is not supported.");
      }
      const declaredType = supportedMimeType(attachment.type);
      const extensionType = mimeTypeForExtension(new URL(attachment.url).pathname.split(".").pop() ?? "");
      mimeType = declaredType ?? extensionType;
    }
    if (!mimeType) throw new Error("Attachment file type is not supported.");

    const bytes = await readBoundedResponse(response);
    totalBytes += bytes.byteLength;
    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
      throw new Error("Attachments exceed the total request limit.");
    }
    prepared.push({
      attachmentType: attachment.type,
      fileName: attachmentFileName(attachment.url, mimeType),
      mimeType,
      bytes,
      sourceUrl: attachment.url,
    });
  }

  return prepared;
}

async function persistAttachments(
  admin: AdminClient,
  leadId: string,
  source: N8nLeadSource,
  externalId: string,
  attachments: PreparedAttachment[],
): Promise<void> {
  for (const attachment of attachments) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${source}\u0000${externalId}\u0000${attachment.sourceUrl}`),
    );
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const storagePath = `n8n-reports/${leadId}/${hash}.${MIME_EXTENSIONS[attachment.mimeType]}`;
    const { error: uploadError } = await admin.storage.from(REPORT_BUCKET).upload(storagePath, attachment.bytes, {
      contentType: attachment.mimeType,
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { error: metadataError } = await admin.from("lead_intake_attachments").upsert(
      {
        lead_id: leadId,
        source,
        external_id: externalId,
        attachment_type: attachment.attachmentType,
        file_name: attachment.fileName,
        mime_type: attachment.mimeType,
        size_bytes: attachment.bytes.byteLength,
        storage_path: storagePath,
      },
      { onConflict: "storage_path" },
    );
    if (metadataError) throw metadataError;
  }
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

async function findMessageLead(
  admin: AdminClient,
  source: string,
  externalId: string,
  normalizedPhone: string | null,
): Promise<string | null> {
  const select = "lead_id, source, external_id, normalized_phone";
  const senderResult = await admin
    .from("lead_messages")
    .select(select)
    .eq("source", source)
    .eq("external_id", externalId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (senderResult.error) throw senderResult.error;

  const phoneResult = normalizedPhone
    ? await admin
        .from("lead_messages")
        .select(select)
        .eq("normalized_phone", normalizedPhone)
        .order("created_at", { ascending: false })
        .limit(1)
    : null;
  if (phoneResult?.error) throw phoneResult.error;

  return findDuplicateLead(
    [...(senderResult.data ?? []), ...(phoneResult?.data ?? [])],
    source as N8nLeadSource,
    externalId,
    normalizedPhone,
  );
}

async function findExistingContact(
  admin: AdminClient,
  phone: string | null | undefined,
  country: string | null | undefined,
): Promise<{ personId: string; leadId: string | null } | null> {
  const normalizedPhone = normalizePhoneToE164(phone, country);
  if (!normalizedPhone) return null;

  const suffix = normalizedPhone.replace(/\D/g, "").slice(-4);
  const { data: people, error } = await admin
    .from("persons")
    .select("id, primary_phone, whatsapp_number, country_of_residence")
    .or(`primary_phone.ilike.%${suffix},whatsapp_number.ilike.%${suffix}`)
    .is("deleted_at", null)
    .limit(1000);
  if (error) throw error;

  const person = (people ?? []).find((candidate) =>
    [candidate.primary_phone, candidate.whatsapp_number].some(
      (candidatePhone) =>
        normalizePhoneToE164(candidatePhone, candidate.country_of_residence) === normalizedPhone,
    ),
  );
  if (!person) return null;

  const { data: activeCase, error: activeError } = await admin
    .from("cases")
    .select("id")
    .eq("person_id", person.id)
    .is("deleted_at", null)
    .not("status", "in", "(completed,cancelled,lost)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (activeError) throw activeError;
  if (activeCase) return { personId: person.id, leadId: activeCase.id };

  const { data: latestCase, error: latestError } = await admin
    .from("cases")
    .select("id")
    .eq("person_id", person.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw latestError;

  return { personId: person.id, leadId: latestCase?.id ?? null };
}

export async function handleN8nLeadIntake(request: Request): Promise<Response> {
  const expectedKey = process.env["RIAYAH_INTAKE_KEY"];
  const suppliedKey = request.headers.get("x-riayah-intake-key");
  if (!intakeSecretMatches(suppliedKey, expectedKey)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ error: "Payload too large" }, 413);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = n8nLeadSchema.safeParse(parsedJson);
  if (!parsed.success) return json({ error: "Invalid intake payload" }, 400);
  const payload = parsed.data;
  const normalizedPhone = normalizePhoneToE164(payload.phone, payload.country);

  try {
    const preparedAttachments = await prepareAttachments(payload.attachments);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as AdminClient;
    const [messageLeadId, contactMatch] = await Promise.all([
      findMessageLead(admin, payload.source, payload.external_id, normalizedPhone),
      findExistingContact(admin, payload.phone, payload.country),
    ]);

    const existingLeadId = messageLeadId ?? contactMatch?.leadId ?? null;
    const existingPersonId = contactMatch?.personId ?? null;
    const { data, error } = await admin.rpc("create_n8n_lead_message_with_ai_brief", {
      p_source: payload.source,
      p_external_id: payload.external_id,
      p_received_at: payload.received_at,
      p_attachments: toJson([]),
      p_raw_payload: toJson(payload.raw_payload),
      p_new_case_fields: toJson(newLeadCaseFields(payload.source, payload.received_at)),
      p_ai_brief: payload.ai_brief ? toJson(payload.ai_brief) : null,
      ...(normalizedPhone ? { p_normalized_phone: normalizedPhone } : {}),
      ...(existingLeadId ? { p_existing_lead_id: existingLeadId } : {}),
      ...(existingPersonId ? { p_existing_person_id: existingPersonId } : {}),
      ...(payload.name ? { p_name: payload.name } : {}),
      ...(payload.phone ? { p_phone: payload.phone } : {}),
      ...(payload.email ? { p_email: payload.email } : {}),
      ...(payload.country ? { p_country: payload.country } : {}),
      ...(payload.message_text ? { p_message_text: payload.message_text } : {}),
    });
    if (error) throw error;

    const result = data?.[0];
    if (!result) return json({ error: "Intake could not be completed" }, 500);
    await persistAttachments(admin, result.lead_id, payload.source, payload.external_id, preparedAttachments);
    return json({ lead_id: result.lead_id, created: result.created });
  } catch {
    console.error("[api/intake/lead] Intake processing failed.");
    return json({ error: "Intake could not be completed" }, 500);
  }
}