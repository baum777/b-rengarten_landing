-- Staff profiles: the hotel AUTHORIZATION layer, deliberately decoupled from
-- Better Auth identity (0001_auth.sql).
--
-- Authority key is the Better Auth user id ("user"."id", TEXT) via user_id.
-- email is stored for human reference but is NEVER an authority key
-- (email -> role is forbidden); the one-time ADMIN_BOOTSTRAP_EMAIL match in
-- src/lib/permissions/bootstrap.server.ts is the single, admin-count-bound
-- exception. A valid login WITHOUT an active staff_profiles row is denied on
-- every guarded path (fail closed) — see
-- src/lib/permissions/require-staff.server.ts.
--
-- role is the only authority axis (ADMIN | STAFF). department is
-- organizational context, never authorization.

create table if not exists staff_profiles (
  id text primary key,
  user_id text not null unique references "user" ("id") on delete cascade,
  email text not null,
  display_name text not null,
  role text not null check (role in ('ADMIN', 'STAFF')),
  department text not null check (department in (
    'MANAGEMENT',
    'RECEPTION',
    'HOUSEKEEPING',
    'RESTAURANT',
    'SERVICE',
    'KITCHEN',
    'TECHNICAL',
    'GENERAL'
  )),
  active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_profiles_role_idx on staff_profiles (role);
