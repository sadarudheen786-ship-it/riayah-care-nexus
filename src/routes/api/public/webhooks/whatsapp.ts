/**
 * Meta WhatsApp Cloud API webhook.
 * Incoming patient messages (text, media and voice notes) are routed through the
 * central lead intake pipeline — the same one used by the website, Messenger,
 * Instagram and lead ads. Delivery/read statuses update the conversation history.
 */

import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { ingestIntakeEvent } from "@/lib/intake/pipeline.server";
import { verifyMetaSignature } from "@/lib/intake/security.server";
import type { IntakeMedia } from "@/lib/intake/types";

const PROVIDER = "meta_whatsapp";
const MAX_BODY_BYTES = 1_000_000;
const MAX_MEDIA_BYTES = 20_000_000;

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  image?: { caption?: string; id?: string; mime_type?: string };
  video?: { caption?: string; id?: string; mime_type?: string };
  document?: { caption?: string; filename?: string; id?: string; mime_type?: string };
  audio?: { id?: string; mime_type?: string; voice?: boolean };
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
  contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
};

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{ changes?: Array<{ value?: WhatsAppChangeValue }> }>;
};

type AdminClient = SupabaseClient<Database>;

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

function toJson(value: object): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function timestampToIso(timestamp: string | undefined) {
  if (!timestamp) return new Date().toISOString();
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}

function messageText(message: WhatsAppMessage): string | null {
  if (message.type === "text") return message.text?.body ?? null;
  if (message.type === "image") return message.image?.caption ?? null;
  if (message.type === "video") return message.video?.caption ?? null;
  if (message.type === "document") return message.document?.caption ?? message.document?.filename ?? null;
  return null;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

/** Downloads WhatsApp media using the server-side access token. */
async function downloadMedia(
  mediaId: string,
  kind: IntakeMedia["kind"],
  fallbackMime: string,
): Promise<IntakeMedia | null> {
  const token = process.env["WHATSAPP_ACCESS_TOKEN"];
  if (!token) return null;

  const metaResponse = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaResponse.ok) return null;
  const meta = (await metaResponse.json()) as { url?: string; mime_type?: string; file_size?: number };
  if (!meta.url) return null;
  if (meta.file_size && meta.file_size > MAX_MEDIA_BYTES) return null;

  const fileResponse = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
  if (!fileResponse.ok) return null;
  const bytes = new Uint8Array(await fileResponse.arrayBuffer());
  if (bytes.byteLength > MAX_MEDIA_BYTES) return null;

  return {
    base64: bytesToBase64(bytes),
    mimeType: meta.mime_type ?? fallbackMime,
    kind,
  };
}

async function resolveMedia(message: WhatsAppMessage): Promise<IntakeMedia | null> {
  if (message.type === "audio" && message.audio?.id) {
    return downloadMedia(message.audio.id, "audio", message.audio.mime_type ?? "audio/ogg");
  }
  if (message.type === "image" && message.image?.id) {
    return downloadMedia(message.image.id, "image", message.image.mime_type ?? "image/jpeg");
  }
  if (message.type === "document" && message.document?.id) {
    const media = await downloadMedia(
      message.document.id,
      "document",
      message.document.mime_type ?? "application/pdf",
    );
    return media ? { ...media, fileName: message.document.filename } : null;
  }
  return null;
}

async function handleStatus(admin: AdminClient, status: WhatsAppStatus) {
  if (!status.id || !status.status) return;
  const { error } = await admin
    .from("communications")
    .update({
      provider: PROVIDER,
      message_status: status.status,
      status_updated_at: timestampToIso(status.timestamp),
      provider_payload: toJson(status),
    })
    .eq("provider", PROVIDER)
    .eq("external_message_id", status.id);
  if (error) throw error;
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

        const rawBody = await request.text();
        if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
          return json({ error: "Payload too large" }, 413);
        }

        // When META_APP_SECRET is configured the signature must be valid.
        const signature = await verifyMetaSignature(request, rawBody);
        if (signature === "invalid") return json({ error: "Invalid signature" }, 401);

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
        const admin = supabaseAdmin as AdminClient;
        let processedMessages = 0;
        let processedStatuses = 0;

        for (const entry of payload.entry) {
          for (const change of entry.changes ?? []) {
            const value = change.value;
            if (value?.metadata?.phone_number_id !== phoneNumberId) continue;

            for (const message of value.messages ?? []) {
              if (!message.id || !message.from) continue;
              const profileName = value.contacts?.find((c) => c.wa_id === message.from)?.profile?.name;
              const media = await resolveMedia(message);

              await ingestIntakeEvent({
                channel: "whatsapp",
                provider: PROVIDER,
                externalEventId: message.id,
                receivedAt: timestampToIso(message.timestamp),
                contact: {
                  name: profileName ?? null,
                  phone: message.from,
                  whatsapp: message.from,
                },
                message: messageText(message),
                media,
                rawPayload: message,
              });
              processedMessages += 1;
            }

            for (const status of value.statuses ?? []) {
              await handleStatus(admin, status);
              processedStatuses += 1;
            }
          }
        }

        return json({ ok: true, processedMessages, processedStatuses });
      },
    },
  },
});
