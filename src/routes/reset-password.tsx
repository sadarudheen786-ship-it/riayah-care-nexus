import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — RiayahOS" },
      { name: "description", content: "Set a new password for your RiayahOS account." },
      { property: "og:title", content: "Set a new password — RiayahOS" },
      {
        property: "og:description",
        content: "Set a new password for your RiayahOS account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

type ResetState = "checking" | "ready" | "invalid" | "saving" | "done";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ResetState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get("type");
    if (recoveryType !== "recovery") {
      setState("invalid");
      return () => {
        active = false;
      };
    }

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setState(!error && data.user ? "ready" : "invalid");
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setState("saving");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMessage("The password could not be updated. Request a fresh reset link and try again.");
      setState("ready");
      return;
    }

    await supabase.auth.signOut();
    setState("done");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-elegant">
            <span className="font-display text-lg font-bold">R</span>
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-foreground">RiayahOS</div>
            <div className="text-xs text-muted-foreground">Account recovery</div>
          </div>
        </div>

        <section className="rounded-lg border border-border bg-card p-6 shadow-elegant sm:p-8">
          <div className="mb-6 grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
            <KeyRound className="size-5" aria-hidden="true" />
          </div>
          {state === "checking" && (
            <p role="status" className="text-sm text-muted-foreground">
              Checking your password-reset link…
            </p>
          )}
          {state === "invalid" && (
            <>
              <h1 className="font-display text-xl font-semibold text-foreground">
                This reset link is invalid or expired
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Request a new password-reset email to continue.
              </p>
              <Button className="mt-6 w-full" onClick={() => void navigate({ to: "/login" })}>
                Return to sign in
              </Button>
            </>
          )}
          {state === "done" && (
            <>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Password updated
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your new password is ready. Sign in to continue.
              </p>
              <Button
                className="mt-6 w-full"
                onClick={() => void navigate({ to: "/login", replace: true })}
              >
                Go to sign in
              </Button>
            </>
          )}
          {(state === "ready" || state === "saving") && (
            <>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Set a new password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose the password you’ll use for future sign-ins.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
                {errorMessage && (
                  <p role="alert" className="text-sm text-destructive">
                    {errorMessage}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={state === "saving"}>
                  {state === "saving" ? "Updating…" : "Update password"}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}