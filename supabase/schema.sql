-- The Counseling Studio · Private workspace snapshot (pilot)
-- Run in Supabase SQL Editor, once. Each authenticated user sees ONLY their own row.
create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now()
);
alter table public.workspace_snapshots enable row level security;
revoke all on public.workspace_snapshots from anon;
grant select, insert, update, delete on public.workspace_snapshots to authenticated;
drop policy if exists workspace_read_own on public.workspace_snapshots;
drop policy if exists workspace_insert_own on public.workspace_snapshots;
drop policy if exists workspace_update_own on public.workspace_snapshots;
drop policy if exists workspace_delete_own on public.workspace_snapshots;
create policy workspace_read_own on public.workspace_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy workspace_insert_own on public.workspace_snapshots for insert to authenticated with check ((select auth.uid()) = user_id);
create policy workspace_update_own on public.workspace_snapshots for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy workspace_delete_own on public.workspace_snapshots for delete to authenticated using ((select auth.uid()) = user_id);
-- On first deployment, configure Supabase Auth URL settings and restrict signups to your account.
-- Treat this as a pilot snapshot model: not realtime multi-device collaboration.
