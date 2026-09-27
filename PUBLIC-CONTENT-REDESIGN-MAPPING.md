# Öffentliche Website — Content-Redesign-Mapping

Review 2026-09-27 („Ein Haus. Viele Gründe zu bleiben." / House · Garden ·
Table) → Repo-Stand `935e9d5` (+ uncommittete Phase-1-Änderungen im Tree).

Leitlinie: Nicht „Hotel mit Restaurant und Biergarten", sondern **ein Haus,
dessen Hotel, Restaurant, Garten und Geschichte zusammengehören**. Dramaturgie:
ORT → HAUS → GARTEN → ZUSAMMENKOMMEN → GESCHICHTE → NEUES KAPITEL. Farbsystem,
Typografie und Tokens bleiben; Richtung wird editorial-architektonisch.

---

## 0. Ausgangslage im Repo (verifiziert)

- Die Homepage ist seit `935e9d5` eine **„single gated view"** (nur `HomeHero`,
  `h-dvh overflow-hidden`, ohne Footer/Mobile-Bar). Das Redesign macht daraus
  wieder eine Scroll-Seite → die `isHome`-Sonderlogik in `__root.tsx` (inkl.
  `overflow-hidden`-Effect und Footer/Mobile-Bar-Verzicht auf `/`) entfällt
  weitgehend. *Achtung:* `__root.tsx` hat zusätzlich den Phase-1-`isInternal`-
  Patch — Slices sauber getrennt halten.
- **Bereits vorhanden und wiederverwendbar** (Redesign ist kein Neubau):
  - `CtaBand` (§18 „Was führt Sie zu uns?" — existiert wortgleich, nur
    Anlass-Link auf `/feiern` umstellen).
  - `EditorialSplit` mit `tone: cream|green|wine` → Basis für Haus-Statement,
    „Der Tisch" und den Rutenfest-Wine-Break.
  - `PortalGrid` + `StayIcon/TableIcon/GardenIcon` → **HOUSE/GARDEN/TABLE ist
    ikonografisch bereits angelegt.**
  - `PageHero`, `Photo` (ratio), `GardenFrame`, `StatusLine`, `buttonVariants`.
- Verwaist: die alten `sections/home.tsx`-Sektionen (nur `ProofPrinciples`
  noch auf `/ueber-uns` im Einsatz).

## 1. Content-Audit — kritischer Befund

Das Content-State-System (§22 des Reviews) ist nicht nur Struktur für Neues;
**der Bestand verletzt es heute auf mehreren public Routen**:

