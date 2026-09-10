import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, MessageCircle, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  META_APP_ID,
  META_SIGNUP_CONFIG_ID,
  completeWhatsAppSignup,
  getWhatsAppConnectionStatus,
  type StoredConnection,
} from "@/lib/whatsapp-signup.functions";

declare global {
  interface Window {
    FB?: {
      init: (opts: Record<string, unknown>) => void;
      login: (
        cb: (res: { authResponse?: { code?: string } | null; status?: string }) => void,
        opts: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";

type PhoneStatus = {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  platform_type?: string;
  status?: string;
};

type SessionInfo = { waba_id?: string; phone_number_id?: string };

type SignupOutcome =
  | { kind: "finished"; data: SessionInfo }
  | { kind: "cancelled"; message: string }
  | { kind: "error"; message: string };

const SIGNUP_EVENT_TIMEOUT_MS = 30_000;

function loadSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FB) return resolve();
    const existing = document.getElementById("facebook-jssdk") as HTMLScriptElement | null;
    const onReady = () => {
      window.FB?.init({ appId: META_APP_ID, autoLogAppEvents: true, xfbml: false, version: "v21.0" });
      resolve();
    };
    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", () => reject(new Error("Facebook SDK failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = SDK_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = onReady;
    script.onerror = () => reject(new Error("Facebook SDK failed to load"));
    document.body.appendChild(script);
  });
}

function isFacebookOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "facebook.com" || host.endsWith(".facebook.com");
  } catch {
    return false;
  }
}

