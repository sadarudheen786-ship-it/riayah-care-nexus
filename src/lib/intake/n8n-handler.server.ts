import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  findDuplicateLead,
  intakeSecretMatches,
  normalizePhoneToE164,
  n8nLeadSchema,
  type N8nLeadSource,
} from "./n8n";

type AdminClient = SupabaseClient<Database>;

const MAX_BODY_BYTES = 2_000_000;

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as AdminClient;
    const [messageLeadId, contactMatch] = await Promise.all([
      findMessageLead(admin, payload.source, payload.external_id, normalizedPhone),
      findExistingContact(admin, payload.phone, payload.country),
    ]);

    const existingLeadId = messageLeadId ?? contactMatch?.leadId ?? null;
    const existingPersonId = contactMatch?.personId ?? null;
    const { data, error } = await admin.rpc("create_n8n_lead_message", {
      p_source: payload.source,
      p_external_id: payload.external_id,
      p_received_at: payload.received_at,
      p_attachments: toJson(payload.attachments),
      p_raw_payload: toJson(payload.raw_payload),
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
    return json({ lead_id: result.lead_id, created: result.created });
  } catch {
    console.error("[api/intake/lead] Intake processing failed.");
    return json({ error: "Intake could not be completed" }, 500);
  }
}