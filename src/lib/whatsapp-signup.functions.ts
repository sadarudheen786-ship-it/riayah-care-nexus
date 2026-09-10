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

export type StoredConnection = {
  id: string;
  waba_id: string;
  waba_name: string | null;
  waba_status: string | null;
  phone_number_id: string | null;
  display_phone_number: string | null;
  verified_name: string | null;
  platform_type: string | null;
  phone_status: string | null;
  code_verification_status: string | null;
  coexistence: boolean;
  connection_status: string;
  last_error: string | null;
  connected_at: string;
  last_synced_at: string;
};

const signupInput = z.object({
  code: z.string().min(4).optional(),
  wabaId: z.string().min(3).optional(),
  phoneNumberId: z.string().min(3).optional(),
});

async function readGraph(token: string, wabaId: string) {
  const auth = { Authorization: `Bearer ${token}` };
  const [wabaRes, phoneRes] = await Promise.all([
    fetch(`${GRAPH}/${wabaId}?fields=id,name,account_review_status`, { headers: auth }),
    fetch(
      `${GRAPH}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,platform_type,status,code_verification_status`,
      { headers: auth },
    ),
  ]);
  const wabaBody = (await wabaRes.json()) as {
    id?: string;
    name?: string;
    account_review_status?: string;
    error?: { message?: string };
  };
  const phoneBody = (await phoneRes.json()) as { data?: PhoneInfo[]; error?: { message?: string } };

  return {
    waba: wabaRes.ok
      ? { id: wabaBody.id, name: wabaBody.name, status: wabaBody.account_review_status }
      : null,
    phones: phoneRes.ok ? (phoneBody.data ?? []) : [],
    readError: !wabaRes.ok
      ? (wabaBody.error?.message ?? "Unable to read the WhatsApp Business Account.")
      : !phoneRes.ok
        ? (phoneBody.error?.message ?? "Unable to read phone numbers.")
        : null,
  };
}

/**
 * Called after the Embedded Signup dialog completes.
 * Optionally exchanges the returned code for a business token when
 * META_APP_SECRET is configured, then reports and persists the current state
 * of the WABA and phone number.
 */
export const completeWhatsAppSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => signupInput.parse(input))
  .handler(async ({ data, context }) => {
    const appSecret = process.env["META_APP_SECRET"];
    const storedToken = process.env["WHATSAPP_ACCESS_TOKEN"];

    let exchange: { ok: boolean; message: string } = {
      ok: false,
      message:
        "Signup completed. Token exchange is skipped because no Meta app secret is configured; the existing system-user token continues to be used.",
    };
    let signupToken: string | null = null;

    if (data.code && appSecret) {
      const url =
        `${GRAPH}/oauth/access_token?client_id=${META_APP_ID}` +
        `&client_secret=${encodeURIComponent(appSecret)}` +
        `&code=${encodeURIComponent(data.code)}`;
      const res = await fetch(url);
      const body = (await res.json()) as { access_token?: string; error?: { message?: string } };
      if (res.ok && body.access_token) {
        signupToken = body.access_token;
        exchange = { ok: true, message: "Meta returned a business access token for this signup." };
      } else {
        exchange = { ok: false, message: body.error?.message ?? "Meta rejected the signup code exchange." };
      }
    }

    const token = signupToken ?? storedToken ?? null;

    let waba: { id?: string; name?: string; status?: string } | null = null;
    let phones: PhoneInfo[] = [];
    let readError: string | null = null;

    if (token && data.wabaId) {
      const result = await readGraph(token, data.wabaId);
      waba = result.waba;
      phones = result.phones;
      readError = result.readError;
    } else if (!data.wabaId) {
      readError = "Meta did not return a WhatsApp Business Account id for this signup.";
    }

    let saved: StoredConnection | null = null;

    if (data.wabaId) {
      const phone =
        phones.find((p) => p.id === data.phoneNumberId) ??
        phones.find((p) => p.id === process.env["WHATSAPP_PHONE_NUMBER_ID"]) ??
        phones[0] ??
        null;

      const platform = phone?.platform_type ?? null;
      const row = {
        waba_id: data.wabaId,
        waba_name: waba?.name ?? null,
        waba_status: waba?.status ?? null,
        phone_number_id: phone?.id ?? data.phoneNumberId ?? null,
        display_phone_number: phone?.display_phone_number ?? null,
        verified_name: phone?.verified_name ?? null,
        platform_type: platform,
        phone_status: phone?.status ?? null,
        code_verification_status: phone?.code_verification_status ?? null,
        coexistence: platform === "SMB_APP" || platform === "COEXISTENCE",
        connection_status: "connected",
        last_error: readError,
        connected_by: context.userId,
        last_synced_at: new Date().toISOString(),
      };

      const { data: upserted, error } = await context.supabase
        .from("whatsapp_connections")
        .upsert(row, { onConflict: "waba_id,phone_number_id" })
        .select(
          "id,waba_id,waba_name,waba_status,phone_number_id,display_phone_number,verified_name,platform_type,phone_status,code_verification_status,coexistence,connection_status,last_error,connected_at,last_synced_at",
        )
        .maybeSingle();

      if (error) readError ??= `Could not save the connection: ${error.message}`;
      else saved = (upserted as StoredConnection | null) ?? null;
    }

    return {
      exchange,
      waba,
      phones,
      readError,
      saved,
      receivedPhoneNumberId: data.phoneNumberId ?? null,
    };
  });

