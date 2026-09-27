export const site = {
  name: "Bärengarten",
  location: "Ravensburg",
  descriptor: "Hotel · Restaurant · Biergarten",
  tagline: "Unvernünftige Gastfreundschaft",
  manifesto: "Gastfreundschaft darf ein bisschen unvernünftig sein.",
  address: {
    street: "Schützenstraße 21",
    zip: "88212",
    city: "Ravensburg",
    country: "Deutschland",
  },
  geo: { lat: 47.7817, lng: 9.6114 },
  // Kontaktwege (Telefon, E-Mail) folgen erst nach Bestätigung durch die
  // aktuelle Betreiberschaft — bis dahin werden sie nirgends gerendert
  // (Content-Recall 2026-09-27, Disposition: REMOVE UNLESS CONFIRMED).
  mapsUrl:
    "https://www.openstreetmap.org/?mlat=47.7817&mlon=9.6114#map=18/47.7817/9.6114",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Sch%C3%BCtzenstra%C3%9Fe+21+88212+Ravensburg",
} as const;

// Öffnungs-, Frühstücks-, Rezeptions- und Check-in-Zeiten sind
// OPERATOR_STATE und stehen erst nach Betreiberbestätigung wieder in der
// Seite — sie werden aktuell nirgends gerendert (Content-Recall 2026-09-27).

export const nav = [
  { to: "/hotel", label: "Hotel" },
  { to: "/restaurant", label: "Restaurant" },
  { to: "/biergarten", label: "Biergarten" },
  { to: "/anlaesse", label: "Anlässe" },
  { to: "/ueber-uns", label: "Über uns" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

export const images = {
  heroGarden: "/images/hero-garden.jpg",
  gardenDay: "/images/garden-day.jpg",
  gardenGlasses: "/images/garden-glasses.jpg",
  roomComfort: "/images/room-comfort.jpg",
  roomDesk: "/images/room-desk.jpg",
  roomArrival: "/images/room-arrival.jpg",
  restaurantInterior: "/images/restaurant-interior.jpg",
  eventsTable: "/images/events-table.jpg",
  entrance: "/images/entrance.jpg",
  ravensburg: "/images/ravensburg.jpg",
} as const;

// 12 Zimmer und 1 Suite sind die belegte Gästeeinheiten-Basis; Zimmerklassen
// und -ausstattungen werden erst nach Inventur wieder benannt.

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
