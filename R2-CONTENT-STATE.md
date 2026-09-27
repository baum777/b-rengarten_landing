# R2 — Content State System

Run date: 2026-09-27 · Branch: `main` · Baseline: `841476b` (R1.1)
Ziel: faktische Autorität der öffentlichen Inhalte explizit, typisiert und
strukturell gegen Leaks nicht-freigegebener Betreiber-Aussagen gesichert.
Kein visuelles Redesign (R3 ausdrücklich nicht begonnen).

---

## 1. Modell (`src/content/types.ts`)

Drei bewusst getrennte Dimensionen (nicht zu einem Status kollabiert):

```text
truthState       PROPERTY_TRUTH | TRANSITIONAL | OPERATOR_STATE
publicationState LIVE | HOLD | HIDDEN
requirement      OPTIONAL | OPERATIONAL | LEGAL_REQUIRED
```

`ContentFact<T>` trägt key/value, alle drei States, optionale Quelle
(`sourceLabel`/`sourceUrl`), `verifiedAt` und `note`. Projektionshelfer:
`liveFact()` (null für nicht-LIVE) und `liveFactOrThrow()` (lauter Fehler,
falls ein strukturell benötigter Fakt nicht mehr LIVE ist).

## 2. Domänen

```text
property.ts      Stabile Truth: Adresse, Geo, 12 Zimmer, 1 Suite, Umbau 2009,
                 Anbau 2018, Garten/Kastanie, Architektur, Veranstaltungs-
                 geschichte. LIVE; Adresse LEGAL_REQUIRED (Impressum).
transitional.ts  Quellengestützt, aber unverifiziert — durchgängig HOLD:
                 14.000-L-Biertank (HOLD UNTIL PHYSICAL VERIFICATION),
                 Parken, Barrierefreiheit-Details, Telefon, allgemeine
                 E-Mail (REMOVE UNLESS CONFIRMED, Legacy bewusst gelöscht),
                 legale E-Mail (LEGAL_REQUIRED + HOLD → F1.1/R1.1).
operator.ts      Betreiber-kontrolliert, durchgängig OPERATOR_STATE + HIDDEN,
                 value=null: Öffnungszeiten, Check-in/out, Frühstück, Menü,
                 Preise, Hunde, Zimmerklassen, Wirt-Versprechen. Kein Wert
                 wird aus Altbeständen restauriert.
public.ts        EINZIGE öffentliche Projektion. Importiert NUR property.ts —
                 nicht freigegebene Fakten können strukturell nicht leaken.
                 Kuratierter Public-Text (FAQ, Anlässe, menuNotice) lebt hier.
```

Kodierte Owner-Dispositionen: Biertank HOLD (physische Verifikation nötig),
Telefon/E-Mail HOLD (nur nach Bestätigung), Speisekarte neutral mit
`menuNotice`, Kontakt/Anreise-IA und Rutenfest unverändert R4/R5 vorbehalten.

## 3. Fassade + Konsumenten-Migration

`src/lib/site.ts` ist jetzt UI-Chrome (nav/images) + Re-Export der Projektion;
`site` = `publicContent`. Echte Migrationen (Fakten fließen aus der Quelle):

```text
faq.tsx, anlaesse.tsx      importieren faqs/occasions direkt aus @/content/public
hotel/index.tsx, zimmer.tsx  Headline aus publicContent.roomHeadline
                           („12 Zimmer. Eine Suite." abgeleitet aus
                           roomCount=12/suiteCount=1 statt hardcodiert)
```

Die Meta-Description von `/hotel` behält den Prosa-Satz „12 Zimmer und eine
Suite" (bewusst; wird vom Claim-Gate am Build-Output mitgeprüft und in R3
facettenreich ersetzt).

## 4. Tests / Invarianten

`src/content/content-state.test.ts` (9/9 PASS):

- PROPERTY_TRUTH+LIVE → über Projektion exponiert (12/1/Adresse)
- TRANSITIONAL+HOLD → nicht exponiert (Biertank: „14.000"/„Biertank" fehlen)
- OPERATOR_STATE → alle Slots HIDDEN, kein key in der Projektion
- LEGAL_REQUIRED → explizit modelliert, nicht als Marketing gefiltert
- `liveFactOrThrow` wirft bei nicht-LIVE (fail loud)
- R1-Regression: „Komfort"/„Business"/„Junior Suite"/„Zwiebelrostbraten"/
  „Maultaschen" tauchen in der Projektion NICHT auf
- menuNotice für den neutralen Speisekarten-Zustand vorhanden

`scripts/content-boundary.test.mjs` (3/3 PASS, deterministischer Scan):

- src/routes/**, src/components/{site,sections,forms}/** importieren niemals
  content/operator|transitional
- public.ts importiert weder operator noch transitional (negativ)
- public.ts importiert property (positiver Kontrolltest gegen Vakuität)

## 5. Validierung

```text
typecheck   PASS
tests       scripts-Glob: 198/182/16 (identische 16er-Präexistenz-Baseline
            .grok-Scaffolding + 3 neue boundary-Tests) · src-Hälfte: 79/79
            PASS. Hinweis: `npm test` verkettet die Hälften mit &&, die
            src-Hälfte läuft nur, wenn die (hier präexistent rote) Glob-
            Hälfte grün ist — beide Hälften wurden getrennt ausgeführt.
lint        alle R2-Dateien CLEAN
check:auth  PASS („dev and build agree: sign-in on")
build       PASS (nitro/vercel → .vercel/output)
claim gate  gebaute Bundles: 0 verbotene Claims; „12 Zimmer", „Schützen-
            straße 21", „Karte entsteht" vorhanden
dev smoke   /hotel/zimmer: Headline via Projektion, 0 Klassen-Claims ·
            /restaurant/speisekarte: 0 Gerichte-Claims, menuNotice da ·
            0 phone/email · Signup-Proben weiter 400 (same-origin) /
            403 (cross-origin) nach R2 unverändert
```

## 6. Geänderte Dateien (Commit B)

```text
R2-CONTENT-STATE.md                 neu (dieses Dokument)
src/content/types.ts                neu — TruthState/PublicationState/RequirementState
src/content/property.ts             neu — LIVE-Domäne
src/content/transitional.ts         neu — HOLD-Domäne (inkl. Biertank-Disposition)
src/content/operator.ts             neu — HIDDEN-Domäne (Slots, value=null)
src/content/public.ts               neu — einzige öffentliche Projektion
src/content/content-state.test.ts   neu — 9 Invarianten-/Regressions-Tests
src/lib/site.ts                     Fassade (Chrome + Re-Export)
src/routes/faq.tsx                  Quelle → @/content/public
src/routes/anlaesse.tsx             Quelle → @/content/public
src/routes/hotel/index.tsx          Headline aus roomHeadline
src/routes/hotel/zimmer.tsx         Headline aus roomHeadline
scripts/content-boundary.test.mjs   neu — Import-Grenze
package.json                        Test-Liste + content-state.test.ts
```

## 7. Nächste Gates

```text
R3  Homepage-Redesign AUSSCHLIESSLICH auf dieser Content-SOT — kein
    Content-Wahrheits- und Layout-Decisioning mehr im selben Zug.
Owner  Freigaben je Fakt: publicationState-Flip in der besitzenden Domäne
       + Aufnahme in public.ts; Impression der Quellenpflichten (§5 DDG
       E-Mail: R1.1 F1.1) bleibt unberührt.
```
