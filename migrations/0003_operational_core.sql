-- Additive operational foundation. Roll forward; do not drop populated tables.
create table bootstrap_state (id boolean primary key default true check(id), closed_at timestamptz);
insert into bootstrap_state(id,closed_at) values(true,case when exists(select 1 from staff_profiles where role='ADMIN') then now() end);
create index staff_profiles_role_active_idx on staff_profiles(role,active);
-- Better Auth admin plugin is used only by the offline provisioning CLI.
alter table "user" add column role text default 'user', add column banned boolean default false,
 add column "banReason" text, add column "banExpires" timestamptz;
alter table session add column "impersonatedBy" text;
create table inquiries (
 id text primary key, request_id text not null unique,
 type text not null check(type in ('ROOM','TABLE','OCCASION')),
 guest_name text not null check(length(guest_name) between 2 and 160),
 email text not null check(length(email)<=254), phone text check(length(phone)<=60),
 arrival date, departure date, guest_count integer not null check(guest_count between 1 and 400),
 status text not null default 'NEW' check(status in ('NEW','REVIEWED','CONTACTED','CONFIRMED','DECLINED','CLOSED')),
 source text not null default 'website', payload_json jsonb not null default '{}' check(octet_length(payload_json::text)<=16384),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(departure is null or arrival is null or departure>arrival)
);
create table tasks (
 id text primary key, title text not null check(length(title) between 1 and 200), description text not null default '' check(length(description)<=4000),
 department text not null check(department in ('MANAGEMENT','RECEPTION','HOUSEKEEPING','RESTAURANT','SERVICE','KITCHEN','TECHNICAL','GENERAL')),
 priority text not null default 'NORMAL' check(priority in ('NORMAL','IMPORTANT','URGENT')),
 status text not null default 'OPEN' check(status in ('OPEN','IN_PROGRESS','BLOCKED','DONE','CANCELLED')),
 assignee_user_id text references "user"(id), created_by_user_id text references "user"(id),
 source_type text, source_id text, due_at timestamptz, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), completed_at timestamptz,
 check((status='DONE')=(completed_at is not null))
);
create table task_events (
 id text primary key, task_id text not null references tasks(id), event_type text not null,
 actor_user_id text references "user"(id), payload_json jsonb not null default '{}' check(octet_length(payload_json::text)<=8192), created_at timestamptz not null default now()
);
create table briefings (
 id text primary key, title text not null check(length(title) between 1 and 200), body text not null check(length(body) between 1 and 4000),
 department text not null check(department in ('MANAGEMENT','RECEPTION','HOUSEKEEPING','RESTAURANT','SERVICE','KITCHEN','TECHNICAL','GENERAL')),
 priority text not null default 'NORMAL' check(priority in ('NORMAL','IMPORTANT','URGENT')),
 published_at timestamptz not null default now(), created_by_user_id text not null references "user"(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table briefing_reads (briefing_id text not null references briefings(id), user_id text not null references "user"(id), read_at timestamptz not null default now(), primary key(briefing_id,user_id));
create table operational_events (
 id text primary key, occurred_at timestamptz not null default now(), event_type text not null, source text not null,
 direction text not null check(direction in ('INPUT','INTERNAL','OUTPUT')), entity_type text not null, entity_id text not null,
 actor_type text not null, actor_id text, correlation_id text not null,
 payload_json jsonb not null default '{}' check(octet_length(payload_json::text)<=8192), metadata_json jsonb not null default '{}' check(octet_length(metadata_json::text)<=8192)
);
create table occupancy_snapshots (
 id text primary key, date date not null, rooms_total integer not null check(rooms_total>=0),
 rooms_available integer not null check(rooms_available>=0), rooms_occupied integer not null check(rooms_occupied>=0),
 arrivals integer check(arrivals>=0), departures integer check(departures>=0), occupancy_rate numeric not null check(occupancy_rate between 0 and 1),
 source text not null, captured_at timestamptz not null default now(), check(rooms_available+rooms_occupied<=rooms_total)
);
create table audit_log (
 id text primary key, occurred_at timestamptz not null default now(), actor_user_id text references "user"(id),
 action text not null, entity_type text not null, entity_id text not null,
 before_json jsonb, after_json jsonb, metadata_json jsonb not null default '{}'
);
create function reject_history_mutation() returns trigger language plpgsql as $$ begin raise exception 'append-only history'; end $$;
create trigger audit_append_only before update or delete or truncate on audit_log for each statement execute function reject_history_mutation();
create trigger task_events_append_only before update or delete or truncate on task_events for each statement execute function reject_history_mutation();
create trigger operational_events_append_only before update or delete or truncate on operational_events for each statement execute function reject_history_mutation();
create index inquiries_status_idx on inquiries(status);
create index inquiries_created_idx on inquiries(created_at);
create index inquiries_type_created_idx on inquiries(type,created_at);
create index tasks_status_idx on tasks(status);
create index tasks_assignee_status_idx on tasks(assignee_user_id,status);
create index tasks_due_idx on tasks(due_at);
create index tasks_department_status_idx on tasks(department,status);
create index task_events_task_created_idx on task_events(task_id,created_at);
create index briefings_department_published_idx on briefings(department,published_at);
create index briefing_reads_user_read_idx on briefing_reads(user_id,read_at);
create index operational_events_type_time_idx on operational_events(event_type,occurred_at);
create index operational_events_entity_idx on operational_events(entity_type,entity_id);
create index operational_events_correlation_idx on operational_events(correlation_id);
create index occupancy_date_idx on occupancy_snapshots(date,captured_at desc);
create index audit_actor_time_idx on audit_log(actor_user_id,occurred_at);
create index audit_entity_idx on audit_log(entity_type,entity_id);
