import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/intern/heute")({
  component: HeutePage,
});

function HeutePage() {
  const user = useCurrentUser();
  return (
    <section>
      <p className="eyebrow text-wine-700">Heute</p>
      <h1 className="text-display-md mt-3">
        Guten Tag{user?.displayName ? `, ${user.displayName}` : ""}
      </h1>
      <p className="mt-4 max-w-prose text-charcoal-600">
        Aufgaben, Briefings und Übergaben folgen mit der Ausbaustufe
        „Make public demand durable“ (Phase 2). Bis dahin ist dieser Platz Ihre
        bestätigte Anmeldung im Betrieb.
      </p>
    </section>
  );
}
