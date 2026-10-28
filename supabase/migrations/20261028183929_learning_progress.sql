-- Supabase Auth owns credentials. Only the portable v1 learning carnet is stored here.
create table public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint learning_progress_v1 check ((
    jsonb_typeof(progress) = 'object'
    and progress @> '{"schemaVersion": 1}'::jsonb
    and jsonb_typeof(progress -> 'completedLessons') = 'array'
    and jsonb_typeof(progress -> 'concepts') = 'object'
    and jsonb_typeof(progress -> 'history') = 'array'
    and jsonb_typeof(progress -> 'settings') = 'object'
    and octet_length(progress::text) <= 2000000
  ) is true)
);
alter table public.learning_progress enable row level security;
revoke all on public.learning_progress from anon;
grant select, insert, update on public.learning_progress to authenticated;
create policy "Read own carnet" on public.learning_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Create own carnet" on public.learning_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Update own carnet" on public.learning_progress for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Compare-and-swap prevents two devices from silently overwriting each other.
-- SECURITY INVOKER retains all RLS checks, including when called through the REST API.
create function public.save_learning_progress(p_progress jsonb, p_expected_revision bigint, p_user_id uuid)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare new_revision bigint;
begin
  if (select auth.uid()) is null or p_user_id is distinct from (select auth.uid()) then
    raise exception 'Authenticated owner required' using errcode = '42501';
  end if;
  if p_expected_revision is null then
    insert into public.learning_progress(user_id, progress)
    values (p_user_id, p_progress)
    on conflict (user_id) do nothing returning revision into new_revision;
  else
    update public.learning_progress
      set progress = p_progress, revision = revision + 1, updated_at = now()
      where user_id = p_user_id and revision = p_expected_revision
      returning revision into new_revision;
  end if;
  return new_revision;
end;
$$;
revoke all on function public.save_learning_progress(jsonb, bigint, uuid) from public, anon;
grant execute on function public.save_learning_progress(jsonb, bigint, uuid) to authenticated;
