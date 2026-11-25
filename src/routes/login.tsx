import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — RiayahOS" },
      { name: "description", content: "Secure staff sign-in for RiayahOS." },
      { property: "og:title", content: "Sign in — RiayahOS" },
      { property: "og:description", content: "Secure staff sign-in for RiayahOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    setResetMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setBusy(false);
    if (error) {
      setErrorMessage("That email and password combination could not be verified.");
      return;
    }

    await navigate({ to: "/" });
  }

  async function handleForgotPassword() {
    setErrorMessage("");
    setResetMessage("");
    if (!email.trim()) {
      setErrorMessage("Enter your email address first, then choose Forgot password.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);

    if (error) {
      setErrorMessage("The reset email could not be sent. Please try again shortly.");
      return;
    }

    setResetMessage("If this account exists, a password-reset link is on its way.");
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
            <div className="text-xs text-muted-foreground">Riayah Care · Staff access</div>
          </div>
        </div>

        <section className="rounded-lg border border-border bg-card p-6 shadow-elegant sm:p-8">
          <div className="mb-7">
            <div className="mb-3 grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your invited Riayah Care account to continue.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="username"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => void handleForgotPassword()}
                disabled={busy}
              >
                Forgot password?
              </Button>
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}
            {resetMessage && (
              <p role="status" className="text-sm text-success">
                {resetMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : "Continue"}
              {!busy && <ArrowRight aria-hidden="true" />}
            </Button>
          </form>
        </section>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          Access is limited to invited staff. Public account creation is disabled.
        </p>
      </div>
    </main>
  );
}