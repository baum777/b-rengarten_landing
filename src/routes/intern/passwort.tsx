import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/intern/passwort")({
  head: () => ({
    meta: [{ title: "Passwort ändern — Bärengarten Betrieb" }],
  }),
  component: PasswordPage,
});

/** Same minimum the bootstrap provisioning enforces (provisioning.mjs). */
const MIN_LENGTH = 12;

function PasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setSuccess(false);
    if (!current) {
      setError("Bitte das aktuelle Passwort eingeben.");
      return;
    }
    if (next.length < MIN_LENGTH) {
      setError(`Das neue Passwort braucht mindestens ${MIN_LENGTH} Zeichen.`);
      return;
    }
    if (next !== confirm) {
      setError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: changeError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: false,
    });
    setBusy(false);
    if (changeError) {
      setError("Änderung fehlgeschlagen. Prüfen Sie das aktuelle Passwort.");
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setSuccess(true);
  }

  return (
    <section className="max-w-md">
      <p className="eyebrow text-wine-700">Konto</p>
      <h1 className="text-display-md mt-3">Passwort ändern</h1>
      <p className="mt-3 text-sm text-charcoal-600">
        Zur Bestätigung zuerst das aktuelle Passwort eingeben. Das neue Passwort
        gilt danach nur für diese Anmeldung; andere Geräte bleiben angemeldet.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pw-current">Aktuelles Passwort</Label>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pw-next">Neues Passwort</Label>
          <Input
            id="pw-next"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_LENGTH}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <p className="micro text-charcoal-600">mindestens {MIN_LENGTH} Zeichen</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pw-confirm">Neues Passwort wiederholen</Label>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_LENGTH}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="text-sm text-success">
            Passwort geändert. Beim nächsten Anmelden das neue Passwort verwenden.
          </p>
        ) : null}
        <Button type="submit" disabled={busy} className="mt-2 self-start">
          {busy ? "Wird geändert…" : "Passwort ändern"}
        </Button>
      </form>
    </section>
  );
}
