import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { loadStaffAccess } from "@/lib/permissions/access";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { authed, staff } = await loadStaffAccess();
    if (!authed) return;
    // Already authenticated: send to the role landing (or the denied page —
    // never loop back into the form).
    throw redirect({
      to: staff
        ? staff.role === "ADMIN"
          ? "/intern/dashboard"
          : "/intern/heute"
        : "/intern/kein-zugriff",
    });
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/intern",
    });
    if (signInError) {
      setBusy(false);
      setError(
        "Anmeldung fehlgeschlagen. Prüfen Sie E-Mail und Passwort — oder melden Sie sich über einen Anmelde-Dienst an.",
      );
      return;
    }
    // Full reload so the fresh session cookie reaches the SSR guards, which
    // resolve the role landing (incl. the one-time first-admin bootstrap).
    window.location.assign("/intern");
  }

  return (
    <main className="content-reading flex min-h-[80vh] items-center justify-center pt-24 pb-24">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-wine-700">Bärengarten Betrieb</p>
        <h1 className="text-display-md mt-3">Mitarbeiter-Anmeldung</h1>
        <p className="mt-3 text-sm text-charcoal-600">
          Zugang nur mit freigeschaltetem Mitarbeiterkonto. Anfragen als Gast
          bitte über die öffentlichen Formulare.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">E-Mail</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">Passwort</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Anmeldung läuft…" : "Anmelden"}
          </Button>
        </form>

        <div className="mt-8 flex flex-col gap-2">
          {GROK_PROVIDERS.map((provider) => (
            <Button
              key={provider.providerId}
              variant="secondary"
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void signIn(provider.providerId, { callbackURL: "/intern" });
              }}
            >
              Weiter mit {provider.label}
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
