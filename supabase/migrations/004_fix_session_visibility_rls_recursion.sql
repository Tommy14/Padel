create or replace function public.can_access_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin(auth.uid())
    or exists (
      select 1
      from public.session_players sp
      where sp.session_id = p_session_id
        and sp.player_id = auth.uid()
    );
$$;

create or replace function public.can_view_profile_in_shared_session(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin(auth.uid())
    or auth.uid() = p_profile_id
    or exists (
      select 1
      from public.session_players teammate_rows
      where teammate_rows.player_id = p_profile_id
        and public.can_access_session(teammate_rows.session_id)
    );
$$;

drop policy if exists "players read session rows in own sessions" on public.session_players;
drop policy if exists "players read own session rows" on public.session_players;

create policy "players read session rows in own sessions"
on public.session_players
for select
to authenticated
using (public.can_access_session(session_id));

drop policy if exists "players read profiles in own sessions" on public.profiles;

create policy "players read profiles in own sessions"
on public.profiles
for select
to authenticated
using (public.can_view_profile_in_shared_session(id));
