-- The Counseling Studio: optional snapshot backup history.
-- Run once in Supabase SQL Editor after schema.sql and auto-sync.sql.
create table if not exists public.workspace_backups (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id, revision)
);
create index if not exists workspace_backups_owner_created on public.workspace_backups(user_id,created_at desc);
alter table public.workspace_backups enable row level security;
revoke all on public.workspace_backups from anon;
grant select, insert, delete on public.workspace_backups to authenticated;
drop policy if exists backups_read_owner on public.workspace_backups;
drop policy if exists backups_insert_owner on public.workspace_backups;
drop policy if exists backups_delete_owner on public.workspace_backups;
create policy backups_read_owner on public.workspace_backups for select to authenticated using ((select auth.uid())=user_id);
create policy backups_insert_owner on public.workspace_backups for insert to authenticated with check ((select auth.uid())=user_id);
create policy backups_delete_owner on public.workspace_backups for delete to authenticated using ((select auth.uid())=user_id);
-- Preserve the previous snapshot whenever its cloud payload is changed.
create or replace function public.archive_previous_workspace()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if (old.payload is distinct from new.payload) then
    insert into public.workspace_backups(user_id,revision,payload,created_at)
      values (old.user_id,old.revision,old.payload,now())
      on conflict(user_id,revision) do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists archive_workspace_before_update on public.workspace_snapshots;
create trigger archive_workspace_before_update before update on public.workspace_snapshots
  for each row execute function public.archive_previous_workspace();
-- Backups are retained until explicitly deleted. Monitor Supabase free-tier storage.
-- This does NOT prevent or record manual deletion of the whole workspace row; use export backups too.
