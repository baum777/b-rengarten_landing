import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getToday, updateTask, readBriefing } from "@/lib/operations/functions";
export const Route = createFileRoute("/intern/heute")({
  loader: () => getToday(),
  component: HeutePage,
});
function HeutePage() {
  const d = Route.useLoaderData(),
    router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await router.invalidate();
    } catch {
      setError("Die Änderung konnte nicht gespeichert werden. Bitte erneut laden.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="max-w-2xl">
      <p className="eyebrow text-wine-700">Heute</p>
      <h1 className="text-display-md mt-3">Meine Aufgaben</h1>
      <p className="mt-3 tabular-nums">
        {d.tasks.filter((t) => t.priority === "URGENT").length} dringende ·{" "}
        {d.tasks.filter((t) => t.due_today).length} heute fällige Aufgaben
      </p>
      {error && (
        <p role="alert" className="mt-4">
          {error}
        </p>
      )}
      {d.tasks.length === 0 && <p className="mt-4">Keine offenen Aufgaben zugewiesen.</p>}
      <div className="mt-6 space-y-4">
        {d.tasks.map((t) => (
          <article key={t.id} className="rounded-xl border p-5">
            <p className="text-sm">
              {t.priority === "URGENT" ? "Dringend" : t.priority} · {t.status}
            </p>
            <h2 className="mt-2 text-xl">{t.title}</h2>
            <p className="mt-2">{t.description}</p>
            {t.due_today && <p className="mt-2 text-sm">Heute fällig</p>}
            {t.due_at && (
              <p className="mt-2 text-sm">
                Fällig:{" "}
                {new Date(t.due_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}
              </p>
            )}
            <Button
              variant="secondary"
              disabled={busy}
              className="mt-4 min-h-11 rounded-lg border px-4"
              onClick={() =>
                void run(() =>
                  updateTask({
                    data: { id: t.id, status: t.status === "IN_PROGRESS" ? "DONE" : "IN_PROGRESS" },
                  }),
                )
              }
            >
              {t.status === "IN_PROGRESS" ? "Erledigt" : "Starten"}
            </Button>
          </article>
        ))}
      </div>
      <h2 className="mt-8 text-2xl">
        Briefings · {d.briefings.filter((b) => !b.read).length} ungelesen
      </h2>
      {d.briefings.length === 0 && <p className="mt-4">Keine veröffentlichten Briefings.</p>}
      <div className="mt-4 space-y-4">
        {d.briefings.map((b) => (
          <article key={b.id} className="rounded-xl border p-5">
            <h3 className="text-xl">{b.title}</h3>
            <p className="mt-2 whitespace-pre-wrap">{b.body}</p>
            {b.read ? (
              <p className="mt-4">Gelesen</p>
            ) : (
              <Button
                variant="secondary"
                disabled={busy}
                className="mt-4 min-h-11 rounded-lg border px-4"
                onClick={() => void run(() => readBriefing({ data: { id: b.id } }))}
              >
                Als gelesen bestätigen
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
