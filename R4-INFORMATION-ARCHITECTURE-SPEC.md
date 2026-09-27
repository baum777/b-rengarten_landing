# R4 INFORMATION ARCHITECTURE — Contract (FROZEN, NOT STARTED)

```text
Status:     CONTRACT_FROZEN_BY_OWNER_REVIEW — 2026-09-27
Executed:   NO. This document authorizes no execution by itself.
Authority:  Owner review of the R3 closure (message 2026-09-27), verbatim captured here.
Next gate:  R4 run starts ONLY on explicit owner go.
```

Classification: owner-frozen run contract for the next run. This is a contract capture, not
implementation evidence. Nothing in here claims route changes, redirects, or navigation changes
have been applied.

---

## 1. R3 Abschluss (owner verdict, kanonisch)

**R3 ist PASS und mit `cad8f43` kanonisch geschlossen.** Content-SOT blieb Authority,
HOLD/HIDDEN-Fakten sind nicht zurückgekehrt, R4/R5 nicht vorgezogen, Single-View-Logik gezielt
entfernt, Produktion visuell (nicht nur HTTP) verifiziert.

```text
R3 PUBLIC HOMEPAGE REDESIGN     PASS
Content Authority               PASS
Responsive / Visual             PASS
Production Verification         PASS
R4 contamination                NONE
```

### Öffentliche narrative Grundstruktur (Homepage-Contract, in R4 nicht erneut umbauen)

```text
BÄRENGARTEN / RAVENSBURG
        ↓
Brand
        ↓
HOUSE
        ↓
GARDEN
        ↓
HOTEL
        ↓
TABLE
        ↓
TOGETHER
        ↓
ARCHITECTURE
        ↓
RUTENFEST
        ↓
STORY
        ↓
LOCATION
        ↓
ACTION
```

Diese Struktur ist ab jetzt kanonisch. R4 lässt die Homepage-Komposition unangetastet.

---

## 2. Asset-Invariante (aus dem entrance.jpg-Befund)

`entrance.jpg` zeigt ein anderes Haus (Schild „Zum Hirschen“) — nicht verwendet und per
`scripts/home-shell.test.mjs` gesperrt. Daraus ab jetzt explizite Invariante für ALLE
Property-Bilder:

```text
PROPERTY IMAGE
→ actual Bärengarten asset
→ known provenance
→ correct physical subject
```

Kein:

```text
placeholder property photography
stock architecture
adjacent building
historical image without labeling
```

Die fehlende Fassadenaufnahme bleibt `PHOTO_REQUIRED`, ist aber **kein Blocker für R4**.

---

## 3. R4 Zielstruktur (eingefroren)

R4 ist **nicht** Homepage-Design. R4 beantwortet: *Welche öffentliche Information lebt unter
welcher kanonischen URL, und wie gelangt der Nutzer dorthin?* Bewusst klein halten.

```text
/
│
├── /hotel
│   └── /hotel/zimmer
│
├── /restaurant
│   └── /restaurant/speisekarte
│
├── /biergarten
│
├── /feiern
│
├── /rutenfest
│
├── /das-haus
│   ├── /das-haus/geschichte
│   └── /das-haus/architektur
│
├── /anreise
│
├── /faq
│
├── /impressum
├── /datenschutz
├── /login
│
└── /intern/*
```

Betroffene Legacy-Routen heute (Observed, `src/routes/`): `anlaesse.tsx`, `ueber-uns.tsx`,
`kontakt.tsx`. Neu anzulegen: `/feiern`, `/rutenfest`, `/das-haus` (+ 2 Subrouten),
`/anreise`, `/hotel/zimmer`.

### Migrations-Reihenfolge (zwingend, nicht andersherum)

```text
erst neue Route vollständig vorhanden
        ↓
interne Links migrieren
        ↓
alte URL redirecten
```

### Kanonische Zuordnung

```text
/anlaesse  → /feiern
/ueber-uns → /das-haus
/kontakt   → /anreise
```

---

## 4. Seitenhaltungen (Content-Postur je neuer Route)

### `/feiern`
Name passt zum öffentlichen Nutzerverständnis. Inhalt weiterhin vorsichtig:

