# R3 — Public Homepage Redesign (Haus / Garten / Tisch)

Datum: 2026-09-27 · Basis: `f19afbe` (R2) · Zweig: `main`
Klasse: DESIGN + LAYOUT auf der R2-Content-SOT. Kein Content-Truth-Discovery,
keine Betriebsdaten-Aktivierung, kein Internal-Portal-, CMS-, PMS- oder Auth-Work.

## Ergebnis

Die Startseite ist ein fortlaufender redaktioneller Beitrag in 12 Sektionen
(01 Hero → 02 Haus-Statement → 03 Faktstreifen → 04 Garten → 05 Hotel →
06 Tisch → 07 Zusammenkommen → 08 Architektur → 09 Rutenfest → 10 Zeitleiste →
11 Lage → 12 Abschluss-CTA). Alle Fakten ausschließlich über
`@/content/public` (R2-Projektion); `operator.ts`/`transitional.ts` werden
strukturell nicht importiert (Boundary-Scan grün).

## Shell-Cleanup (Single-Gated-Homepage entfernt)

- `src/routes/__root.tsx`: `isHome`-Gate komplett entfernt — kein
  html/body-`overflow-hidden`-Toggle mehr, kein `h-dvh`-Body-Lock; Footer und
  `MobileActionBar` rendern jetzt auf jeder öffentlichen Seite (inkl. Start).
  `useEffect`-Import entfernt.
- `src/routes/index.tsx`: ersetzt `h-dvh overflow-hidden`-Single-View durch
  scrollendes Dokument; Hero `min-h-svh` (mobile-sicher, kein dvh-Sprung).
- `src/components/sections/page-hero.tsx`: altes `HomeHero`-Single-View
  gelöscht (nur Konsumer war index.tsx); `PageHero`/`CtaBand` unverändert.
- Header: unverändert — bestehender Overlay→Solid-Übergang (`overlayRoutes`
  enthält `/`) funktioniert mit dem scrollenden Dokument (visuell verifiziert).

## Neue Komponenten (nur wo Wiederverwendung sinnvoll)

- `src/components/sections/fact-strip.tsx` — editorieller Faktstreifen
  (Display-Ziffern, Mono-Labels; 2×2 mobil, 4-spaltig Desktop; kein KPI-Look).
- `src/components/sections/timeline.tsx` — Zeitleiste (Haarlinien, Mono-Nummern;
  vertikal mobil, 4-spaltig Desktop).
- Übrige Sektionen als lokale Komponenten in `index.tsx`; Wiederverwendung von
  `Photo`, `buttonVariants`, `CtaBand`.

## Content-SOT-Erweiterung (`src/content/public.ts`)

Ausschließlich LIVE-Property-Truth zusätzlich durch die Projektion geführt
(`liveFactOrThrow`): `conversion2009`, `extension2018`, `gardenChestnut`,
`architecture`, `eventHistory` → neue Felder `factStrip` (12/1/2009/2018),
`timeline` (Vor 2009 / 2009 / 2018 / Heute — 2009/2018 wörtlich aus den
Fakten), `gardenStory`, `architectureStory`, `rutenfestStory` (Faktwert
unverändert). Kuratierte Erzählstimme startet jeweils textlich beim belegten
Fakt (gleiche Klasse wie occasions/faqs). Keine Kapazitäten, keine
Betriebsdaten, kein 14.000-L-Tank (HOLD bleibt HOLD).

## Bild-Politik (Audit-Ergebnis)

- **`entrance.jpg` ausgeschlossen (Fremd-Haus):** Das Foto zeigt ein Schild
  „HOTEL RESTAURANT ZUM HIRSCHEN" — nicht der Bärengarten. Niemals als
  Property-Foto verwenden; statisch verhindert in `scripts/home-shell.test.mjs`.
  → `PHOTO_REQUIRED`: echte Fassaden-/Eingangsaufnahme beschaffen.
- Ebenfalls nicht verwendet: `food-maultaschen.jpg`, `food-roast.jpg`,
  `breakfast.jpg`, `kitchen.jpg`, `host-service.jpg` (unbelegte Küchen-/Service-
  Claims), `room-comfort.jpg`/`room-desk.jpg` (nicht benötigt).
- Verwendet: `hero-garden` (Hero, LCP, preload+eager), `garden-day` (Garten),
  `room-arrival` (Hotel), `restaurant-interior` (Tisch), `events-table`
  (Architektur), `ravensburg` (Lage — Altstadt-Panorama, Alt nennt explizit
  die Stadt, nicht das Haus). Keine doppelte Verwendung.