export function ConnectWhatsAppBusiness() {
  const complete = useServerFn(completeWhatsAppSignup);
  const readStatus = useServerFn(getWhatsAppConnectionStatus);
  const sessionRef = useRef<SessionInfo>({});
  const outcomeRef = useRef<SignupOutcome | null>(null);
  const outcomeResolverRef = useRef<((outcome: SignupOutcome) => void) | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connection, setConnection] = useState<StoredConnection | null>(null);
  const [phone, setPhone] = useState<PhoneStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const status = await readStatus({ data: undefined });
      setConnection(status.connection);
      setPhone(status.phone ?? null);
      if (!status.connection && !status.phone && status.error) setMessage(status.error);
    } catch {
      setMessage("Could not read the WhatsApp connection status.");
    } finally {
      setLoadingStatus(false);
    }
  }, [readStatus]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isFacebookOrigin(event.origin)) return;
      try {
        const payload = (typeof event.data === "string" ? JSON.parse(event.data) : event.data) as {
          type?: string;
          event?: string;
          data?: SessionInfo & { error_message?: string; error_id?: string };
        };
        if (payload.type !== "WA_EMBEDDED_SIGNUP") return;
        let outcome: SignupOutcome | null = null;
        if (payload.event === "FINISH" || payload.event === "FINISH_ONLY_WABA") {
          sessionRef.current = payload.data ?? {};
          outcome = { kind: "finished", data: sessionRef.current };
        } else if (payload.event === "CANCEL") {
          outcome = { kind: "cancelled", message: "Signup was closed before it finished." };
        } else if (payload.event === "ERROR") {
          outcome = {
            kind: "error",
            message: payload.data?.error_message ?? "Meta could not complete WhatsApp signup.",
          };
        }
        if (!outcome) return;
        outcomeRef.current = outcome;
        outcomeResolverRef.current?.(outcome);
        outcomeResolverRef.current = null;
      } catch {
        /* non-JSON messages from Facebook are ignored */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const waitForSignupOutcome = useCallback(() => {
    const existing = outcomeRef.current;
    if (existing) return Promise.resolve(existing);

    return new Promise<SignupOutcome | null>((resolve) => {
      const timeout = window.setTimeout(() => {
        outcomeResolverRef.current = null;
        resolve(null);
      }, SIGNUP_EVENT_TIMEOUT_MS);

      outcomeResolverRef.current = (outcome) => {
        window.clearTimeout(timeout);
        resolve(outcome);
      };
    });
  }, []);

  const start = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    setDetails([]);
    sessionRef.current = {};
    outcomeRef.current = null;
    outcomeResolverRef.current = null;
    try {
      await loadSdk();
      const code = await new Promise<string | null>((resolve) => {
        window.FB?.login((response) => resolve(response.authResponse?.code ?? null), {
          config_id: META_SIGNUP_CONFIG_ID,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "whatsapp_business_app_onboarding",
            sessionInfoVersion: "3",
          },
        });
      });

      const outcome = outcomeRef.current ?? (await waitForSignupOutcome());
      if (outcome?.kind === "cancelled" || outcome?.kind === "error") {
        setMessage(outcome.message);
        return;
      }

      const session = outcome?.kind === "finished" ? outcome.data : sessionRef.current;
      if (!session.waba_id) {
        setMessage(
          code
            ? "Meta authorized the account but did not return the WhatsApp Business account details. No connection was saved."
            : "Meta did not return a completed signup response. No changes were made.",
        );
        return;
      }

      const result = await complete({
        data: {
          code: code ?? undefined,
          wabaId: session.waba_id,
          phoneNumberId: session.phone_number_id,
        },
      });

      const lines: string[] = [];
      if (result.waba) {
        lines.push(`Business account: ${result.waba.name ?? result.waba.id} (${result.waba.status ?? "status unknown"})`);
      }
      for (const phone of result.phones) {
        lines.push(
          `${phone.display_phone_number ?? phone.id} — ${phone.platform_type ?? "platform unknown"}, ${phone.status ?? "status unknown"}`,
        );
      }
      if (result.readError) lines.push(result.readError);
      setDetails(lines);
      setMessage(
        result.saved
          ? "WhatsApp Business account connected and saved."
          : result.exchange.message,
      );
      if (result.saved) setConnection(result.saved);
      else await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start the WhatsApp signup.");
    } finally {
      setBusy(false);
    }
  }, [complete, refresh, waitForSignupOutcome]);

  const connected = Boolean(connection);
  const detected = Boolean(phone);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {connected ? <CheckCircle2 className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">
            {connected
              ? "WhatsApp Business connected"
              : detected
                ? "WhatsApp Business number detected"
                : "Connect WhatsApp Business"}
          </div>

          {connected && connection ? (
            <ul className="mt-1.5 space-y-1">
              <li className="text-xs text-muted-foreground">
                Business account: {connection.waba_name ?? connection.waba_id}
                {connection.waba_status ? ` (${connection.waba_status})` : ""}
              </li>
              <li className="text-xs text-muted-foreground">
                Number: {connection.display_phone_number ?? connection.phone_number_id ?? "—"}
                {connection.verified_name ? ` — ${connection.verified_name}` : ""}
              </li>
              <li className="text-xs text-muted-foreground">
                Platform: {connection.platform_type ?? "unknown"}
                {connection.coexistence ? " (coexistence with the WhatsApp Business app)" : ""} ·{" "}
                {connection.phone_status ?? "status unknown"}
              </li>
              {connection.last_error && (
                <li className="text-xs text-warning">{connection.last_error}</li>
              )}
            </ul>
          ) : detected && phone ? (
            <ul className="mt-1.5 space-y-1">
              <li className="text-xs text-muted-foreground">
                Number: {phone.display_phone_number ?? phone.id}
                {phone.verified_name ? ` — ${phone.verified_name}` : ""}
              </li>
              <li className="text-xs text-muted-foreground">
                Platform: {phone.platform_type ?? "unknown"} · {phone.status ?? "status unknown"}
              </li>
            </ul>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Opens Meta&apos;s official signup window. Choose the existing Riayah Care business
              account, then scan the QR code shown there with the WhatsApp Business app to keep using
              both together.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={start}
              disabled={busy || loadingStatus}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MessageCircle className="h-3.5 w-3.5" />
              )}
              {busy
                ? "Waiting for Meta…"
                : connected
                  ? "Reconnect or add a number"
                  : "Connect WhatsApp Business"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => void refresh()}
              disabled={busy || loadingStatus}
            >
              {loadingStatus ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          </div>

          {message && <p className="mt-3 text-xs text-foreground">{message}</p>}
          {details.length > 0 && (
            <ul className="mt-2 space-y-1">
              {details.map((line) => (
                <li key={line} className="text-[11px] text-muted-foreground">
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
