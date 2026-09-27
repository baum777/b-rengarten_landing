# Bärengarten Betrieb — Implementierungs-Mapping

Review-Dokument vom 2026-09-27 („Interner Bereich / Hotel Operating System") →
konkretes Datei-Mapping gegen den Repo-Stand `main` @ `935e9d5`.

Ziel: die bestehende TanStack-Start-App wird um den internen Bereich `/intern/*`
erweitert — keine zweite Anwendung. Öffentliche Website bleibt unangetastet;
die Anfrage-Formulare behalten ihre Server-Function-Signaturen und bekommen nur
Persistenz in den Handlern.

---

## 0. Review-Dokument vs. tatsächlicher Repo-Stand (verifiziert)

Bestätigte Befunde:

| Behauptung im Review | Verifiziert |
|---|---|
| `emailAndPasswordEnabled = false` | ✅ `src/lib/auth/email-password.ts:10` |
| `/login`-Route fehlt, obwohl `SIGN_IN_PATH = "/login"` | ✅ `src/lib/auth/gates.tsx:22` („Create this route") |
| Anfragen werden nicht gespeichert (`requestId`-Return) | ✅ `src/lib/inquiries.ts:52,58,64` |
| Auth-, DB-, Chart-Bausteine vorhanden | ✅ Better Auth, `pg`/Neon + PGLite, Recharts, TanStack Query/Table |
| Kein Rollenmodell | ✅ |
| Design-Tokens Paper/Wine/Green/Charcoal/Brass + Newsreader/Geist/Geist Mono | ✅ `src/styles.css` `@theme` |

Korrektur 1 — Auth ist stärker aktiv als das Review annimmt:
`scripts/with-app-env.mjs` setzt `VITE_AUTH_ENABLED` heute bedingungslos auf
`"true"`. Das Repo läuft also bereits mit aktivem Better Auth (Broker-OAuth via
`genericOAuth`, „Sign in with Grok"). Ausgeschaltet ist nur der lokale
E-Mail/Passwort-Zweig. Für Mitarbeiter-Login muss also kein Auth-System
bootstrappt, sondern nur der E-Mail/Passwort-Pfad geöffnet werden.

Korrektur 2 — Migrations-Nummerierung im Review kollidiert mit Repo-Konvention:
Beide Applier (`scripts/migrate.mjs`, `src/lib/db.ts`) lesen `migrations/`
**flach und nicht-rekursiv**, sortieren nach Basename und keyn auf Basename.
`migrations/auth/0001_auth.sql` (Better-Auth-Schema, camelCase, „DO NOT EDIT")
liegt absichtlich außerhalb und wird beim Aktivieren von Sign-in **1:1 nach
`migrations/0001_auth.sql` kopiert** (so in `scripts/migration-plan.mjs`
vorgesehen; Dedup per Basename macht das idempotent). App-Migrationen starten
daher bei **0002**, flach in `migrations/`.

Korrektur 3 — Shell-Trennung hat bereits ein Muster: `src/routes/__root.tsx`
blendet Footer/Mobile-Bar über `isHome` aus. Für `/intern/*` wird dasselbe
Muster um `isInternal` erweitert statt eine zweite Root zu bauen.

Randnotiz: `submitReservation`/`submitOccasionInquiry` ignorieren die
validierten Daten currently komplett (nur Booking prüft Datum-Logik). Phase 2
behebt das nebenbei, weil die Handler die Daten für den INSERT brauchen.

---

## 1. Verbindliche Repo-Konventionen (Mapping muss diese einhalten)

- **DB-Zugriff:** nur `getSql()` aus `src/lib/db.ts`, server-only, getagte
  Templates sind parameterized. Typ-Parität ist bereits normalisiert:
  `int8 → number`, `date → 'YYYY-MM-DD'`-String, `numeric → string`.
- **Migrationen:** flach `migrations/000N_*.sql`, Tabellen snake_case,
  Fremdschlüssel auf `"user"(id)` mit `user_id TEXT NOT NULL` (TEXT, nicht
  UUID). `migrations/auth/0001_auth.sql` nie editieren, nur kopieren.
- **Server Functions:** Muster `createServerFn().validator(zod).middleware([...]).handler`
  wie `src/lib/inquiries.ts`.
- **Auth-Middleware:** `authMiddleware` (`src/lib/auth/middleware.ts`) liefert
  verifizierte `context.userId` und wirft fail-closed (`UnauthorizedError`),
  auch wenn Auth aus ist und `DATABASE_URL` gesetzt ist — interne Server
  Functions müssen sie (oder eine stärkere Stufe) immer verwenden.
- **Routing:** file-based, `src/routeTree.gen.ts` wird generiert; Layout-Route
  über `src/routes/intern/route.tsx`.
- **Tests:** reine Funktionen als `*.test.ts` neben der Datei (Muster
  `sign-in-gate.test.ts`, laufen via `node --experimental-strip-types --test`);
  Skripte als `*.test.mjs`. Gates: `npm run typecheck`, `npm run test`,
  `npm run lint`, `npm run check:auth`, `npm run build` (führt `db:migrate` aus).
- **Design:** interne UI nutzt dieselben `@theme`-Tokens (kein neues
  SaaS-Theme). Display `--font-display` (Newsreader) bleibt öffentlichen
  Headlines vorbehalten; intern primär `--font-sans`/`--font-mono`,
  `--spacing-control` für Touch-Targets.
- **Nicht anfassen (App-Builder-Infrastruktur, nicht Hoteldomäne):**
  `src/lib/app-data/`, `src/lib/multiplayer/`, `src/lib/preview-*`,
  `server/` (grok-pwa), `src/lib/auth/gate-*`/`preview.ts`.

---

## 2. Phase 1 — Identity & Access

Ziel: `/login`, `staff_profiles`, ADMIN/STAFF-RBAC, geschützte `/intern/*`-Shell.
Authentication (Better Auth) bleibt getrennt von Autorisation (`staff_profiles`);
authentifiziert ohne `staff_profile` → ACCESS_DENIED (fail-closed).

| Element | Repo-Ziel |
|---|---|
| Auth-Schema aktivieren | `migrations/0001_auth.sql` = 1:1-Kopie von `migrations/auth/0001_auth.sql` |
| E-Mail/Passwort einschalten | `src/lib/auth/email-password.ts` → `true`; in `src/lib/auth/server.ts:214` zusätzlich `disableSignUp: true` (keine öffentliche Selbstregistrierung) |
| Rollen-Tabelle | `migrations/0002_staff.sql` → `staff_profiles` (id, user_id TEXT NOT NULL UNIQUE, display_name, role CHECK ∈ {ADMIN, STAFF}, department, active, created_at, updated_at) |
| RBAC-Kern (pure) | `src/lib/permissions/roles.ts` — `can(role, capability)` nach Matrix aus Review §20, `resolveGuardDecision`, `shouldProvisionFirstAdmin`, mit `roles.test.ts` |
| Fehler-Typ | `src/lib/permissions/errors.ts` — `ForbiddenError` (status 403) |
| Server-Resolution | `src/lib/permissions/require-staff.server.ts` — `resolveStaffContext(userId)`: lädt Profil, läuft fail-closed auf `null` bei fehlendem/inaktivem Profil, triggert auf dem Pfad den One-Time-Bootstrap |
| Server-Guards | `src/lib/permissions/guards.ts` — `requireStaff`/`requireAdmin` als Middlewares auf `authMiddleware` (Client-safe-Modul, `.server`-Imports dynamisch im `.server()`-Callback — Muster `authMiddleware`); Import-Schutz des Bundlers verbietet statische `.server`-Imports aus Routen |
| Loader-Resolution | `src/lib/permissions/access.ts` — `loadStaffAccess` (createServerFn, GET) für SSR-Loader |
| Login-Seite | `src/routes/login.tsx` (public; bereits authentifiziert → Rollen-Landing; Form via `authClient.signIn.email`, zusätzlich Broker-Buttons mit `callbackURL: "/intern"`) |
| Auth-HTTP-Mount | `src/routes/api/auth/$.tsx` — **Lücke im Template**: `/api/auth/*` war nirgends gemountet (nur der Preview-Popup-Flow war verdrahtet); ohne den Mount wäre Email/Passwort-Sign-in ein 404 |
| Rollen-Redirect | Server-Loader in `src/routes/intern/route.tsx`: ADMIN → `/intern/dashboard`, STAFF → `/intern/heute`, kein Profil → Denied-Seite |
| Interne Shell | neu `src/routes/intern/route.tsx` (Layout) + `src/components/internal/internal-shell.tsx`, `desktop-sidebar.tsx`, `mobile-nav.tsx` |
| Öffentliches Chrome ausblenden | `src/routes/__root.tsx`: `isHome`-Muster um `isInternal = pathname.startsWith("/intern")` erweitern (kein `SiteHeader`/`SiteFooter`/`MobileActionBar`). Phase-1-Minimum; **mittelfristig** Zielzustand `__root → public layout | intern layout` über TanStack-Layout-Routes statt wachsender `pathname`-Sonderlogik |
| Dezenter Zugang | `src/lib/site.ts` Footer-Eintrag „Mitarbeiter" → `/login`; Header bleibt ohne Eintrag (V1) |

**Owner-Dispositionen (2026-09-27, verbindlich):**

- **Bootstrap erster Admin → `ADOPT: ONE-TIME ENV-BOUND BOOTSTRAP`.**
  `ADMIN_BOOTSTRAP_EMAIL` (Env, nie im Repo) greift nur beim ersten
  erfolgreichen Login, solange `count(ADMIN) === 0` ist: authentifizierte
  Identität + kein `staff_profile` + E-Mail-Match → ADMIN-Profil atomar
  angelegt. Danach ist der Pfad dauerhaft tot — die Env-Variable wird nie zu
  einem dauerhaften Backdoor-Mapping. (Sicherer als eine User-ID in einer
  Migration, weil die Better-Auth-ID vor dem ersten Login nicht existiert.)
- **Provisionierung → `ADOPT: ADMIN-MANAGED / INVITE-ONLY, PUBLIC SIGN-UP
  FORBIDDEN`.** `disableSignUp: true` ist verbindliche Invariante. Ein
  Better-Auth-Login bedeutet ausdrücklich **nicht**, dass jemand Mitarbeiter
  ist; Autorisation liegt ausschließlich in `staff_profiles` (Authority-Key
  `auth.user.id` → `staff_profiles.user_id`, nie E-Mail → Rolle; die
  Bootstrap-E-Mail ist die einmalige Ausnahme). `staff_profiles` speichert
  `email` zusätzlich (informativ, kein Authority-Key) und `created_by`.
  Die Invite-UI (Team-View) landet mit Phase 4; bis dahin existiert kein
  weiterer Profil-Erstellungspfad außer dem One-Time-Bootstrap (bekannte,
  bewusste Phase-1-Limitierung).

**Architecture-Invariante:** `IDENTITY PROVIDER ≠ HOTEL AUTHORIZATION`.
E-Mail/Passwort ist Phase-1-Pragmatik, kein konzeptionelles Koppelelement —
ein späterer IdP-Wechsel (Microsoft/OIDC) tauscht nur die Authentifizierung aus,
`staff_profiles`/Rollen/Permissions/Audit bleiben unverändert.

**Rollenmodell bewusst klein:** Authority-Rollen nur `ADMIN`/`STAFF`.
Abteilungen sind Organisations-Kontext, keine Autorisierung:
`MANAGEMENT, RECEPTION, HOUSEKEEPING, RESTAURANT, SERVICE, KITCHEN, TECHNICAL,
GENERAL` (z. B. Restaurantleiter später `role=ADMIN, department=RESTAURANT`).

**Server-Guards als Phase-1-Primitives** (kein verstreutes `if role === "ADMIN"`):
`requireAuthenticatedUser()` → `resolveStaffContext()` → `requireStaff()`/
`requireAdmin()` → Handler.

**Pflicht-Tests Phase 1 (fail-closed):** signed-out → Unauthorized;
authentifiziert ohne Profil → Forbidden/Denied; authentifiziert mit inaktivem
Profil → Forbidden/Denied; STAFF → ADMIN-Endpoint → Forbidden. Positiv:
ADMIN → ADMIN-Endpoint → PASS.

---

## 3. Phase 2 — „Make public demand durable" (Operational Core)

Ziel: **erst Zuverlässigkeit, dann Oberfläche.** Der Öffentliche Demand (heute
`validate → request id → Ende`) wird dauerhaft in Postgres geschrieben; erst
danach entsteht darauf Task/Dashboard-UI. Migrationen nur dieser Phase:
`0003_inquiries.sql`, `0004_tasks.sql`, `0005_briefings.sql`.

| Element | Repo-Ziel |
|---|---|
| Anfragen persistieren | `migrations/0003_inquiries.sql` → `inquiries` (Felder + `status` CHECK {NEW, REVIEWED, CONTACTED, CONFIRMED, DECLINED, CLOSED}, `payload_json` jsonb) |
| Handler erweitern | `src/lib/inquiries.ts`: INSERT `inquiries` + Event + Task in **einer** SQL-Transaction; Validatoren/Signaturen bleiben → `src/components/forms/inquiry-forms.tsx` unverändert |
| Tasks | `migrations/0004_tasks.sql` → `tasks` + `task_events`; Status/Bereich/Priorität als CHECK-Constraints, gespiegelt als TS-Unions in `src/lib/tasks/types.ts` (+ pure Helper `*.test.ts`) |
| Briefings | `migrations/0005_briefings.sql` → `briefings` + `briefing_reads` (UNIQUE(briefing_id, user_id)) |
| Server Functions | neu `src/lib/tasks/`, `src/lib/briefings/` (Liste/Übernehmen/Erledigt/Bestätigen, je mit `requireStaff`/`requireAdmin` nach Matrix) |
| „Heute" | `src/routes/intern/heute.tsx` + `task-card.tsx`, `briefing-card.tsx`; Quick-Actions-Drawer über `vaul` (bereits in deps) |
| Anfragen-Workflow | `src/routes/intern/anfragen.tsx` (Statuswechsel ADMIN, Statusübergänge als pure Function getestet) |

Mobile-first: 390×844 als Primärgröße, eine Primäraktion je Card, keine
Tabellen im Staff-Mobile (TanStack Table nur im Admin-Desktop).

---

## 4. Phase 3 — Operational Ledger

`operational_events ≠ audit_log` — zwei Semantiken, nie zusammenwerfen:

- **Operational Event** („Was ist im Betrieb passiert?"): `type`, `source`,
  `entity_type`, `entity_id`, `payload` — z. B. `inquiry.created` von `website`.
- **Audit Event** („Wer hat eine kontrollierte Änderung vorgenommen?"):
  `actor`, `action`, `resource`, `previous_state`, `new_state`, `timestamp`.

Später kann Unitera aus beiden lesen, aber ihre Semantik bleibt getrennt.

| Element | Repo-Ziel |
|---|---|
| Event-Ledger | `migrations/0006_operational_events.sql` → `operational_events` (Felder laut Review §13; Index auf `occurred_at`, `correlation_id`) |
| Append-Helper | neu `src/lib/events/append-event.ts` — innerhalb der Transaktion des auslösenden Handlers, `event_type`-Namensraum `hotel.*`/`task.*`/`briefing.*` |
| Input/Internal/Output | `direction` CHECK {INBOUND, INTERNAL, OUTBOUND} + `source`; Klassifikation als pure Function + Test |
| Activity Feed / Datenflüsse | `src/routes/intern/datenfluesse.tsx` (ADMIN) + `src/components/internal/activity-feed.tsx` |

---

## 5. Phase 4 — Admin Intelligence

| Element | Repo-Ziel |
|---|---|
| Auslastung | `migrations/0007_occupancy.sql` → `occupancy_snapshots` (`occupancy_rate` als `numeric` → kommt als String zurück, bewusst handhaben) |
| KPI-Queries | neu `src/lib/analytics/` — Auswertung primär über `operational_events` (Conversion, Bearbeitungszeit, Offene/Überfällige), nicht über starre Tabellen |
| Views | `intern/dashboard.tsx`, `intern/auslastung.tsx`, `intern/team.tsx`, `intern/auswertung.tsx` |
| Charts/Tabelle | `occupancy-chart.tsx` (Recharts, in deps), `kpi-card.tsx`; TanStack Table für Admin-Desktop |

---

## 6. Phase 5 — Integrations Layer (später, Owner-Gate)

PMS/HelloGuest/Mews, E-Mail, Kalender → als **Producer in denselben
Event-Layer** (`integration_runs`-Tabelle, dann Events), nicht direkt in die UI.
Unitera-Pilot später über denselben Layer. Kein Datei-Mapping in dieser Phase.

---

## 7. Validierung & Deployment

Pro Phase (Minimum):

```bash
npm run typecheck && npm run test && npm run lint
npm run check:auth   # Dev/Build-Flag-Invarianz
npm run build        # inkl. db:migrate gegen DATABASE_URL
```

Phase 1 zusätzlich: die Negativ-Tests aus §2 als explizite Cases.

Vercel-Env für Produktion: `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`. `VITE_AUTH_ENABLED` bleibt wie vom Wrapper gesetzt. Hinweis:
PGLite-Preview vergisst Daten beim Prozess-Neustart — Betriebsdaten nur in
Neon prüfen, nie aus der Preview schlussfolgern.

## 8. Phase-1-Contract (gefroren 2026-09-27, Owner-Dispositionen eingearbeitet)

```text
PHASE 1 — IDENTITY & ACCESS

IN
✓ Better Auth production schema (0001_auth.sql Kopie)
✓ /login
✓ email/password capability
✓ public signup disabled (disableSignUp — verbindliche Invariante)
✓ one-time first-admin bootstrap (ADMIN_BOOTSTRAP_EMAIL, adminCount===0)
✓ staff_profiles (Authority: user_id; email nur informativ; created_by)
✓ ADMIN / STAFF als einzige Authority-Rollen
✓ department metadata (Organisations-Kontext, keine Authority)
✓ active/inactive accounts
✓ requireStaff() / requireAdmin() Guards
✓ /intern route protection
✓ role-based landing redirect
✓ InternalShell
✓ negative auth/RBAC fixtures

OUT
✗ inquiries persistence (Phase 2)
✗ tasks (Phase 2)
✗ briefings (Phase 2)
✗ dashboards (Phase 2+; Phase-1-Landeseiten sind Platzhalter)
✗ metrics (Phase 4)
✗ operational events (Phase 3)
✗ PMS / E-Mail-Integration (Phase 5)
✗ Unitera integration (Phase 5)
```

Redirect-Contract:

```text
/login
  ↓
authenticated
  ↓
resolveStaffContext
  │
  ├─ ADMIN
  │    → /intern/dashboard
  │
  ├─ STAFF
  │    → /intern/heute
  │
  └─ NONE / INACTIVE
       → /intern/kein-zugriff
```

Geschlossene Dispositionen: Bootstrap = `ONE-TIME ENV-BOUND BOOTSTRAP`;
Provisionierung = `ADMIN-MANAGED / INVITE-ONLY, PUBLIC SIGN-UP FORBIDDEN`.
Kein Owner-Gate blockiert Phase 1 mehr.

## 9. Implementierungsstand Phase 1 (2026-09-27)

Umgesetzt auf Working Tree (nicht committet; Commit = separates Gate).

**Dateien:** `migrations/0001_auth.sql` (verbatim-Kopie, byte-identisch
geprüft), `migrations/0002_staff.sql`, `src/lib/permissions/{roles,roles.test,errors,bootstrap.server,require-staff.server,guards,access}.ts`,
`src/routes/login.tsx`, `src/routes/api/auth/$.tsx`, `src/routes/intern/{route,index,dashboard,heute,kein-zugriff}.tsx`,
`src/components/internal/internal-shell.tsx`; geändert: `email-password.ts`
(Flag an), `auth/server.ts` (`disableSignUp: true`), `__root.tsx`
(`isInternal`), `footer.tsx` (Mitarbeiter-Link), `package.json` (Tests),
`scripts/migration-plan.test.mjs` (Invariante auf „Sign-in an" umgestellt).

**Gates:**

| Gate | Ergebnis |
|---|---|
| `npm run build` (inkl. routeTree-Regen, `db:migrate`) | PASS |
| `npm run typecheck` | PASS |
| RBAC-Unit-Tests (`roles.test.ts`) | 13/13 PASS (alle 4 Pflicht-Negativ-Invarianten + Positiv abgedeckt) |
| `migration-plan.test.mjs` | 7/7 PASS (inkl. Byte-Identität der Auth-Schema-Kopie) |
| `npm run lint` | eigene Files 0 Befunde; 6 Befunde präexistent (HEAD-Worktree verifiziert; u. a. `app-data/client.server.ts` no-empty) |
| Runtime: `/intern`, `/intern/dashboard` signed-out | 307 → `/login` (fail-closed am Route-Guard) |
| Runtime: `/`, `/login` | 200, öffentliche Seite inkl. Chrome intakt |
| Runtime: POST `/api/auth/sign-up/email` | HTTP 400 `EMAIL_PASSWORD_SIGN_UP_DISABLED` — öffentliche Selbstregistrierung serverseitig abgewiesen |
| Runtime: POST `/api/auth/sign-in/email` (unbekannte Identiät) | HTTP 401 `INVALID_EMAIL_OR_PASSWORD` — Sign-in-Pfad lebendig, kein 404 |
| `check:auth` | nicht lauffähig ohne Dev-Server-Vergleich (exit 2) — im Browser-Smoke-Regime abdecken |

**Bekannte Limitierungen (bewusst, im Contract):**

1. **Erster Login braucht eine echte Identität.** Mit `disableSignUp` kann
   sich lokal kein Konto selbst erstellen; der One-Time-Bootstrap greift beim
   ersten Login des Owners über Broker-OAuth (Deploy/Preview mit injizierten
   `GROK_AUTH_*`). Lokaler E2E-Login ist erst nach Bootstrap/Provisionierung
   möglich. `ADMIN_BOOTSTRAP_EMAIL` muss im Deploy-Env gesetzt sein.
2. **Provisionierung weiterer Mitarbeiter** (Team-View, Invite) kommt mit
   Phase 4; bis dahin existiert kein weiterer Profil-Erstellungspfad.
3. `.grok/app-env.json` ist Platform-Scaffolding (gitignored): im Deploy-
   Workspace muss `VITE_AUTH_ENABLED` auf `true`/entfallen stehen, sonst
   schaltet der Wrapper Auth ab (Server wirkt fail-closed, Intern unbenutzbar).
4. Der Broker-Login-Pfad (`authClient.signIn.oauth2`) benötigte den
   Auth-HTTP-Mount ebenfalls — der neu gesetzte `api/auth/$`-Route repariert
   dessen Grundlage mit.
