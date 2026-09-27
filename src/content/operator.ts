/**
 * Betreiber-kontrollierte Aussagen (Öffnungszeiten, Küche, Preise, …) —
 * sämtlich OPERATOR_STATE und HIDDEN. Die Slots dokumentieren die
 * Dispositionen aus dem R1-Content-Recall: Die Legacy-Werte wurden entfernt
 * und werden erst nach Betreiberbestätigung NEU erhoben — niemals aus
 * Altbeständen restauriert. `value` bleibt daher absichtlich null.
 *
 * Public-Code importiert dieses Modul nie (scripts/content-boundary.test.mjs).
 */
import type { ContentFact } from "./types.ts";

const fact = (
  key: string,
  extra: Partial<ContentFact<string | null>> = {},
): ContentFact<string | null> => ({
  key,
  value: null,
  truthState: "OPERATOR_STATE",
  publicationState: "HIDDEN",
  requirement: "OPERATIONAL",
  ...extra,
});

export const operatorFacts = {
  openingHours: fact("operator.hours", {
    note: "Öffnungszeiten wurden in R1 entfernt; erst nach Betreiberbestätigung neu erheben.",
  }),
  checkInCheckOut: fact("operator.check-in-out", {
    note: "Check-in/-out werden individuell vereinbart (FAQ-Formulierung); keine fixen Zeiten ohne Bestätigung.",
  }),
  breakfast: fact("operator.breakfast", {
    note: "Frühstückszeiten/-angaben wurden in R1 entfernt; erst nach Bestätigung neu erheben.",
  }),
  menuItems: fact("operator.menu.items", {
    note: "Keine Gerichte/Preise verifiziert. /restaurant/speisekarte bleibt neutral mit Transitional-Hinweis (public.menuNotice).",
  }),
  prices: fact("operator.prices", {
    note: "Keine Preisangaben ohne Betreiberbestätigung.",
  }),
  dogPolicy: fact("operator.dog-policy", {
    note: "Hunde-Regelung wurde in R1 entfernt; erst nach Bestätigung neu erheben.",
  }),
  roomClasses: fact("operator.room-classes", {
    note: "Komfort-/Business-/Junior-Suite-Klassen sind nicht belegt; belegt sind 12 Zimmer + 1 Suite (property.rooms/suites).",
  }),
  hostPromises: fact("operator.host-promises", {
    note: "Betreiber-spezifische Wirt/Versprechen-Claims wurden in R1 entfernt.",
  }),
} as const;