/**
 * Read-only status of the WhatsApp connection: the saved Embedded Signup
 * result refreshed against Meta, plus the pre-existing credential setup.
 * No secret values are returned.
 */
export const getWhatsAppConnectionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const accessToken = process.env["WHATSAPP_ACCESS_TOKEN"];
    const phoneNumberId = process.env["WHATSAPP_PHONE_NUMBER_ID"];
    const credentialsConfigured = Boolean(accessToken && phoneNumberId);

    const { data: rows } = await context.supabase
      .from("whatsapp_connections")
      .select(
        "id,waba_id,waba_name,waba_status,phone_number_id,display_phone_number,verified_name,platform_type,phone_status,code_verification_status,coexistence,connection_status,last_error,connected_at,last_synced_at",
      )
      .order("last_synced_at", { ascending: false })
      .limit(1);

    let connection = (rows?.[0] as StoredConnection | undefined) ?? null;
    let error: string | null = null;

    // Refresh the saved connection against Meta so the hub shows live state.
    if (connection && accessToken) {
      const refreshed = await readGraph(accessToken, connection.waba_id);
      const phone =
        refreshed.phones.find((p) => p.id === connection?.phone_number_id) ?? refreshed.phones[0];
      if (phone || refreshed.waba) {
        const platform = phone?.platform_type ?? connection.platform_type;
        const update = {
          waba_name: refreshed.waba?.name ?? connection.waba_name,
          waba_status: refreshed.waba?.status ?? connection.waba_status,
          phone_number_id: phone?.id ?? connection.phone_number_id,
          display_phone_number: phone?.display_phone_number ?? connection.display_phone_number,
          verified_name: phone?.verified_name ?? connection.verified_name,
          platform_type: platform,
          phone_status: phone?.status ?? connection.phone_status,
          code_verification_status:
            phone?.code_verification_status ?? connection.code_verification_status,
          coexistence: platform === "SMB_APP" || platform === "COEXISTENCE",
          last_error: refreshed.readError,
          last_synced_at: new Date().toISOString(),
        };
        const { data: updated } = await context.supabase
          .from("whatsapp_connections")
          .update(update)
          .eq("id", connection.id)
          .select(
            "id,waba_id,waba_name,waba_status,phone_number_id,display_phone_number,verified_name,platform_type,phone_status,code_verification_status,coexistence,connection_status,last_error,connected_at,last_synced_at",
          )
          .maybeSingle();
        connection = (updated as StoredConnection | null) ?? connection;
      }
      error = refreshed.readError;
    }

    let phone: PhoneInfo | null = null;
    if (!connection && credentialsConfigured) {
      const res = await fetch(
        `${GRAPH}/${phoneNumberId}?fields=id,display_phone_number,verified_name,platform_type,status,code_verification_status`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const body = (await res.json()) as PhoneInfo & { error?: { message?: string } };
      if (res.ok) phone = body as PhoneInfo;
      else error = body.error?.message ?? "Meta request failed.";
    }

    return { credentialsConfigured, connection, phone, error };
  });
