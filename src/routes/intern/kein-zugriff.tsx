import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";

export const Route = createFileRoute("/intern/kein-zugriff")({
  component: KeinZugriffPage,
});

function KeinZugriffPage() {
  return (
    <section className="mx-auto max-w-sm pt-16">
      <p className="eyebrow text-wine-700">Zugang</p>
      <h1 className="text-display-md mt-3">Kein Zugang</h1>
      <p className="mt-4 text-charcoal-600">
        Sie sind angemeldet, Ihr Konto ist aber nicht als aktives
        Mitarbeiter-Profil freigeschaltet. Bitte wenden Sie sich an die
        Geschäftsführung.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Button variant="secondary" onClick={() => void signOut("/login")}>
          Abmelden
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/">Zur Startseite</Link>
        </Button>
      </div>
    </section>
  );
}
