import { createFileRoute } from "@tanstack/react-router";

const PROVIDER = "meta_whatsapp";
const MAX_BODY_BYTES = 1_000_000;

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  image?: { caption?: string };
  video?: { caption?: string };
  document?: { caption?: string; filename?: string };
  audio?: unknown;
  sticker?: unknown;
  location?: unknown;
  contacts?: unknown;
  interactive?: unknown;
};

type WhatsAppStatus = {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
  errors?: unknown;
};

type WhatsAppChangeValue = {
  metadata?: { phone_number_id?: string; display_phone_number?: string };
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
};

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{ value?: WhatsAppChangeValue }>;
  }>;
};

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function normalizePhone(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function messageBody(message: WhatsAppMessage) {
  if (message.type === "text") return message.text?.body ?? null;
  if (message.type === "image") return message.image?.caption ?? "[Image]";
  if (message.type === "video") return message.video?.caption ?? "[Video]";
  if (message.type === "document") {
    return message.document?.caption ?? message.document?.filename ?? "[Document]";
  }
  if (message.type === "audio") return "[Audio]";
  if (message.type === "sticker") return "[Sticker]";
  if (message.type === "location") return "[Location]";
  if (message.type === "contacts") return "[Contact]";
  if (message.type === "interactive") return "[Interactive message]";
  return message.type ? `[${message.type}]` : null;
}

function timestampToIso(timestamp: string | undefined) {
  if (!timestamp) return new Date().toISOString();
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}

async function findPersonAndCase(
  supabaseAdmin: typeof import("@supabase/supabase-js").SupabaseClient,
  phone: string,
) {
  const normalized = normalizePhone(phone);
  if (!normalized) return { personId: null, caseId: null };

  const { data: persons, error: personError } = await supabaseAdmin
    .from("persons")
    .select("id, primary_phone, whatsapp_number")
    .or(`whatsapp_number.ilike.%${normalized},primary_phone.ilike.%${normalized}`)
    .is("deleted_at", null)
    .limit(10);

  if (personError) throw personError;

  const person = (persons ?? []).find(
    (candidate) =>
      normalizePhone(candidate.whatsapp_number) === normalized ||
      normalizePhone(candidate.primary_phone) === normalized,
  );

  if (!person) return { personId: null, caseId: null };

  const { data: latestCase, error: caseError } = await supabaseAdmin
    .from("cases")
    .select("id")
    .eq("person_id", person.id)
    .is("deleted_at", null)
    .order("enquiry_date", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (caseError) throw caseError;
  return { personId: person.id, caseId: latestCase?.id ?? null };
}

async function handleMessage(
  supabaseAdmin: typeof import("@supabase/supabase-js").SupabaseClient,
  message: WhatsAppMessage,
  displayPhoneNumber: string | null,
) {
  if (!message.id || !message.from) return;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("communications")
    .select("id")
    .eq("provider", PROVIDER)
    .eq("external_message_id", message.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return;

  const { personId, caseId } = await findPersonAndCase(supabaseAdmin, message.from);

  const { error } = await supabaseAdmin.from("communications").insert({
    case_id: caseId,
    person_id: personId,
    channel: "whatsapp",
    direction: "incoming",
    body: messageBody(message),
    subject: "WhatsApp message",
    from_identifier: message.from,
    to_identifier: displayPhoneNumber,
    external_message_id: message.id,
    occurred_at: timestampToIso(message.timestamp),
    provider: PROVIDER,
    provider_message_type: message.type ?? "unknown",
    provider_payload: message,
  });

  if (error) throw error;
}

async function handleStatus(
  supabaseAdmin: typeof import("@supabase/supabase-js").SupabaseClient,
  status: WhatsAppStatus,
) {
  if (!status.id || !status.status) return;

  const statusPayload = {
    provider: PROVIDER,
    provider_message_type: "status",
    message_status: status.status,
    status_updated_at: timestampToIso(status.timestamp),
    provider_payload: status,
  };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("communications")
    .update(statusPayload)
    .eq("provider", PROVIDER)
    .eq("external_message_id", status.id)
    .select("id")
    .limit(1);

  if (updateError) throw updateError;
  if (updated && updated.length > 0) return;

  const { personId, caseId } = await findPersonAndCase(
    supabaseAdmin,
    status.recipient_id ?? "",
  );

  const { error: insertError } = await supabaseAdmin.from("communications").insert({
    case_id: caseId,
    person_id: personId,
    channel: "whatsapp",
    direction: "outgoing",
    subject: "WhatsApp message status",
    to_identifier: status.recipient_id ?? null,
    external_message_id: status.id,
    occurred_at: timestampToIso(status.timestamp),
    ...statusPayload,
  });

  if (insertError) throw insertError;
}

export const Route = createFileRoute("/api/public/webhooks/whatsapp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const verifyToken = process.env["WHATSAPP_VERIFY_TOKEN"];
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (!verifyToken || mode !== "subscribe" || token !== verifyToken || !challenge) {
          return new Response("Forbidden", { status: 403 });
        }

        return new Response(challenge, {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
      POST: async ({ request }) => {
        const phoneNumberId = process.env["WHATSAPP_PHONE_NUMBER_ID"];
        if (!phoneNumberId) return json({ error: "Webhook is not configured" }, 503);

        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength > MAX_BODY_BYTES) {
          return json({ error: "Payload too large" }, 413);
        }

        const rawBody = await request.text();
        if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
          return json({ error: "Payload too large" }, 413);
        }

        let payload: WhatsAppWebhookPayload;
        try {
          payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        if (payload.object !== "whatsapp_business_account" || !Array.isArray(payload.entry)) {
          return json({ error: "Unsupported webhook payload" }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let processedMessages = 0;
        let processedStatuses = 0;

        for (const entry of payload.entry) {
          for (const change of entry.changes ?? []) {
            const value = change.value;
            if (value?.metadata?.phone_number_id !== phoneNumberId) continue;

            for (const message of value.messages ?? []) {
              await handleMessage(supabaseAdmin, message, value.metadata?.display_phone_number ?? null);
              processedMessages += 1;
            }

            for (const status of value.statuses ?? []) {
              await handleStatus(supabaseAdmin, status);
              processedStatuses += 1;
            }
          }
        }

        return json({ ok: true, processedMessages, processedStatuses });
      },
    },
  },
});