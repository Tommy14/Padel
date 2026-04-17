drop policy if exists "players read own session rows" on public.session_players;

create policy "players read session rows in own sessions"
on public.session_players
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or player_id = auth.uid()
  or exists (
    select 1
    from public.session_players my_rows
    where my_rows.session_id = session_players.session_id
      and my_rows.player_id = auth.uid()
  )
);

create policy "players read profiles in own sessions"
on public.profiles
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or auth.uid() = id
  or exists (
    select 1
    from public.session_players my_rows
    join public.session_players target_rows
      on target_rows.session_id = my_rows.session_id
    where my_rows.player_id = auth.uid()
      and target_rows.player_id = profiles.id
  )
);