- Fehlende Material-Nahaufnahmen (Holz/Messing/Kupfer-Detail): Sektion
  arbeitet bewusst mit der vorhandenen Interior-Fotografie und kann später
  Detailbilder aufnehmen.

## Tests

- `src/content/content-state.test.ts` +3 R3-Tests: Faktstreifen = ["12","1",
  "2009","2018"] ohne Kapazitäts-Strings; Zeitleiste wörtlich aus den Fakten,
  ohne Öffnungszeiten/Programm/„täglich"; Garten-/Architektur-Text beginnt mit
  dem belegten Faktwert.
- `scripts/home-shell.test.mjs` (neu, 5 Tests): kein `h-dvh`/`overflow-hidden`
  in index.tsx; kein `isHome`-Gate in `__root.tsx`; Footer + Mobile-Bar
  rendern überall; jede Homepage-CTA auflöst zu einer existierenden
  Route-Datei; Bildkeys bekannt + Fremd-Haus-/Küchen-Assets ausgeschlossen;
  keine HOLD-/R1-Claim-Strings im Homepage-Quelltext.

## Validierung (Basis f19afbe, exakte Deltas)

| Check | Ergebnis |
| --- | --- |
| `npm run typecheck` | PASS |
| Tests (src-Hälfte) | 82/82 PASS (Basis 79 + 3 neue) |
| Tests (scripts-Glob) | 203/187/16 — identische 16 Prä-existierende `.grok`-ENOENT-Fails wie Basis (198/182/16) + 5 neue grüne |
| `npm run lint` | Changed-Files CLEAN; 1 Error + 5 Warnings ausschließlich in unberührten Dateien; `client.server.ts:281 no-empty` per Stash-Beweis als Basis-Defekt bestätigt. Delta: 0 |
| `npm run check:auth` | PASS — „dev and build agree: sign-in on" (Dev-Server mit Polling-Config wegen Inotify-ENOSPC; Temp-Config nicht committet) |
| `npm run build` | PASS (`.vercel/output/`) |
| Claim-Gate (Build-Output, 130 Dateien) | CLEAN für alle R3-relevanten Bundles. 2 Treffer in *unberührten* Routen, beide Basis-Bestand und beide Kontext-konform: `hotel/index.tsx` nennt Check-in/Öffnungszeiten nur als „nennen wir Ihnen mit der persönlichen Bestätigung" (R1-konforme Verweigerungs-Formulierung); `ikonografie.tsx` führt „Frühstück" als Icon-Katalog-Label (Design-System-Seite, kein Angebots-Claim). R3-Delta: 0 |
| Dev-SSR-Sweep der Startseite | alle 12 Sektionen, 0 Verbots-Claims, Footer + Mobile-Bar rendern, LCP-Vertrag (preload + genau 1 eager-Img), 5 lazy Images, kein Overflow (375≤390, 753≤768, 1425≤1440) |

## Visuelle Verifikation (lokal, IAB-Browser)

- 390px: Hero (Vollbild, Markenstatement, Lesbarkeit Header-Overlay ✓),
  Haus-Statement + Faktstreifen 2×2, Garten (4/5), Hotel-Band mit
  „12 Zimmer. Eine Suite.", Tisch-CTAs, Zusammenkommen, Architektur,
  Rutenfest-Weinband, vertikale Zeitleiste, Lage, CTA, Footer + Mobile-Bar ✓
- 768px: Hero ✓, Garten einspaltig (lg-Cut erst 1024) ✓
- 1440px: Hero ✓, Garten-Split 8/4 ✓, Hotel-Forstband 5/7 ✓, Tisch-Split 7/5 ✓,
  Rutenfest ✓, Zeitleiste 4-spaltig ✓, Lage ✓, CTA-Band + Footer ✓
- Kein horizontales Overflow, keine Text-Clips, reduzierte Bewegung: keine
  Animationen in R3-Code (nur bestehende Button/Header-Transitions, global
  per `prefers-reduced-motion` abgeschaltet).

## Umfangsgrenzen

Nicht implementiert (bewusst): R4-Routen-Migration (kein /anreise, /feiern,
/rutenfest-Route), R5-Subpages, Rutenfest-Jahresseiten, Telefon/E-Mail,
Parken, Betriebsdaten, Kapazitäten, Auth/DB-Änderungen, Internal-Portal.

## Nächste Gates

- Owner: echte Fassaden-/Materialfotos (PHOTO_REQUIRED), weiterhin G1–G5 aus
  R1.1 (Impressums-E-Mail, Broker-Creds, BETTER_AUTH_SECRET, DATABASE_URL,
  Admin-Bootstrap).
- R4 Information Architecture (Separater Owner-Go; nicht automatisch gestartet).
