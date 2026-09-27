import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/intern/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const user = useCurrentUser();
  return (
    <section>
      <p className="eyebrow text-wine-700">Betrieb</p>
      <h1 className="text-display-md mt-3">
        Guten Tag{user?.displayName ? `, ${user.displayName}` : ""}
      </h1>
      <p className="mt-4 max-w-prose text-charcoal-600">
        Kennzahlen, Anfragen und Datenflüsse folgen mit den nächsten Ausbaustufen
        (Phase 2–4). Der Zugang, die Rollen und die Shell stehen — der
        betriebliche Kern beginnt mit der dauerhaften Speicherung der
        öffentlichen Anfragen.
      </p>
    </section>
  );
}
