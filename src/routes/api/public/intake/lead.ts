/**
 * Central lead capture API — website forms, website chat, advertising lead-form
 * bridges and referral submissions. Authenticated with LEAD_INTAKE_SECRET
 * (HMAC signature or bearer). Never call this from browser code with the secret.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ingestIntakeEvent } from "@/lib/intake/pipeline.server";
import { verifyIntakeCaller } from "@/lib/intake/security.server";

const MAX_BODY_BYTES = 2_000_000;

const bodySchema = z.object({
  channel: z.enum([
    "website",
    "referral",
    "manual",
    "email",
    "facebook_lead_ad",
    "instagram_lead_ad",
    "facebook",
    "instagram",
    "other",
  ]),
  external_event_id: z.string().min(1).max(200).optional(),
  received_at: z.string().datetime().optional(),
  contact: z.object({
    name: z.string().max(200).optional(),
    phone: z.string().max(40).optional(),
    whatsapp: z.string().max(40).optional(),
    email: z.string().email().max(200).optional(),
    handle: z.string().max(200).optional(),
    country: z.string().max(100).optional(),
    language: z.string().max(60).optional(),
  }),
  message: z.string().max(20000).optional(),
  attribution: z
    .object({
      platform: z.string().max(60).optional(),
      campaignName: z.string().max(200).optional(),
      campaignId: z.string().max(100).optional(),
      adsetName: z.string().max(200).optional(),
      adsetId: z.string().max(100).optional(),
      adName: z.string().max(200).optional(),
      adId: z.string().max(100).optional(),
      formId: z.string().max(100).optional(),
      utmSource: z.string().max(200).optional(),
      utmMedium: z.string().max(200).optional(),
      utmCampaign: z.string().max(200).optional(),
      utmContent: z.string().max(200).optional(),
      utmTerm: z.string().max(200).optional(),
      referrerUrl: z.string().max(500).optional(),
      landingUrl: z.string().max(500).optional(),
    })
    .optional(),
  is_demo: z.boolean().optional(),
});

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export const Route = createFileRoute("/api/public/intake/lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
          return json({ error: "Payload too large" }, 413);
        }

        const auth = await verifyIntakeCaller(request, rawBody);
        if (!auth.ok) return json({ error: auth.reason ?? "Unauthorized" }, 401);

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(rawBody);
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        const parsed = bodySchema.safeParse(parsedJson);
        if (!parsed.success) {
          return json({ error: "Validation failed", issues: parsed.error.issues }, 400);
        }
        const body = parsed.data;

        if (!body.contact.phone && !body.contact.whatsapp && !body.contact.email && !body.contact.handle) {
          return json({ error: "At least one contact identifier is required" }, 400);
        }

        try {
          const result = await ingestIntakeEvent({
            channel: body.channel,
            provider: "riayah_intake_api",
            externalEventId: body.external_event_id ?? null,
            receivedAt: body.received_at ?? null,
            contact: body.contact,
            message: body.message ?? null,
            attribution: body.attribution ?? null,
            rawPayload: parsedJson,
            isDemo: body.is_demo === true,
          });
          return json({
            ok: true,
            intake_event_id: result.intakeEventId,
            case_id: result.caseId,
            status: result.status,
            notes: result.notes,
          });
        } catch (error) {
          console.error("[intake/lead] failed", error);
          return json({ error: "Intake failed" }, 500);
        }
      },
    },
  },
});
