/**
 * Kompatibilitäts-Fassade (R2, 2026-09-27): die faktische Autorität liegt
 * in `src/content` — dieses Modul hält nur noch UI-Chrome (nav/images) und
 * re-exportiert die öffentliche Projektion `@/content/public`. Neuer
 * Public-Code importiert direkt aus `@/content/public`.
 */
import { publicContent } from "@/content/public";

export const site = publicContent;

export { faqs, occasions, reviews } from "@/content/public";

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