| Befund (live) | Ort | Status laut System |
|---|---|---|
| Zimmerklassen „Komfort / Business / Junior Suite" inkl. ausgedachter Facts („Drei Typen") | `site.ts rooms[]` → `/hotel/zimmer`, `PortalGrid` | **OPERATOR_STATE** — nur 12 Zimmer + 1 Suite belastbar |
| Gerichte „Maultaschen, Zwiebelrostbraten…" + Food-Fotos | `site.ts menuPreview` → `/restaurant/speisekarte`, `RestaurantEditorial` | **OPERATOR_STATE** — Küchenkonzept steht nicht fest |
| Öffnungszeiten, Frühstück, Check-in 15:00/11:00, Ruhetag | `site.ts hours/faqs` → Footer, `/hotel/index`, `/kontakt`, `/faq` | **OPERATOR_STATE** |
| Hunde, „Parken vor Ort nach Verfügbarkeit", Barrierefreiheit-Zusagen | `site.ts faqs` → `/faq` | **OPERATOR_STATE / TRANSITIONAL** |
| Gastgeberversprechen („Was Sie von uns erwarten dürfen…") | `ProofPrinciples` → `/ueber-uns` | **OPERATOR_STATE** — during Betreiberübergabe problematisch |
| Telefon / E-Mail | `site.ts` → Footer, JSON-LD, `/kontakt` | **TRANSITIONAL** — als Kontaktwege wahrscheinlich nötig, aber prüfen |
| Kapazitäten 200 innen / 400 außen („bis") | `site.ts occasions` → `/anlaesse` | **TRANSITIONAL** — Stadtangaben, Fußnotenregel fehlt |

Konsequenz: **Slice R1 „Content-Recall" ist auch ohne Redesign dringlich** —
er entfernt unbelegte Operator-Claims und ist eigenständig deploybar. Sonst
zementiert das Redesign unbelegte Claims in schönerem Gewand.

## 2. Content-State-System als Code

Neu `src/content/`, typisiert statt Listen im Text:

```ts
export type ContentState = "PROPERTY_TRUTH" | "TRANSITIONAL" | "OPERATOR_STATE";
```

- `src/content/property.ts` — Adresse/Geo, 12+1, Garten/Kastanien, Architektur
  2009/2018 (Öffnungen, zentrale Küche, Materialien), Eventhistorie, Rutenfest.
- `src/content/transitional.ts` — Einträge mit `pendingCheck`-Feld:
  Kapazitäten (mit `footnote`), Biertank 14.000 L (`confirmed: false` →
  UI rendert nicht), Telefon/E-Mail, Parkplätze (`confirmed: false`),
  Barrierefreiheit im Detail.
- `src/content/operator.ts` — Öffnungszeiten, Check-in/out, Frühstück,
  Gerichte, Zimmerklassen, Preise, Hunde, Gastgeberversprechen. **Regel: von
  public-UI nie importiert**; Bestätigtes wandert kanalweise nach
  `property.ts` (Übersetzung mit Quellenhinweis im Commit).

## 3. IA / Sitemap-Mapping

| Bestand | Ziel | Mechanismus |
|---|---|---|
| `/` | Neue 12-Sektionen-Dramaturgie (§4) | Rebuild `index.tsx` + `HomeHero` |
| `/hotel`, `/hotel/zimmer` | bleibt; Inhalt auf 12+1 umgestellt | R5 |
| `/hotel/buchen` | bleibt (Anfrage-Formulare; Persistenz = Phase 2 intern) | — |
| `/restaurant`, `/restaurant/speisekarte` | bleibt; speisekarte neutral („Tageskarte vor Ort") oder hidden bis Operator-Daten — **offen** | R5 |
| `/biergarten` | bleibt; Garten-/Kastanien-Erzählung stärken | R5 |
| `/anlaesse` | **→ `/feiern`** (Rename, Inhalt „Zusammenkommen") | Route-Shim mit `redirect()` |
| NEU `/rutenfest` + `/rutenfest/$jahr` | Wine-Break-Erzählung + Jahresarchiv (Daten in `content/`) | R4 |
| `/ueber-uns` | **→ `/das-haus`** (+ `/das-haus/geschichte`, `/das-haus/architektur`; Gliederung 01 Geschichte · 02 Architektur · 03 Garten · 04 Ravensburg · 05 Neues Kapitel); `ProofPrinciples` entfernen | Route-Shims |
| NEU `/anreise` | Anreise/Ort; `/kontakt` geht darin auf (Adresse, Wege; Telefon/E-Mail mit Prüfhinweis) | R4 |
| `/faq` | bleibt als Route, **raus aus der Hauptnav**; Inhalte auf status-geprüfte Fragen reduzieren | R5 |
| `/login`, `/intern/*` | Phase 1, unverändert | — |
| `/impressum`, `/datenschutz`, `/ikonografie` | bleiben (Legal/Basis, nicht Hauptnav) | — |

Redirects als TanStack-Route-Shims (funktionieren in Preview **und** Deploy;
`vercel.json` würde nur die Produktion abdecken).

## 4. Homepage 01–12 → Komponenten-Mapping

| # | Sektion | Komponente | Copy-Quelle |
|---|---|---|---|
| 01 | HERO full viewport, kein Booking-CTA, Fact-Line „12 Zimmer + 1 Suite · Restaurant · Biergarten unter alten Kastanien", Scroll-Pfeil | `HomeHero` umbauen | property |
| 02 | „Das Haus" Statement (Paper-Fläche, rechts Fact-Liste) | `EditorialSplit` cream ohne Bild | property |
| 03 | FACT STRIP 12+1 · 200* · 400* · 2009, Fußnote „historische/kommunal veröffentlichte Standortangaben" | neu `FactStrip` | transitional (+footnote) |
| 04 | GARTEN 65/35 Bild/Text, Textpanel überlappt beim Scroll | `GardenFeature` umbauen | property |
| 05 | SIGNATURE FACT „14.000 L" | neu `SignatureFact`, **default hidden** (`confirmed: false`) | transitional |
| 06 | HOTEL editorial (Villa, Umbau 2009, 12+1, CTA „Zimmer entdecken") | `EditorialSplit` | property |
| 07 | RESTAURANT „Der Tisch" (Öffnungen verbinden Garten, zentrale Küche; keine Gerichte) | `EditorialSplit` | property |
| 08 | ZUSAMMENKOMMEN (Familien…Kultur + Bildstreifen + Kapazitätszeilen mit *) | neu `GatherBand` | transitional |
| 09 | RUTENFEST Wine-Break | `EditorialSplit` tone wine (reduziert) → `/rutenfest` | property |
| 10 | TIMELINE VOR 2009 / 2009 / 2018 / HEUTE, „Ein bekanntes Haus. Ein neues Kapitel." | neu `Timeline` (horizontal desktop, vertikal mobile) | property |
| 11 | LOCATION „RAVENSBURG" groß, [Anreise]; kein Parkversprechen | `LocationSection` umbauen | property |
| 12 | CTA „Was führt Sie zu uns? [Zimmer][Tisch][Anlass]" | `CtaBand` (Label → `/feiern`) | — |

Layout-Prinzip durchhalten: FULL BLEED → editorialer Text → HARD FACTS im
Wechsel; nicht jede Sektion in Cards (`PortalGrid` wandert damit in die
Subseiten-Navigation oder entfällt auf Home).

## 5. Navigation & Mobile

- `site.ts nav` → `Hotel · Restaurant · Biergarten · Feiern · Rutenfest ·
  Das Haus · Kontakt`; FAQ + Speisekarte raus (Footer behält sie). Phase-1-
  „Mitarbeiter"-Footer-Link bleibt.
- Mobile = eigener Rhythmus (§19): Hero → 12+1 → Gartenfoto → Kastanien →
  Hotel → Restaurant → Zusammenkommen → Rutenfest → Geschichte → Ravensburg →
  CTA; Bilder edge-to-edge, Facts einzeln groß, 20–35 Wörter pro Block. Der
  `FactStrip` liefert die großen Einzelfakten; `Timeline` stapes vertikal.

## 6. Umsetzungs-Slices

1. **R1 Content-Recall** (dringlich, eigenständig deploybar): Zimmerklassen,
   Gerichte, Öffnungs-/Frühstück-/Check-in-Zeiten, Hunde-/Park-/Barrier-
   versprechen und `ProofPrinciples` von public entfernen; `/faq` reduzieren.
2. **R2 Content-State-System**: `src/content/*` + Typen + Übergaberegeln.
3. **R3 Homepage-Dramaturgie**: Sektionen 01–12 (SignatureFact hidden).
4. **R4 IA**: `/feiern`, `/das-haus`(+Sub), `/rutenfest`(+`$jahr`), `/anreise`,
   Redirect-Shims, neue Nav.
5. **R5 Subseiten-Recall/Neutext**: zimmer, speisekarte, biergarten, faq.

Reihenfolge R1 → R2 → R3 → R4 → R5. **Mischungsverbot:** Phase-1-Änderungen
(intern) liegen uncommittet im Tree — erst Phase 1 committen (Owner), Redesign
in eigenen Commits/Worktree-Slices; niemals intern+public in einem Diff.

## 7. Offene Owner-Entscheidungen — GESCHLOSSEN (Dispositionen 2026-09-27)

1. **14.000-L-Biertank → `HOLD UNTIL PHYSICAL VERIFICATION`.** Historischer
   Fakt bleibt im Content-SOT, `publicationState = HIDDEN`, bis vor Ort
   bestätigt ist: Anlage existiert, Tank existiert, Bezug zum heutigen Betrieb
   stimmt, keine Umnutzung/Stilllegung. Verifikation: Foto + Bestätigung
   Eigentümer/Hotelleitung + optional technische Unterlage.
2. **Telefon/E-Mail → `REMOVE UNLESS CURRENT OWNER CONFIRMS`.** Kein
   öffentlicher „Prüfhinweis" — entweder CONFIRMED → anzeigen, oder
   UNCONFIRMED → weglassen. Kontakt/Anreise zeigt bis dahin nur die Adresse.
   (Umgesetzt in R1: alle Renderings entfernt, `site.ts` ohne Kontaktfelder.)
3. **Speisekarte → `ROUTE EXISTS, CONTENT NEUTRAL`.** Route bleibt (SEO/Nav),
   Inhalt neutral: „Unsere Karte entsteht derzeit." Keine Gerichte, keine
   Preise, keine Küchenrichtung, kein Food-Bild. (Umgesetzt in R1.)
4. **`/kontakt` → `MERGE INTO /ANREISE`,** `/kontakt` wird Redirect, sobald
   `/anreise` fertig ist (R4). Bis dahin bleibt `/kontakt` als schlanke
   Adress-/Formularseite.
5. **Rutenfest → `EVERGREEN PAGE FIRST`.** Start mit historisch-kontextueller
   `/rutenfest`-Seite; keine `/rutenfest/2026` ohne offizielles Programm.
   Jahresseiten (`/rutenfest/2027` mit Programm/Zeiten/Reservierung) erst bei
   konkreter Saisoninfo — Evergreen und Jahr bleiben getrennt.

Weitere Festlegungen aus dem Review: R1→R2→R3→R4→R5 eingefroren; Hero
emotional (kein 12+1-Stapel — Fakten erst im House Statement); `EditorialSplit`
als Primitive mit image/content/tone/orientation; 301er-Redirects erst setzen,
wenn die Zielroute live ist; `single gated view`-Cleanup (overflow-lock,
Viewport-Annahmen) als expliziter R3-Schritt; Intern/Public-Teilung: gemeinsam
nur tokens/brand primitives/icons/button/db/auth — nie navigation/shell/content
model/page hierarchy.

## 8. Validierung je Slice

```bash
npm run build && npm run typecheck && npm test && npm run lint
```

- **Recall-Gate (R1/R5):** `grep -r "Komfort\|Business Suite\|Frühstück\|Check-in" src/routes src/components/site src/lib/site.ts` → leer (außer `src/content/operator.ts`).
- **Redirect-Gate (R4):** `curl -I` auf `/anlaesse`, `/ueber-uns`, `/kontakt` → Location auf neue URLs.
- **Brand/Smoke:** bestehende `scripts/brand-check.mjs` + Browser-Smoke; JSON-LD in `__root.tsx` mitziehen (Telefon nur nach Entscheidung 2).
- Status-Disziplin: kein public-Import aus `src/content/operator.ts` (optional eslint `no-restricted-imports` als hartes Gate).