Erlaubt: Zusammenkommen · Feiern · Gruppen · Veranstaltungstradition.
Noch nicht (solange kein Operator-State freigegeben): Hochzeitspaket · Tagungspauschale ·
Catering-Angebot · konkrete Raumgarantien.

### `/das-haus`
Wichtigste neue Informationsseite neben den drei Betriebsbereichen. Hub-Konzeption:

```text
DAS HAUS
Geschichte · Architektur · Garten · Ravensburg · Neues Kapitel
```

Subrouten zunächst: `/das-haus/geschichte`, `/das-haus/architektur`.
Die Homepage darf diese Themen anteasern; R5 baut sie ausführlich aus.

### `/rutenfest`
Evergreen-Route wird in R4 tatsächlich etabliert — nur mit heute gesichertem historischem
Kontext. **Kein** `/rutenfest/2027`; das bleibt zukünftiger saisonaler Content.

### `/anreise`
Die bisherige `/kontakt`-Logik geht hier auf. Kern:

```text
Schützenstraße 21
88212 Ravensburg
Karte · Lage · Anfahrt
```

Später erst nach Verifikation: Parken · ÖPNV · Fahrräder · Barrierefreiheit · Telefon · E-Mail.
`/anreise` ist eine echte Nutzeraufgabe, keine generische Kontaktseite.

**Observed (Grundlage Migration):** `kontakt.tsx` hostet **kein eigenes Formular** — nur
Adresse, Hinweis „Anfragen über die Formulare dieser Seite“, CTAs auf `/hotel/buchen`
(Zimmeranfrage) und `/restaurant/reservieren` (Tischanfrage) plus Google-Maps-Link. Diese
Anfrage-CTAs sind auf `/anreise` zu erhalten; die Formular-Routen selbst bleiben unberührt.

---

## 5. Navigation nach R4

Desktop maximal sieben Hauptpunkte:

```text
Hotel · Restaurant · Biergarten · Feiern · Rutenfest · Das Haus · Anreise
```

Rechts separat (CTA-Ebene): `Zimmer` · `Tisch`.

Nicht in Hauptnavigation: FAQ · Speisekarte · Impressum · Datenschutz · Mitarbeiter.
`Mitarbeiter` gehört dezent in Footer bzw. Utility-Ebene (heute bereits im Footer verankert).

---

## 6. Redirects sind Produktbestandteil

Redirects werden nicht als Cleanup behandelt, sondern getestet. Mindestmatrix:

```text
GET /anlaesse  → redirect /feiern
GET /ueber-uns → redirect /das-haus
GET /kontakt   → redirect /anreise
```

Plus: keine Redirect-Loops · Querystrings soweit sinnvoll erhalten · keine internen Links mehr
auf Legacy-Routen. Bekannte interne `/kontakt`-Konsumenten (Stand R3, nicht abschließend —
der Run greift systematisch): Homepage-Location-Sektion, MobileActionBar (Hotel- und
Biergarten-Kontext), `ueber-uns.tsx`.

---

## 7. R4 Definition of Done

```text
[ ] canonical sitemap implemented
[ ] /feiern exists
[ ] /das-haus exists
[ ] /rutenfest exists
[ ] /anreise exists
[ ] legacy routes redirect
[ ] header uses canonical routes
[ ] mobile nav uses canonical routes
[ ] footer uses canonical routes
[ ] homepage CTAs still resolve
[ ] no R1 forbidden claims introduced
[ ] no HOLD/HIDDEN facts activated
[ ] homepage visual composition unchanged
[ ] /login unaffected
[ ] /intern protection unaffected
[ ] route tests PASS
[ ] production redirects verified
```

Content-Authority der R2 Content-SOT gilt unverändert fort (nur `@/content/public`-Projektion
in öffentlichen Routen; Claim-Gate aus R3 bleibt Regressionsmaßstab).

---

## 8. Abgrenzung zu R5

```text
R4 baut: routes · navigation · hierarchy · redirects · page shells
R5 baut: full page storytelling · image compositions · section-level layouts ·
         detailed content presentation · responsive polish of each subpage
```

Diese Trennung bleibt bestehen. R5 folgt erst nach R4-Abschluss.
