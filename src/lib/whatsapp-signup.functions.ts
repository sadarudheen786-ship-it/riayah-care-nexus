/**
 * Server functions supporting Meta WhatsApp Embedded Signup (coexistence).
 * Reads existing secure credentials only — never modifies the stored
 * access token, phone number id, verify token, webhook or WABA subscription.
 * No secret value is ever returned to the browser.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GRAPH = "https://graph.facebook.com/v21.0";

export const META_APP_ID = "1430131428995420";
export const META_SIGNUP_CONFIG_ID = "1852419245741870";

type PhoneInfo = {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
  platform_type?: string;
  status?: string;
  code_verification_status?: string;
};

const signupInput = z.object({
  code: z.string().min(4).optional(),
  wabaId: z.string().min(3).optional(),
  phoneNumberId: z.string().min(3).optional(),
});

/**
 * Called after the Embedded Signup dialog completes.
 * Optionally exchanges the returned code for a business token when
 * META_APP_SECRET is configured, then reports the current state of the WABA
 * and phone number using the existing stored access token.
 */
export const completeWhatsAppSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => signupInput.parse(input))
  .handler(async ({ data }) => {
    const appSecret = process.env["META_APP_SECRET"];
    const accessToken = process.env["WHATSAPP_ACCESS_TOKEN"];

    let exchange: { ok: boolean; message: string } = {
      ok: false,
      message:
        "Signup code received. Token exchange is skipped because no Meta app secret is configured; the existing system-user token continues to be used.",
    };

    if (data.code && appSecret) {
      const url =
        `${GRAPH}/oauth/access_token?client_id=${META_APP_ID}` +
        `&client_secret=${encodeURIComponent(appSecret)}` +
        `&code=${encodeURIComponent(data.code)}`;
      const res = await fetch(url);
      const body = (await res.json()) as { access_token?: string; error?: { message?: string } };
      exchange = res.ok && body.access_token
        ? { ok: true, message: "Meta returned a business access token for this signup." }
        : {
            ok: false,
            message: body.error?.message ?? "Meta rejected the signup code exchange.",
          };
    }

    let waba: { id?: string; name?: string; status?: string } | null = null;
    let phones: PhoneInfo[] = [];
    let readError: string | null = null;

    if (accessToken && data.wabaId) {
      const auth = { Authorization: `Bearer ${accessToken}` };
      const [wabaRes, phoneRes] = await Promise.all([
        fetch(`${GRAPH}/${data.wabaId}?fields=id,name,account_review_status`, { headers: auth }),
        fetch(
          `${GRAPH}/${data.wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,platform_type,status,code_verification_status`,
          { headers: auth },
        ),
      ]);
      const wabaBody = (await wabaRes.json()) as {
        id?: string;
        name?: string;
        account_review_status?: string;
        error?: { message?: string };
      };
      const phoneBody = (await phoneRes.json()) as {
        data?: PhoneInfo[];
        error?: { message?: string };
      };
      if (wabaRes.ok) {
        waba = { id: wabaBody.id, name: wabaBody.name, status: wabaBody.account_review_status };
      } else {
        readError = wabaBody.error?.message ?? "Unable to read the WhatsApp Business Account.";
      }
      if (phoneRes.ok) phones = phoneBody.data ?? [];
      else readError ??= phoneBody.error?.message ?? "Unable to read phone numbers.";
    }

    return {
      exchange,
      waba,
      phones,
      readError,
      receivedPhoneNumberId: data.phoneNumberId ?? null,
    };
  });

/** Read-only status of the existing WhatsApp configuration (no secret values). */
export const getWhatsAppConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const accessToken = process.env["WHATSAPP_ACCESS_TOKEN"];
    const phoneNumberId = process.env["WHATSAPP_PHONE_NUMBER_ID"];
    const configured = Boolean(accessToken && phoneNumberId);
    if (!configured) {
      return { configured, phone: null as PhoneInfo | null, error: null as string | null };
    }
    const res = await fetch(
      `${GRAPH}/${phoneNumberId}?fields=id,display_phone_number,verified_name,platform_type,status,code_verification_status`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const body = (await res.json()) as PhoneInfo & { error?: { message?: string } };
    if (!res.ok) {
      return { configured, phone: null, error: body.error?.message ?? "Meta request failed." };
    }
    return { configured, phone: body as PhoneInfo, error: null };
  });
