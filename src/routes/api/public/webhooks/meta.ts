/**
 * Meta webhook for Facebook Messenger, Instagram Direct and lead-ad forms.
 * Signature-verified with META_APP_SECRET; feeds the same central intake pipeline
 * as WhatsApp and the website. Not connected to a live Meta app until the Meta
 * credentials are configured.
 */

import { createFileRoute } from "@tanstack/react-router";
import { ingestIntakeEvent } from "@/lib/intake/pipeline.server";
import { verifyMetaSignature } from "@/lib/intake/security.server";
import type { IntakeChannel } from "@/lib/intake/types";

const MAX_BODY_BYTES = 1_000_000;

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

type MessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: { mid?: string; text?: string; attachments?: Array<{ type?: string }> };
};

type LeadgenValue = {
  leadgen_id?: string;
  form_id?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  platform?: string;
  created_time?: number;
};

type MetaPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: MessagingEvent[];
    changes?: Array<{ field?: string; value?: LeadgenValue }>;
  }>;
};

/** Fetches a submitted lead-ad form when a page access token is configured. */
async function fetchLeadgen(leadgenId: string) {
  const token = process.env["META_PAGE_ACCESS_TOKEN"];
  if (!token) return null;
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${leadgenId}?fields=field_data,created_time,ad_id,campaign_id,form_id,platform&access_token=${encodeURIComponent(token)}`,
  );
  if (!response.ok) return null;
  return (await response.json()) as {
    field_data?: Array<{ name?: string; values?: string[] }>;
    created_time?: string;
    platform?: string;
  };
}

export const Route = createFileRoute("/api/public/webhooks/meta")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const verifyToken =
          process.env["META_VERIFY_TOKEN"] ?? process.env["WHATSAPP_VERIFY_TOKEN"];
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
        const rawBody = await request.text();
        if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
          return json({ error: "Payload too large" }, 413);
        }

        const signature = await verifyMetaSignature(request, rawBody);
        if (signature !== "valid") {
          return json(
            {
              error:
                signature === "unconfigured"
                  ? "Webhook is not configured (META_APP_SECRET missing)"
                  : "Invalid signature",
            },
            signature === "unconfigured" ? 503 : 401,
          );
        }

        let payload: MetaPayload;
        try {
          payload = JSON.parse(rawBody) as MetaPayload;
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        const objectType = payload.object;
        const baseChannel: IntakeChannel =
          objectType === "instagram" ? "instagram" : objectType === "page" ? "messenger" : "other";

        let processed = 0;

        for (const entry of payload.entry ?? []) {
          for (const event of entry.messaging ?? []) {
            const text = event.message?.text;
            const senderId = event.sender?.id;
            if (!senderId || (!text && !event.message?.attachments?.length)) continue;
            await ingestIntakeEvent({
              channel: baseChannel,
              provider: `meta_${objectType ?? "unknown"}`,
              externalEventId: event.message?.mid ?? null,
              receivedAt: event.timestamp ? new Date(event.timestamp).toISOString() : null,
              contact: { handle: senderId },
              message: text ?? null,
              rawPayload: event,
            });
            processed += 1;
          }

          for (const change of entry.changes ?? []) {
            if (change.field !== "leadgen" || !change.value?.leadgen_id) continue;
            const value = change.value;
            const lead = await fetchLeadgen(value.leadgen_id);
            const fields = new Map(
              (lead?.field_data ?? []).map((f) => [f.name ?? "", f.values?.[0] ?? ""]),
            );
            const channel: IntakeChannel =
              (value.platform ?? lead?.platform) === "ig" ? "instagram_lead_ad" : "facebook_lead_ad";

            await ingestIntakeEvent({
              channel,
              provider: "meta_leadgen",
              externalEventId: value.leadgen_id,
              receivedAt: lead?.created_time ?? null,
              contact: {
                name: fields.get("full_name") ?? fields.get("first_name") ?? null,
                phone: fields.get("phone_number") ?? null,
                whatsapp: fields.get("phone_number") ?? null,
                email: fields.get("email") ?? null,
                country: fields.get("country") ?? null,
              },
              message: lead
                ? Array.from(fields.entries())
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")
                : null,
              attribution: {
                platform: value.platform ?? null,
                campaignId: value.campaign_id ?? null,
                campaignName: value.campaign_name ?? null,
                adsetId: value.adset_id ?? null,
                adsetName: value.adset_name ?? null,
                adId: value.ad_id ?? null,
                adName: value.ad_name ?? null,
                formId: value.form_id ?? null,
              },
              rawPayload: { change, lead_fetched: !!lead },
            });
            processed += 1;
          }
        }

        return json({ ok: true, processed });
      },
    },
  },
});
