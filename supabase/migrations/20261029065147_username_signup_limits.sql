-- Signup is public, but privileged account creation is confined to the Edge Function.
-- No password or raw IP address is stored in this application table.
create schema if not exists malagasy_private;
revoke all on schema malagasy_private from public, anon, authenticated;
grant usage on schema malagasy_private to service_role;

create table malagasy_private.username_signup_limits (
  bucket text not null,
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0),
  primary key (bucket, window_start)
);
alter table malagasy_private.username_signup_limits enable row level security;
revoke all on malagasy_private.username_signup_limits from public, anon, authenticated;
grant select, insert, update, delete on malagasy_private.username_signup_limits to service_role;
create index username_signup_limits_expiry on malagasy_private.username_signup_limits(window_start);

-- SECURITY INVOKER: only the server's service_role has the required privileges.
create function public.consume_username_signup_limit(p_fingerprint text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  ip_window timestamptz := date_trunc('hour', now())
    + floor(extract(minute from now()) / 15) * interval '15 minutes';
  daily_window timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
  attempt_count integer;
begin
  if current_user <> 'service_role' or p_fingerprint is null
    or p_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'Server signup required' using errcode = '42501';
  end if;
  -- Serialize the two buckets so a concurrent burst cannot exceed the global cap.
  perform pg_advisory_xact_lock(hashtextextended('malagasy_username_signup', 0));
  delete from malagasy_private.username_signup_limits
    where window_start < now() - interval '2 days';
  insert into malagasy_private.username_signup_limits(bucket, window_start, attempts)
    values ('ip:' || p_fingerprint, ip_window, 1)
    on conflict (bucket, window_start) do update
    set attempts = least(malagasy_private.username_signup_limits.attempts + 1, 6)
    returning attempts into attempt_count;
  if attempt_count > 5 then return false; end if;
  insert into malagasy_private.username_signup_limits(bucket, window_start, attempts)
    values ('global', daily_window, 1)
    on conflict (bucket, window_start) do update
    set attempts = least(malagasy_private.username_signup_limits.attempts + 1, 101)
    returning attempts into attempt_count;
  return attempt_count <= 100;
end;
$$;
revoke all on function public.consume_username_signup_limit(text) from public, anon, authenticated;
grant execute on function public.consume_username_signup_limit(text) to service_role;
