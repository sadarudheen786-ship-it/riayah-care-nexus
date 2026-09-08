/**
 * Shared security helpers for public intake endpoints.
 * Secrets are read inside handlers only and never returned to callers.
 */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verifies Meta's `X-Hub-Signature-256` header against META_APP_SECRET.
 * Returns `"unconfigured"` when no app secret is set, so the caller can decide.
 */
export async function verifyMetaSignature(
  request: Request,
  rawBody: string,
): Promise<"valid" | "invalid" | "unconfigured"> {
  const appSecret = process.env["META_APP_SECRET"];
  if (!appSecret) return "unconfigured";
  const header = request.headers.get("x-hub-signature-256");
  if (!header?.startsWith("sha256=")) return "invalid";
  const expected = await hmacSha256Hex(appSecret, rawBody);
  return timingSafeEqual(header.slice(7), expected) ? "valid" : "invalid";
}

/**
 * Verifies a first-party caller (website form, ads bridge) using either
 * `X-Riayah-Signature: sha256=<hmac>` over the raw body, or a bearer shared secret.
 */
export async function verifyIntakeCaller(
  request: Request,
  rawBody: string,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env["LEAD_INTAKE_SECRET"];
  if (!secret) return { ok: false, reason: "Intake endpoint is not configured" };

  const signature = request.headers.get("x-riayah-signature");
  if (signature?.startsWith("sha256=")) {
    const expected = await hmacSha256Hex(secret, rawBody);
    return timingSafeEqual(signature.slice(7), expected)
      ? { ok: true }
      : { ok: false, reason: "Invalid signature" };
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && timingSafeEqual(auth.slice(7), secret)) return { ok: true };

  return { ok: false, reason: "Missing or invalid credentials" };
}
