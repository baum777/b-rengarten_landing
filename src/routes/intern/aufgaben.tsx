import { useState, type ReactNode } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getTasks, updateTask } from "@/lib/operations/functions";
import type { TaskRow } from "../../../scripts/operations.d.mts";
import {
  departmentLabel,
  formatDueLabel,
  priorityLabel,
  taskStatusLabel,
} from "@/lib/dashboard/model";

export const Route = createFileRoute("/intern/aufgaben")({
  head: () => ({
    meta: [{ title: "Aufgaben — Bärengarten Betrieb" }],
  }),
  loader: () => getTasks(),
  component: TasksPage,
});

function TaskMeta({ task, generatedAt }: { task: TaskRow; generatedAt: string }) {
  const overdue = task.overdue;
  return (
    <p className="mt-1 text-sm text-charcoal-600">
      {departmentLabel(task.department)}
      {task.priority !== "NORMAL" ? ` · ${priorityLabel(task.priority)}` : ""}
      {task.assignee_name ? ` · ${task.assignee_name}` : " · nicht zugewiesen"}
      {task.due_at ? (
        <span className={overdue ? "text-error" : undefined}>
          {" "}
          · {formatDueLabel(task.due_at, generatedAt, overdue)}
        </span>
      ) : (
        " · ohne Fälligkeit"
      )}
      {task.source_type === "inquiry" ? (
        <>
          {" · "}
          <Link to="/intern/anfragen" className="underline underline-offset-4">
            aus Anfrage
          </Link>
        </>
      ) : null}
    </p>
  );
}

function TasksPage() {
  const data = Route.useLoaderData();
  // Kein-zugriff is the only staff-less render under /intern and has its own
  // page — this component only mounts behind the layout guard.
  const selfId = Route.useRouteContext().staff?.userId ?? null;
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

  const start = (t: TaskRow) => run(() => updateTask({ data: { id: t.id, status: "IN_PROGRESS" } }));
  const complete = (t: TaskRow) => run(() => updateTask({ data: { id: t.id, status: "DONE" } }));
  const block = (t: TaskRow) => run(() => updateTask({ data: { id: t.id, status: "BLOCKED" } }));
  const resume = (t: TaskRow) => run(() => updateTask({ data: { id: t.id, status: "IN_PROGRESS" } }));
  const assignToMe = (t: TaskRow) =>
    run(() => updateTask({ data: { id: t.id, assigneeUserId: selfId } }));

  function Actions({ task }: { task: TaskRow }) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        {!task.assignee_id && selfId ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => assignToMe(task)}
            className="micro uppercase tracking-[0.14em] text-charcoal-600 underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            Mir zuweisen
          </button>
        ) : null}
        {task.status === "OPEN" ? (
          <Button type="button" variant="wine" disabled={busy} onClick={() => start(task)}>
            Starten
          </Button>
        ) : null}
        {task.status === "IN_PROGRESS" ? (
          <Button type="button" variant="green" disabled={busy} onClick={() => complete(task)}>
            Erledigen
          </Button>
        ) : null}
        {task.status === "OPEN" || task.status === "IN_PROGRESS" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => block(task)}
            className="micro uppercase tracking-[0.14em] text-charcoal-600 underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            Blockieren
          </button>
        ) : null}
        {task.status === "BLOCKED" ? (
          <Button type="button" variant="wine" disabled={busy} onClick={() => resume(task)}>
            Weiter bearbeiten
          </Button>
        ) : null}
      </div>
    );
  }

  function Row({ task, actions }: { task: TaskRow; actions: ReactNode }) {
    return (
      <li className="rounded-xl border border-charcoal-900/10 bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-medium">
            {task.status !== "OPEN" ? (
              <span className="micro mr-2 text-charcoal-600">
                {taskStatusLabel(task.status)}
              </span>
            ) : null}
            {task.title}
          </p>
          {task.overdue ? <p className="text-sm text-error">überfällig</p> : null}
        </div>
        {task.description ? (
          <p className="mt-1 text-sm text-charcoal-600">{task.description}</p>
        ) : null}
        <TaskMeta task={task} generatedAt={data.generated_at} />
        <div className="mt-3">{actions}</div>
      </li>
    );
  }

  function Section({
    heading,
    tasks,
    actionsFor,
  }: {
    heading: string;
    tasks: TaskRow[];
    actionsFor: (t: TaskRow) => ReactNode;
  }) {
    if (tasks.length === 0) return null;
    return (
      <>
        <h2 className="eyebrow mt-8 text-charcoal-600">{heading}</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {tasks.map((t) => (
            <Row key={t.id} task={t} actions={actionsFor(t)} />
          ))}
        </ul>
      </>
    );
  }

  const fullActions = (t: TaskRow) => <Actions task={t} />;
  return (
    <section className="max-w-3xl">
      <p className="eyebrow text-wine-700">Betrieb</p>
      <h1 className="text-display-md mt-3">Aufgaben</h1>
      <p className="mt-3 text-sm text-charcoal-600">
        {data.counts.open} offen · {data.counts.overdue} überfällig ·{" "}
        {data.counts.in_progress} in Arbeit · {data.counts.blocked} blockiert ·{" "}
        {data.counts.done_today} heute erledigt
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {data.counts.open +
        data.counts.overdue +
        data.counts.in_progress +
        data.counts.blocked ===
      0 ? (
        <p className="mt-8 rounded-xl border border-charcoal-900/10 bg-card p-6 text-sm text-charcoal-600">
          Keine offenen Aufgaben. Neue Aufgaben aus Anfragen und von der
          Mitarbeiter-Oberfläche erscheinen hier.
        </p>
      ) : null}

      <Section
        heading="Überfällig"
        tasks={data.overdue}
        actionsFor={fullActions}
      />
      <Section
        heading="In Arbeit"
        tasks={data.in_progress}
        actionsFor={fullActions}
      />
      <Section
        heading="Blockiert"
        tasks={data.blocked}
        actionsFor={fullActions}
      />
      <Section
        heading="Offen"
        tasks={data.open}
        actionsFor={fullActions}
      />

      {data.done_today.length > 0 ? (
        <>
          <h2 className="eyebrow mt-8 text-charcoal-600">Heute erledigt</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {data.done_today.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-charcoal-900/10 bg-card px-4 py-3 text-sm text-charcoal-600"
              >
                {t.title}
                {" · "}
                {departmentLabel(t.department)}
                {t.assignee_name ? ` · ${t.assignee_name}` : ""}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
