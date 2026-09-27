-- Server-only database access. Supabase-style Data API roles must never receive
-- direct access to hotel/Auth tables. Do not add permissive pseudo-RLS policies.
-- PostgreSQL deployments without these provider roles take the same PUBLIC gate.
do $$
declare
  table_name text;
  role_name text;
begin
  foreach table_name in array array[
    'user','session','account','verification','staff_profiles','bootstrap_state',
    'inquiries','tasks','task_events','briefings','briefing_reads',
    'operational_events','occupancy_snapshots','audit_log','_migrations'
  ] loop
    execute format('revoke all on table %I from public', table_name);
    foreach role_name in array array['anon','authenticated'] loop
      if exists(select 1 from pg_roles where rolname=role_name) then
        execute format('revoke all on table %I from %I', table_name, role_name);
      end if;
    end loop;
  end loop;
end $$;
