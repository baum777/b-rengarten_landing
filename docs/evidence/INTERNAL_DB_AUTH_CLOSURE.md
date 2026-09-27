# Bärengarten Internal DB/Auth Closure

Date: 2026-09-27  
Task: BG-DB-AUTH-CLOSURE-20260927  
Verdict: **PARTIAL**  
Repository: https://github.com/baum777/b-rengarten_landing  
Branch: `codex/internal-db-auth-closure`  
Start SHA: `b2f02a53f3b9ac229f8130dd2ad0ed447d44e5ca`  
Implementation commit: `91b2ced20fa057a82c9c1c43c8fe72e547bfeb72`  
Implementation tree: `916cc9599ea1274288fb612fed0753e75830a587`  
PR: [#3, DRAFT](https://github.com/baum777/b-rengarten_landing/pull/3)

This report records a verified local PostgreSQL implementation candidate. It does
not attest a provisioned cloud database, production staff account, READY preview,
merge, adoption, or activation. Documentation-only successors can be resolved
with `git log -- docs/evidence/INTERNAL_DB_AUTH_CLOSURE.md`.

## Owner / scope

Product-owned database/auth/operational surfaces; implementation and validation
work, elevated risk because identity, permissions and persistent data are involved.
The current user closure mandate extends the existing phase-1 implementation map.
No repo-local AGENTS.md was present. Root AGENTS.md and README.md were read first.

Reusable-surface decision: **repo-local acceptable**. This is the hotel's product
data model. The existing SQL adapter, migration-plan helper and server RBAC guards
are reused; active shared-core and other product repositories are untouched.

Protected surfaces: public design/assets/content, preview gate identity,
`src/lib/app-data/`, multiplayer, other repos, dependency versions, root gitlinks,
and production state. The original checkout remains on its original main SHA;
its `.mimosa/` and `R4-INFORMATION-ARCHITECTURE-SPEC.md` work was preserved.

Worktree: `/home/baum/workspace/baum-os/projects/b-rengarten-closure`. The five
implementation commits separate database, auth, public inquiries, internal views,
and tests. Review here was a source/diff self-check plus reproducible tests;
**no independent-review or owner-approval claim** is made.

## Database

- Provider verified: local native PostgreSQL, **18.6**, dedicated test cluster.
- Database: `baerengarten_test`; connection smoke and application queries passed.
- Socket directory: `/home/baum/workspace/baum-os/runtime/baerengarten-closure`.
- Port: 55439; no TCP listener, host authentication rejected.
- Inventory test schema: `closure_2343b7c9134d487494e5e1670944206a`.
- Test role: `baum`, superuser in the isolated test cluster only. Production
  least-privilege roles have not been configured or qualified.
- Cloud provider/database/connection: **BLOCKED_OWNER_INPUT**. Connected Supabase
  projects were inspected; none belongs to Bärengarten and none was modified.
- No connection string or credential value is recorded in this document.

Native PostgreSQL and psql were used as the runtime-equivalent DB interface
required by the mandate. PGLite was additionally checked for local compatibility
only; it is not a production source of truth.

## Schema / migration evidence

Flat, versioned migration source remains `migrations/*.sql`; auth schema is not
duplicated. Existing `0001_auth.sql` and `0002_staff.sql` were preserved.

| Migration | Result / purpose |
| --- | --- |
| 0001_auth.sql | Existing Better Auth user/session/account/verification |
| 0002_staff.sql | Existing user-id-bound ADMIN/STAFF profiles |
| 0003_operational_core.sql | Additive operational tables, bootstrap sentinel, CLI admin-plugin columns, indexes and history protections |
| 0004_data_api_boundary.sql | Revoke direct table access from PUBLIC and, where present, provider anon/authenticated roles |

Fresh database: PASS. Existing phase-1 database with an admin: PASS; identity and
profile preserved, bootstrap starts closed. Concurrent migrators: PASS. Second
run: no replay. Each file and its ledger record commit together under a
transaction-level PostgreSQL advisory lock, including an under-lock replay check.
This also avoids reliance on session locks through transaction-pooling providers.

Direct psql inventory verified **15 tables, 32 CHECK constraints, 11 foreign keys,
15 primary keys, 4 unique constraints, 40 indexes** (including constraint indexes).
PostgreSQL 18 additionally reports NOT NULL constraints. PUBLIC SELECT is absent
on all 15 tables. Conditional provider-role revocations are implemented; they
must be reverified on the actual chosen cloud provider.

Tables: `user`, `session`, `account`, `verification`, `staff_profiles`,
`bootstrap_state`, `inquiries`, `tasks`, `task_events`, `briefings`,
`briefing_reads`, `operational_events`, `occupancy_snapshots`, `audit_log`,
`_migrations`.

Role, department, status, priority, direction, date and numeric constraints are
relational. JSONB is bounded optional inquiry detail/event metadata, not an
identity or authorization store. Invalid enum and foreign-key writes fail.
`task_events`, `operational_events`, and `audit_log` reject UPDATE, DELETE and
TRUNCATE through DB triggers; normal app APIs expose no history-rewrite path.
Privileged operators who change schema/triggers remain outside that protection.

Index coverage follows actual list/filter/history queries: staff user/role,
inquiry status/date/type, task status/assignee/due date/department, task history,
briefing visibility/reads, event type/entity/correlation, daily occupancy and
audit actor/entity. The existing unique staff user_id index is reused.

Migrations are additive. No tables or user data were dropped in an existing
application database. Roll-forward is the remediation posture; do not delete a
ledger row to replay an already-applied schema file. Provider backup/restore and
production query plans are not qualified by these local tests.

## Auth / authority

- Existing app Better Auth **1.6.30**, email/password; public signup remains
  disabled. HTTP signup denied in the real browser smoke.
- Server `requireStaff`/`requireAdmin` guards and transactional profile rechecks
  deny anonymous users, missing/inactive profiles, STAFF admin reads, arbitrary
  actor inputs and cross-user task mutations.
- `staff_profiles.user_id` is the authority key; email and department are not.
  Existing controlled department names were retained instead of renaming the
  owner model to the preferred examples in the mandate.
- Cookie caches do not bypass current staff authorization. Real-browser
  deactivation with an existing session cookie denied further internal access.
- Auth login ledger actors are USER, not implicitly STAFF.

### Bootstrap

`bootstrap_state` is a single locked row. CLI and verified-existing-identity
bootstrap both serialize on it, check current admins, write profile and audit,
and mark it closed in the same transaction. Losing the admin profile afterwards
does not reopen bootstrap. Tests cover missing env, wrong email, parallel
requests (exactly one success), second attempt and permanent closure.

The offline operator creates the initial email/password identity through the
supported Better Auth server API, exactly matching normalized
`ADMIN_BOOTSTRAP_EMAIL`. This is an operator identity-establishment action, not
public email ownership verification. The login-triggered path additionally
requires an already authenticated **verified-email** identity.

### Controlled employee provisioning

`npm run staff:bootstrap` and `npm run staff:provision` use
`scripts/provision-staff.mjs`. JSON arrives on protected stdin, never password
arguments, source files or application logs. Input keys: `email`, `name`,
`password`, `department`; STAFF provisioning additionally takes `actorId` for
an existing active ADMIN. That actor assertion is permitted only in this offline
operator/DB-credential plane; it is not exposed as a public creation endpoint.

Required securely supplied env: `DATABASE_URL`, `BETTER_AUTH_SECRET` (at least
32 characters), and for bootstrap `ADMIN_BOOTSTRAP_EMAIL`.
The Better Auth admin plugin exists **only in this CLI factory**, not in the
app's HTTP auth instance. User and credential creation use `auth.api.createUser`
against a transaction-pinned dialect. Profile, audit and operational event share
that transaction. Injected audit failure proved no user/account survives rollback.
Password hashing was verified; neither plaintext passwords nor tokens enter audit
or event payloads. Hotel roles remain independent of the plugin's user.role field.

Admin staff role/deactivation mutations are audited. The last active admin cannot
be deactivated/demoted by these APIs. Deactivation deletes sessions and current
profile checks deny cached identities immediately.

## Operational flow

Public ROOM/TABLE/OCCASION handlers retain their signatures and add bounded,
strict Zod validation. A successful request commits:

1. relational inquiry;
2. minimal operational event;
3. unassigned follow-up task;
4. task history and task operational event, with shared inquiry correlation ID.

Any failed step rolls the whole workflow back. The real anonymous booking form
was submitted to the running application and all DB/event/task records verified.
No fake production booking was created. Events carry IDs and state metadata,
not a duplicate of guest contact fields or unrestricted form input.

Only ADMIN can create/assign tasks, publish briefings, change staff roles and
record occupancy through internal server functions. STAFF can change its own
assigned task through the allowed state machine and acknowledge visible
briefings. Briefing acknowledgments are unique and do not duplicate events.
Briefings are separate information records, not tasks.

`/intern/heute` reads real own open tasks, urgency/due-today flags and visible
briefings/read status, as mobile cards. `/intern/dashboard` is server-admin-guarded
and reads inquiries, open/overdue/completed tasks, active staff and daily occupancy.
Business-day comparisons use Europe/Berlin. Missing occupancy/arrivals/departures
remain null / **Keine Daten**, distinct from measured zero. Manual occupancy
entry is available through an admin server function; no PMS integration is claimed.

## Tests / verification

Runtime: Node 24.19.0; locked dependencies: Better Auth 1.6.30, pg 8.23.0,
Kysely 0.28.17, Vite 8.2.2. No dependency/toolchain upgrade was introduced.

| Command / gate | Actual result |
| --- | --- |
| `git diff <start-sha> --check` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` locally | PASS; local deployment migrator skips unset DATABASE_URL, separate native PostgreSQL migration tests provide DB proof |
| eslint on changed source/test files | PASS |
| `npm run test:db`, TEST_DATABASE_URL securely set | 10/10 PASS; zero skips |
| `npm run test:db`, env missing | Expected exit 2; cannot silently claim DB verification |
| Package TypeScript test command, executed separately | 82/82 PASS |
| `npm test` with PostgreSQL test env | 160/168 PASS, 8 FAIL; PARTIAL |
| Unchanged base `b2f02a5`, `npm test` | 150/158 PASS, same 8 FAIL |
| `npm run lint` | FAIL: existing `src/lib/app-data/client.server.ts:281` no-empty plus 5 existing warnings |
| `npm run test:internal` | PASS, real 390x844 STAFF browser + ADMIN browser + anonymous public form |
| PGLite local migration compatibility | Four flat migrations PASS; not production evidence |
| psql connection/inventory queries | PASS, local DB identity/table/constraint/index/ledger/ACL inventory |

The eight baseline failures are four missing ignored `.grok` skill/document
fixtures (`brand-check.test.mjs`, `write-atomic.test.mjs`) and four old auth-off
assumptions (`check-auth-invariant.test.mjs`, `with-app-env.test.mjs`). They were
reproduced in an untouched worktree of the exact start SHA. No tests were weakened
and no fabricated platform fixtures were added. The TypeScript test segment was
run separately because the first failed script segment stops `npm test`.

Environment limitations inspected: sandbox socket binding/process test failures,
exhausted Linux file watchers (ENOSPC), and absent matching Playwright bundled
browser. The native cluster/browser tests ran with reviewed local socket/process
permissions, CHOKIDAR_USEPOLLING=true, and installed Google Chrome via
SMOKE_BROWSER_PATH. These are reported execution choices, not silent substitutions.

Runtime logs (local, generated, untracked):
`/home/baum/workspace/baum-os/runtime/baerengarten-closure/` contains
`db-tests-final.log`, `ts-unit-tests-final.log`, `smoke-final.log`,
`smoke-server.log`, `build-final.log`, `tests-final.log`, `baseline-tests.log`,
`lint-final.log`, `inventory.sql`, and `db-inventory.log`.

## Vercel

Project: `baerengarten-landing`, team `forgedfromwood`.
Preview at implementation SHA 91b2ced20fa057a82c9c1c43c8fe72e547bfeb72:

- Deployment: `dpl_EFbvue41LWU8H2XJ7cqfu8D5wTZA`
- State: **ERROR**, not READY.
- [Build inspection](https://vercel.com/forgedfromwood/baerengarten-landing/EFbvue41LWU8H2XJ7cqfu8D5wTZA)
- Build logs: application bundles successfully, then deployment migration exits 1:
  `[migrate] DATABASE_URL_REQUIRED for deployed operational data.`

Preview env names: none. Production env names: BETTER_AUTH_URL only.
No DATABASE_URL, BETTER_AUTH_SECRET or ADMIN_BOOTSTRAP_EMAIL is configured there.
MCP deployment listing worked; build-log MCP returned tool-not-found, so CLI
`vercel inspect <preview> --logs --scope forgedfromwood` supplied the error evidence.
No active public deployment was changed or promoted; the old main deployment
still showed READY when queried. Its READY state is not this closure's DB proof.
Cloud `/`, `/login`, `/intern` smoke is skipped because this preview is not READY.

The attempt to configure a generated sensitive auth secret solely for this branch
was rejected by automatic approval review before execution. No secret was set.
The stated reason was missing explicit authorization for generating that credential
and writing it to the particular external destination. The explicit permission
question remains open; no alternative path bypassed that rejection.

## Acceptance gates

| Gate | Local candidate | Cloud/overall posture |
| --- | --- | --- |
| G1 PostgreSQL exists | PASS | Dedicated cloud DB missing |
| G2 app connection | PASS | Cloud connection unverified |
| G3 migrations | PASS | Not applied in cloud |
| G4 Better Auth schema | PASS | Local real login only |
| G5 staff / RBAC | PASS | Local positive/negative gates |
| G6 secure bootstrap | PASS | No real owner bootstrap performed |
| G7 signup disabled | PASS | App/browser verified |
| G8 provisioning path | PASS | Offline CLI; real owner setup pending |
| G9 inquiries | PASS | Native PG + real anonymous form |
| G10 tasks | PASS | Native PG + real STAFF actions |
| G11 briefings | PASS | Native PG + real acknowledgment |
| G12 operational ledger | PASS | Inquiry/task/briefing/auth events verified |
| G13 occupancy model | PASS | Controlled local manual fixture, no PMS claim |
| G14 audit | PASS | Atomic creation, role/deactivation and append-only tests |
| G15 dashboard DB queries | PASS | Real browser and DB, unknown values preserved |
| G16 staff mobile DB queries | PASS | Real mobile browser |
| G17 typecheck/test/build green | PARTIAL | Typecheck/build/scoped lint PASS; inherited full-suite/full-lint failures |
| G18 Vercel preview READY | BLOCKED | Missing DATABASE_URL; auth secret and owner email also unset |
| G19 no Grok employee-auth dependency | PASS | Existing invariant tests and real login surface pass; isolated platform gate is not employee provisioning |
| G20 committed evidence | This document | Resolve its documentation commit from git history |

## Remaining owner inputs / next gate

1. Choose the cloud provider/connection; if using Supabase, explicitly select the
   organization (the tool requires this), then review its quoted project cost.
2. Supply the actual ADMIN_BOOTSTRAP_EMAIL. No owner email was guessed.
3. Authorize creating a new random sensitive BETTER_AUTH_SECRET in
   `forgedfromwood/baerengarten-landing`, Preview only, branch
   `codex/internal-db-auth-closure`; automatic review specifically required it.

These block cloud configuration only; authorized local implementation, validation,
commits and draft delivery have been carried out. G17's inherited failures remain
an explicit repository qualification gap, not a request to invent missing sources.

Fresh re-entry: verify PR head, clean worktree, branch and source SHA before any
write. Resolve the cloud provider first; discover the real connection/role/schema
without printing credentials, migrate and directly verify it, configure the scoped
env, establish the real initial account through protected operator stdin, and
repeat preview/login/RBAC gates at the exact deployment SHA. Keep PR draft until
required gates pass. Do not merge, adopt or promote automatically.

## Files read

Workspace/mandate frontdoors:

- `/home/baum/workspace/baum-os/AGENTS.md`
- `/home/baum/workspace/baum-os/README.md`
- `/home/baum/.codex/attachments/01510b11-a050-4ac4-935e-8347c38b7d4e/pasted-text.txt`
- `/home/baum/workspace/baum-os/scripts/workspace-path-guard.sh`

Repo sources below were read in the isolated worktree unless explicitly stated:

- `README.md`, `INTERN-IMPLEMENTATION-MAPPING.md`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `.prettierrc`, `vite.config.ts`
- `migrations/0001_auth.sql`, `migrations/auth/0001_auth.sql`, `migrations/0002_staff.sql`
- `scripts/migrate.mjs`, `scripts/with-app-env.mjs`, `scripts/check-auth-invariant.mjs`
- `scripts/check-auth-invariant.test.mjs`, `scripts/with-app-env.test.mjs`, `scripts/write-atomic.test.mjs`
- `src/lib/db.ts`, `src/lib/inquiries.ts`
- `src/lib/auth/server.ts`, `src/lib/auth/verify.server.ts`, `src/lib/auth/pglite-dialect.ts`, `src/lib/auth/gate-session.server.ts`
- `src/lib/permissions/bootstrap.server.ts`, `src/lib/permissions/require-staff.server.ts`, `src/lib/permissions/guards.ts`, `src/lib/permissions/roles.ts`, `src/lib/permissions/access.ts`
- `src/routes/login.tsx`, `src/routes/api/auth/$.tsx`, `src/routes/intern/route.tsx`, `src/routes/intern/index.tsx`, `src/routes/intern/dashboard.tsx`, `src/routes/intern/heute.tsx`
- `src/components/ui/button.tsx`, `src/components/forms/inquiry-forms.tsx`
- `node_modules/better-auth/dist/plugins/admin/routes.mjs` (installed supported API implementation)

Applied instructions: database-engineering skill; Supabase skill for DB discovery;
UI root/baseline UI for the existing-component mobile views; Vercel env/deployment
skills and Playwright guidance for controlled runtime checks. Skills were read from
their configured local paths; no skill or memory surface was modified.

## Files changed

All source paths below are relative to the owning worktree
`/home/baum/workspace/baum-os/projects/b-rengarten-closure/`:

- `migrations/0003_operational_core.sql`
- `migrations/0004_data_api_boundary.sql`
- `package.json`
- `scripts/bootstrap.d.mts`
- `scripts/bootstrap.mjs`
- `scripts/db-integration.test.mjs`
- `scripts/internal-smoke.mjs`
- `scripts/migrate.mjs`
- `scripts/operations.d.mts`
- `scripts/operations.mjs`
- `scripts/provision-staff.mjs`
- `scripts/provisioning.mjs`
- `scripts/run-db-tests.mjs`
- `src/lib/auth/server.ts`
- `src/lib/db.ts`
- `src/lib/inquiries.ts`
- `src/lib/operations/functions.ts`
- `src/lib/operations/inquiry.server.ts`
- `src/lib/permissions/bootstrap.server.ts`
- `src/routes/intern/dashboard.tsx`
- `src/routes/intern/heute.tsx`

- `docs/evidence/INTERNAL_DB_AUTH_CLOSURE.md` (this record)
