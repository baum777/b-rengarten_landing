export const site = {
  name: "Bärengarten",
  location: "Ravensburg",
  descriptor: "Hotel · Restaurant · Biergarten",
  tagline: "Unvernünftig gastfreundlich.",
  manifesto: "Gastfreundschaft darf ein bisschen unvernünftig sein.",
  address: {
    street: "Schützenstraße 21",
    zip: "88212",
    city: "Ravensburg",
    country: "Deutschland",
  },
  geo: { lat: 47.7817, lng: 9.6114 },
  phone: "0751 958 777 53",
  phoneHref: "tel:+4975195877753",
  email: "hallo@baerengarten.de",
  mapsUrl:
    "https://www.openstreetmap.org/?mlat=47.7817&mlon=9.6114#map=18/47.7817/9.6114",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Sch%C3%BCtzenstra%C3%9Fe+21+88212+Ravensburg",
} as const;

export const hours = {
  restaurant: "Dienstag–Sonntag, 17:00–22:00 Uhr",
  restaurantNote: "Küche nach Tageskarte. Montag Ruhetag.",
  breakfastWeek: "Montag–Freitag, 07:00–09:00 Uhr",
  breakfastWeekend: "Samstag und Sonntag, 08:00–10:00 Uhr",
  receptionWeek: "Montag–Freitag, 07:00–19:00 Uhr",
  receptionWeekend: "Samstag und Sonntag, 08:00–18:00 Uhr",
  checkIn: "15:00 Uhr",
  checkOut: "11:00 Uhr",
  garden: "Wetterabhängig, in der Saison parallel zur Küche",
} as const;

export const nav = [
  { to: "/hotel", label: "Hotel" },
  { to: "/restaurant", label: "Restaurant" },
  { to: "/biergarten", label: "Biergarten" },
  { to: "/anlaesse", label: "Anlässe" },
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
  foodRoast: "/images/food-roast.jpg",
  foodMaultaschen: "/images/food-maultaschen.jpg",
  kitchen: "/images/kitchen.jpg",
  hostService: "/images/host-service.jpg",
  breakfast: "/images/breakfast.jpg",
  eventsTable: "/images/events-table.jpg",
  entrance: "/images/entrance.jpg",
  ravensburg: "/images/ravensburg.jpg",
} as const;

export const rooms = [
  {
    slug: "komfort",
    name: "Komfort",
    subtitle: "Zum Ankommen und Durchatmen.",
    facts: ["1–2 Personen", "Arbeitsplatz", "Tageslicht", "Eigenes Bad"],
    image: images.roomComfort,
    alt: "Helles Komfortzimmer mit cremefarbenem Leinenbett und Eichenschreibtisch",
  },
  {
    slug: "business",
    name: "Business",
    subtitle: "Arbeiten und schlafen, klar getrennt.",
    facts: ["1–2 Personen", "Schreibtisch am Fenster", "WLAN", "In der Stadt"],
    image: images.roomDesk,
    alt: "Hotelzimmer mit Schreibtisch am Fenster und gemachtem Bett",
  },
  {
    slug: "suite",
    name: "Junior Suite",
    subtitle: "Mehr Raum, dieselbe Ruhe.",
    facts: ["2 Personen", "Sitzbereich", "Viel Licht", "Für längere Aufenthalte"],
    image: images.roomArrival,
    alt: "Großzügiges Zimmer mit Ankunftskoffer und gemachtem Doppelbett",
  },
] as const;

export const menuPreview = [
  {
    group: "Küche",
    items: [
      {
        name: "Maultaschen in der Brühe",
        note: "Kräuter, klare Suppe, sichtbar gemacht.",
      },
      {
        name: "Zwiebelrostbraten",
        note: "Saft, Röstaromen, Gemüse.",
      },
      {
        name: "Gegrilltes Rind vom Rost",
        note: "Einfach geführt, auf den Punkt.",
      },
    ],
  },
  {
    group: "Garten & Tisch",
    items: [
      {
        name: "Tageskarte",
        note: "Was die Küche heute ehrlich kochen kann.",
      },
      {
        name: "Ausgewählte Weine & Bier vom Fass",
        note: "Zum Essen.",
      },
      {
        name: "Süßes vom Haus",
        note: "Wenn noch Platz ist — und oft ist Platz.",
      },
    ],
  },
] as const;

export const occasions = [
  {
    title: "Zusammen essen",
    body: "Familien, Freundeskreise, das wichtige Mittagsgespräch. Innen bis 200 Plätze.",
  },
  {
    title: "Im Garten",
    body: "Sommerfeste und offene Runden unter alten Bäumen. Außen bis 400 Plätze, wetterabhängig.",
  },
  {
    title: "Arbeiten und bleiben",
    body: "Kleine Runden, Ankommen am Vorabend, früh klar am Tisch.",
  },
] as const;

export const faqs = [
  {
    q: "Wie reise ich an?",
    a: "Schützenstraße 21, 88212 Ravensburg. Gut erreichbar in der Stadt. Parken vor Ort nach Verfügbarkeit.",
  },
  {
    q: "Wann kann ich einchecken?",
    a: "Check-in ab 15:00 Uhr, Check-out bis 11:00 Uhr. Die Rezeption ist unter der Woche von 07:00 bis 19:00 Uhr besetzt, am Wochenende von 08:00 bis 18:00 Uhr. Spätere Ankunft bitte vorher absprechen.",
  },
  {
    q: "Gibt es Frühstück?",
    a: "Ja. Montag bis Freitag 07:00–09:00 Uhr, Samstag und Sonntag 08:00–10:00 Uhr.",
  },
  {
    q: "Wann hat das Restaurant geöffnet?",
    a: "Dienstag bis Sonntag, 17:00–22:00 Uhr. Montag ist Ruhetag. Die Küche kocht nach Tageskarte.",
  },
  {
    q: "Ist der Biergarten immer geöffnet?",
    a: "Der Garten folgt der Saison und dem Wetter. An einem klaren Tag sitzen Sie unter den Kastanien; bei Regen bleibt das Haus. Status und heutige Öffnung nennen wir gern am Telefon.",
  },
  {
    q: "Kann ich einen Tisch oder ein Zimmer telefonisch anfragen?",
    a: "Ja. Rufen Sie uns an unter 0751 958 777 53 oder schreiben Sie an hallo@baerengarten.de. Formulare auf dieser Seite sind Anfragen — wir bestätigen persönlich.",
  },
  {
    q: "Sind Hunde willkommen?",
    a: "Bitte vorab anfragen. Wir klären das im Einzelfall, nicht über ein starres Schild.",
  },
  {
    q: "Gibt es barrierefreie Zimmer?",
    a: "Das Haus liegt in der Stadt, mit Aufzug. Barrierefreiheit im Detail klären wir vor der Buchung — sagen Sie uns, was Sie brauchen.",
  },
] as const;

export const reviews: readonly { quote: string; source: string }[] = [];
