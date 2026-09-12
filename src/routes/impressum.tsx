import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/lib/site";

export const Route = createFileRoute("/impressum")({
  component: ImprintPage,
  head: () => ({
    meta: [{ title: "Impressum — Bärengarten Ravensburg" }],
  }),
});

function ImprintPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24">
      <article className="content-reading space-y-6">
        <p className="eyebrow text-wine-700">Rechtliches</p>
        <h1 className="text-display-md">Impressum</h1>
        <p className="text-charcoal-600">Angaben gemäß § 5 DDG</p>
        <p>
          {site.name} Ravensburg
          <br />
          {site.address.street}
          <br />
          {site.address.zip} {site.address.city}
        </p>
        <p>
          Telefon: {site.phone}
          <br />
          E-Mail: {site.email}
        </p>
        <p className="text-sm text-charcoal-600">
          Rechtsform, Vertretung und Registereintrag werden vor einem
          öffentlichen Launch mit der Betriebsführung abgeglichen. Diese Seite
          dient der digitalen Orientierung des Hauses.
        </p>
      </article>
    </main>
  );
}
