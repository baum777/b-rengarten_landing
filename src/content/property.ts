/**
 * Stabile Property-Truth: belegte Sachverhalte zu Haus, Lage, Gästeeinheiten
 * und Geschichte. Freigabepfad für Änderungen: Owner-Nachweis → Wert und
 * `verifiedAt`/`sourceLabel` hier pflegen.
 */
import type { ContentFact } from "./types.ts";

const fact = <T>(
  key: string,
  value: T,
  extra: Partial<ContentFact<T>> = {},
): ContentFact<T> => ({
  key,
  value,
  truthState: "PROPERTY_TRUTH",
  publicationState: "LIVE",
  requirement: "OPTIONAL",
  ...extra,
});

export const propertyFacts = {
  address: fact(
    "property.address",
    {
      street: "Schützenstraße 21",
      zip: "88212",
      city: "Ravensburg",
      country: "Deutschland",
    },
    {
      requirement: "LEGAL_REQUIRED",
      sourceLabel: "Owner-Freigabe, Public-Redesign-Review 2026-09-27",
    },
  ),
  geo: fact("property.geo", { lat: 47.7817, lng: 9.6114 }),
  roomCount: fact("property.rooms", 12, {
    sourceLabel: "Owner-Freigabe, Public-Redesign-Review 2026-09-27",
  }),
  suiteCount: fact("property.suites", 1, {
    sourceLabel: "Owner-Freigabe, Public-Redesign-Review 2026-09-27",
  }),
  conversion2009: fact(
    "property.history.2009",
    "2009 wurde das Haus zum Hotel mit Restaurant und Biergarten umgebaut.",
    { sourceLabel: "Dokumentierter Umbau, Owner-Freigabe 2026-09-27" },
  ),
  extension2018: fact(
    "property.history.2018",
    "2018 folgte der dokumentierte Anbau.",
    { sourceLabel: "Dokumentierter Anbau, Owner-Freigabe 2026-09-27" },
  ),
  gardenChestnut: fact(
    "property.garden.chestnut",
    "Alter Baumbestand und der Garten gehören zum Haus.",
    { sourceLabel: "Owner-Freigabe, Public-Redesign-Review 2026-09-27" },
  ),
  architecture: fact(
    "property.architecture",
    "Haus, Restaurant und Garten stehen in einer gebauten Beziehung zueinander.",
    { sourceLabel: "Owner-Freigabe, Public-Redesign-Review 2026-09-27" },
  ),
  eventHistory: fact(
    "property.events.history",
    "Das Haus ist seit Langem mit Veranstaltungen und dem Rutenfest verbunden.",
    { sourceLabel: "Owner-Freigabe, Public-Redesign-Review 2026-09-27" },
  ),
} as const;
