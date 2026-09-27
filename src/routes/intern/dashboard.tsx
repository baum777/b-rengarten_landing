import { createFileRoute } from "@tanstack/react-router";
import { getDashboard } from "@/lib/operations/functions";
export const Route = createFileRoute("/intern/dashboard")({
  loader: () => getDashboard(),
  component: DashboardPage,
});
function DashboardPage() {
  const d = Route.useLoaderData();
  const metrics = [
    ["Offene Anfragen", d.open_inquiries],
    ["Neue Anfragen heute", d.new_inquiries_today],
    ["Offene Aufgaben", d.open_tasks],
    ["Überfällig", d.overdue_tasks],
    ["Heute erledigt", d.completed_tasks_today],
    ["Aktive Mitarbeiter", d.active_staff],
    ["Anreisen", d.arrivals],
    ["Abreisen", d.departures],
    ["Auslastung", d.occupancy === null ? null : `${Math.round(d.occupancy * 100)} %`],
  ];
  return (
    <section>
      <p className="eyebrow text-wine-700">Betrieb</p>
      <h1 className="text-display-md mt-3">Dashboard</h1>
      <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {metrics.map(([name, value]) => (
          <div key={name} className="rounded-xl border p-4">
            <dt>{name}</dt>
            <dd className="mt-2 text-2xl tabular-nums">{value ?? "Keine Daten"}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-8 text-xl">Aktuelle Anfragen</h2>
      {d.inquiries.length === 0 ? (
        <p className="mt-4">Noch keine Anfragen.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {d.inquiries.map((i) => (
            <li key={i.request_id} className="rounded-xl border p-4">
              {i.type} · {i.status}
              <p className="text-sm">{i.request_id}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
