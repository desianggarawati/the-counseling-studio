-- Run once AFTER supabase/schema.sql.
-- Atomic compare-and-swap protects against lost updates between devices.
create or replace function public.save_workspace_if_revision(
  expected_revision bigint,
  new_payload jsonb
)
returns table(saved boolean, current_revision bigint)
language plpgsql
security invoker
set search_path = public
as $$
declare newrev bigint;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if jsonb_typeof(new_payload->'clients') <> 'array'
     or jsonb_typeof(new_payload->'appointments') <> 'array' then
    raise exception 'Invalid workspace payload';
  end if;
  update public.workspace_snapshots
     set payload = new_payload,
         revision = revision + 1,
         updated_at = now()
   where user_id = auth.uid()
     and revision = expected_revision
   returning revision into newrev;
  if newrev is not null then
    return query select true, newrev;
  else
    return query select false, coalesce(
      (select w.revision from public.workspace_snapshots w where w.user_id = auth.uid()), 0::bigint
    );
  end if;
end;
$$;
revoke all on function public.save_workspace_if_revision(bigint,jsonb) from public, anon;
grant execute on function public.save_workspace_if_revision(bigint,jsonb) to authenticated;
