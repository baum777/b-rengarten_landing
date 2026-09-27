/**
 * EINZIGE öffentliche Projektion der Content-Source-of-Truth. Importiert
 * bewusst NICHT aus `transitional.ts`/`operator.ts` — nicht freigegebene
 * Fakten können strukturell nicht leaken (geprüft in
 * `content-state.test.ts` und `scripts/content-boundary.test.mjs`).
 * Freigaben laufen als publicationState-Flip in der besitzenden Domäne plus
 * expliziter Aufnahme HIER — nichts wird generisch durchgereicht.
 *
 * Kuratierter Public-Text (Sprachstimme, FAQ, Anlässe) lebt ebenfalls hier:
 * er ist öffentlicher Bestandteil der Seite und damit Teil der Projektion.
 */
import { propertyFacts } from "./property.ts";
import { liveFactOrThrow } from "./types.ts";

const address = liveFactOrThrow(propertyFacts.address);
const geo = liveFactOrThrow(propertyFacts.geo);
const rooms = liveFactOrThrow(propertyFacts.roomCount);
const suites = liveFactOrThrow(propertyFacts.suiteCount);

export const occasions = [
  {
    title: "Zusammen essen",
    body: "Familien, Freundeskreise, das wichtige Mittagsgespräch. Große Runden im Innenraum — konkrete Kapazitäten klären wir in der Anfrage.",
  },
  {
    title: "Im Garten",
    body: "Sommerfeste und offene Runden unter alten Bäumen. Der Außenraum bietet viel Platz, wetterabhängig.",
  },
  {
    title: "Arbeiten und bleiben",
    body: "Kleine Runden, Ankommen am Vorabend, früh klar am Tisch.",
  },
] as const;

export const faqs = [
  {
    q: "Wie reise ich an?",
    a: "Schützenstraße 21, 88212 Ravensburg. Gut erreichbar in der Stadt — die Route zeigt Ihnen der Karten-Link.",
  },
  {
    q: "Wann kann ich einchecken?",
    a: "Check-in und Check-out stimmen wir persönlich mit Ihnen ab — am besten direkt in Ihrer Anfrage.",
  },
  {
    q: "Ist der Biergarten geöffnet?",
    a: "Der Garten folgt der Saison und dem Wetter. Ob er an Ihrem Tag offen ist, klären Sie kurz vor dem Besuch mit uns.",
  },
  {
    q: "Wie funktioniert eine Anfrage?",
    a: "Zimmer-, Tisch- und Anlassanfragen gehen über die Formulare auf dieser Seite. Wir prüfen jede Anfrage und bestätigen persönlich.",
  },
  {
    q: "Ist das Haus barrierefrei?",
    a: "Das Haus liegt in der Stadt, mit Aufzug. Was Sie im Einzelnen brauchen, besprechen Sie am besten in Ihrer Anfrage.",
  },
] as const;

export const reviews: readonly { quote: string; source: string }[] = [];

export const publicContent = {
  name: "Bärengarten",
  location: "Ravensburg",
  descriptor: "Hotel · Restaurant · Biergarten",
  tagline: "Unvernünftige Gastfreundschaft",
  manifesto: "Gastfreundschaft darf ein bisschen unvernünftig sein.",
  address,
  geo,
  rooms,
  suites,
  roomHeadline: `${rooms} Zimmer. ${suites === 1 ? "Eine Suite." : `${suites} Suiten.`}`,
  mapsUrl: `https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lng}#map=18/${geo.lat}/${geo.lng}`,
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address.street} ${address.zip} ${address.city}`,
  )}`,
  // Transitional-Botschaft für /restaurant/speisekarte — kuriert, kein
  // erfundenes Menü. Die zugehörigen Fakten bleiben OPERATOR_STATE/HIDDEN.
  menuNotice: "Unsere neue Karte entsteht derzeit. Aktuelle Informationen folgen.",
  occasions,
  faqs,
  reviews,
} as const;

export type PublicContent = typeof publicContent;
