/**
 * Quellengestützte, aber operativ NICHT verifizierte Sachverhalte — alles
 * HOLD. Freigabeweg: Owner bestätigt (Foto/Unterlage/Bestätigung) →
 * publicationState auf LIVE und explizite Aufnahme in der öffentlichen
 * Projektion. Bis dahin rendern diese Werte nirgends; Legacy-Werte aus der
 * Zeit vor dem R1-Content-Recall werden bewusst nicht restauriert.
 */
import type { ContentFact } from "./types.ts";

const fact = <T>(
  key: string,
  value: T,
  extra: Partial<ContentFact<T>> = {},
): ContentFact<T> => ({
  key,
  value,
  truthState: "TRANSITIONAL",
  publicationState: "HOLD",
  requirement: "OPTIONAL",
  ...extra,
});

export const transitionalFacts = {
  beerTank: fact("transitional.beer-tank", "14.000-Liter-Biertank", {
    note: "HOLD UNTIL PHYSICAL VERIFICATION — Freigabe erst nach Foto + Bestätigung Eigentümer/Hotelleitung (Owner-Disposition 2026-09-27).",
  }),
  parking: fact("transitional.parking", null, {
    note: "Keine Parkplatz-Aussagen ohne Verifizierung (Owner-Disposition 2026-09-27).",
  }),
  accessibility: fact("transitional.accessibility-details", null, {
    note: "Belegt und öffentlich bleibt nur der Aufzug (FAQ); weitergehende Barrierefreiheits-Aussagen erst nach Verifizierung.",
  }),
  phone: fact("contact.phone", null, {
    note: "REMOVE UNLESS CONFIRMED — Legacy-Nummer wurde in R1 gelöscht und darf nicht restauriert werden; erst nach Bestätigung durch die aktuelle Betreiberschaft eintragen.",
  }),
  generalEmail: fact("contact.email", null, {
    note: "REMOVE UNLESS CONFIRMED — allgemeine öffentliche Kontakt-E-Mail; bleibt HOLD bis zur separaten Freigabe für Marketing-Nutzung.",
  }),
  legalEmail: fact("contact.email.legal", null, {
    requirement: "LEGAL_REQUIRED",
    note: "§ 5 Abs. 1 Nr. 2 DDG — Pflichtangabe, aktuell unverifiziert (BLOCKING FINDING F1.1). Autoritatives fail-closed-Modell: src/lib/legal-contact.ts. Nicht mit der Marketing-E-Mail verschmelzen.",
  }),
} as const;
