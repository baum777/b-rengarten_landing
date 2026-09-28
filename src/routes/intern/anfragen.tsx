import { useState, type ReactNode } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getInquiries, setInquiryStatus, updateTask } from "@/lib/operations/functions";
import type { InquiryRow } from "../../../scripts/operations.d.mts";
import { evaluateMetric, requiredMetric } from "@/lib/metrics/registry";
import { minutesSince } from "@/lib/metrics/data-quality";
import { formatDuration, taskStatusLabel } from "@/lib/dashboard/model";

export const Route = createFileRoute("/intern/anfragen")({
  head: () => ({
    meta: [{ title: "Anfragen — Bärengarten Betrieb" }],
  }),
  loader: () => getInquiries(),
  component: InquiriesPage,
});

const TYPE_LABELS: Record<string, string> = {
  ROOM: "Zimmeranfrage",
  TABLE: "Tischanfrage",
  OCCASION: "Anlassanfrage",
};

const BAND_WORDS: Record<string, { word: string; className: string }> = {
  ok: { word: "im Zielband", className: "text-charcoal-600" },
  over_target: { word: "über Zielwert", className: "text-charcoal-900" },
  warning: { word: "Warnung", className: "text-warning" },
  critical: { word: "kritisch", className: "text-error" },
  unavailable: { word: "", className: "text-charcoal-600" },
  unrated: { word: "", className: "text-charcoal-600" },
};

function ageLine(row: InquiryRow, generatedAt: string): string {
  const minutes = minutesSince(row.created_at, generatedAt);
  return `vor ${formatDuration(minutes)}`;
}

function bandOf(row: InquiryRow, generatedAt: string) {
  const response = requiredMetric("inquiry_response");
  const minutes = minutesSince(row.created_at, generatedAt);
  return BAND_WORDS[evaluateMetric(response, minutes).level];
}

function metaLine(row: InquiryRow): string {
  return [
    `${row.guest_count} ${row.guest_count === 1 ? "Gast" : "Gäste"}`,
    row.arrival ? `Anreise ${row.arrival}` : null,
    row.departure ? `Abreise ${row.departure}` : null,
    row.room,
    row.occasion,
    row.time,
  ]
    .filter(Boolean)
    .join(" · ");
}

function InquiriesPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await router.invalidate();
    } catch {
      setError("Die Änderung konnte nicht gespeichert werden. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  const takeOver = (row: InquiryRow) =>
    run(() => updateTask({ data: { id: row.task!.id, status: "IN_PROGRESS" } }));
  const completeTask = (row: InquiryRow) =>
    run(() => updateTask({ data: { id: row.task!.id, status: "DONE" } }));
  const closeInquiry = (row: InquiryRow) =>
    run(() => setInquiryStatus({ data: { id: row.id, status: "CLOSED" } }));

  function Row({
    row,
    actions,
    showBand,
  }: {
    row: InquiryRow;
    actions: ReactNode;
    showBand: boolean;
  }) {
    const band = bandOf(row, data.generated_at);
    return (
      <li className="rounded-xl border border-charcoal-900/10 bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-medium">
            {TYPE_LABELS[row.type]} · {row.guest_name}
          </p>
          <p className="micro text-charcoal-600">
            {ageLine(row, data.generated_at)}
            {showBand && band.word ? (
              <span className={`ml-2 ${band.className}`}>· {band.word}</span>
            ) : null}
          </p>
        </div>
        <p className="mt-1 text-sm text-charcoal-600">{metaLine(row)}</p>
        {row.notes ? (
          <p className="mt-2 text-sm text-charcoal-900">{row.notes}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="micro text-charcoal-600">
            <a href={`mailto:${row.email}`} className="underline underline-offset-4">
              {row.email}
            </a>
            {row.phone ? ` · ${row.phone}` : ""}
            {row.task?.assignee_name ? ` · zugewiesen: ${row.task.assignee_name}` : ""}
            {row.task?.status ? ` · Folgetaufgabe: ${taskStatusLabel(row.task.status)}` : ""}
          </p>
          <div className="flex items-center gap-3">{actions}</div>
        </div>
      </li>
    );
  }

  const closeLink = (row: InquiryRow) => (
    <button
      type="button"
      disabled={busy}
      onClick={() => closeInquiry(row)}
      className="micro uppercase tracking-[0.14em] text-charcoal-600 underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
    >
      Anfrage abschließen
    </button>
  );

  return (
    <section className="max-w-3xl">
      <p className="eyebrow text-wine-700">Betrieb</p>
      <h1 className="text-display-md mt-3">Anfragen</h1>
      <p className="mt-3 text-sm text-charcoal-600">
        {data.counts.unanswered} unbeantwortet · {data.counts.in_progress} in Bearbeitung
        {data.counts.other > 0 ? ` · ${data.counts.other} mit erledigter Folgetaufgabe` : ""}
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {data.counts.total === 0 ? (
        <p className="mt-8 rounded-xl border border-charcoal-900/10 bg-card p-6 text-sm text-charcoal-600">
          Keine offenen Anfragen. Neue Anfragen aus den Formularen der Website
          erscheinen hier automatisch.
        </p>
      ) : null}

      {data.unanswered.length > 0 ? (
        <>
          <h2 className="eyebrow mt-8 text-charcoal-600">
            Unbeantwortet — älteste zuerst
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {data.unanswered.map((row) => (
              <Row
                key={row.id}
                row={row}
                showBand
                actions={
                  <Button
                    type="button"
                    variant="wine"
                    disabled={busy}
                    onClick={() => takeOver(row)}
                  >
                    Übernehmen
                  </Button>
                }
              />
            ))}
          </ul>
        </>
      ) : null}

      {data.in_progress.length > 0 ? (
        <>
          <h2 className="eyebrow mt-8 text-charcoal-600">In Bearbeitung</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {data.in_progress.map((row) => (
              <Row
                key={row.id}
                row={row}
                showBand={false}
                actions={
                  <>
                    <Button
                      type="button"
                      variant="green"
                      disabled={busy}
                      onClick={() => completeTask(row)}
                    >
                      Folgetaufgabe erledigen
                    </Button>
                    {closeLink(row)}
                  </>
                }
              />
            ))}
          </ul>
        </>
      ) : null}

      {data.other.length > 0 ? (
        <>
          <h2 className="eyebrow mt-8 text-charcoal-600">
            Folgetaufgabe erledigt — Anfrage noch offen
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {data.other.map((row) => (
              <Row key={row.id} row={row} showBand={false} actions={closeLink(row)} />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
