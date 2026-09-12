import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/lib/site";

export const Route = createFileRoute("/datenschutz")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: "Datenschutz — Bärengarten Ravensburg" }],
  }),
});

function PrivacyPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <article className="content-reading space-y-6">
        <p className="eyebrow text-wine-700">Rechtliches</p>
        <h1 className="text-display-md">Datenschutz</h1>
        <p>
          Verantwortlich: {site.name}, {site.address.street}, {site.address.zip}{" "}
          {site.address.city}, {site.email}.
        </p>
        <h2 className="font-display text-2xl pt-4">Anfragen</h2>
        <p className="text-charcoal-600">
          Zimmer-, Tisch- und Anlassformulare dienen der Kontaktaufnahme. Die
          Angaben werden zur Bearbeitung Ihrer Anfrage verwendet. Es findet
          keine Weitergabe zu Werbezwecken statt. Es wird kein Nutzerkonto
          angelegt.
        </p>
        <h2 className="font-display text-2xl pt-4">Hosting</h2>
        <p className="text-charcoal-600">
          Beim Aufruf der Website fallen technisch notwendige Server-Logs an
          (u. a. IP-Adresse, Zeitpunkt, aufgerufene Seite). Sie werden zur
          Bereitstellung und Sicherheit der Seite verarbeitet.
        </p>
        <h2 className="font-display text-2xl pt-4">Ihre Rechte</h2>
        <p className="text-charcoal-600">
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
          Beschwerde bei einer Aufsichtsbehörde. Schreiben Sie an {site.email}.
        </p>
      </article>
    </main>
  );
}
