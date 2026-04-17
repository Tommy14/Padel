create or replace function public.admin_delete_session(
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_session_date date;
  v_row record;
begin
  if v_admin_id is null or not public.is_admin(v_admin_id) then
    raise exception 'Only admins can delete sessions.';
  end if;

  select date
  into v_session_date
  from public.sessions
  where id = p_session_id;

  if v_session_date is null then
    raise exception 'Session not found.';
  end if;

  for v_row in
    select player_id, fee
    from public.session_players
    where session_id = p_session_id
  loop
    update public.profiles
    set credit_balance = credit_balance + v_row.fee
    where id = v_row.player_id;

    insert into public.credit_transactions (player_id, amount, description, created_by)
    values (
      v_row.player_id,
      v_row.fee,
      concat('Session deletion refund for ', to_char(v_session_date, 'YYYY-MM-DD')),
      v_admin_id
    );
  end loop;

  delete from public.sessions where id = p_session_id;
end;
$$;

create or replace function public.admin_update_session(
  p_session_id uuid,
  p_court_id uuid,
  p_date date,
  p_start_time time,
  p_end_time time,
  p_notes text,
  p_player_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_old_date date;
  v_hourly_rate numeric;
  v_duration_hours numeric;
  v_total_cost numeric;
  v_fee_per_player numeric;
  v_player_id uuid;
  v_player_count integer;
  v_distinct_player_count integer;
  v_row record;
begin
  if v_admin_id is null or not public.is_admin(v_admin_id) then
    raise exception 'Only admins can update sessions.';
  end if;

  if p_end_time <= p_start_time then
    raise exception 'End time must be after start time.';
  end if;

  if array_length(p_player_ids, 1) is null then
    raise exception 'At least one player must be selected.';
  end if;

  select date
  into v_old_date
  from public.sessions
  where id = p_session_id;

  if v_old_date is null then
    raise exception 'Session not found.';
  end if;

  select count(*) into v_player_count
  from (
    select distinct unnest(p_player_ids) as player_id
  ) selected_players;

  v_distinct_player_count := v_player_count;

  select count(*) into v_player_count
  from public.profiles
  where id = any(p_player_ids)
    and role = 'player';

  if v_player_count <> v_distinct_player_count then
    raise exception 'One or more selected players are invalid.';
  end if;

  select hourly_rate
  into v_hourly_rate
  from public.courts
  where id = p_court_id;

  if v_hourly_rate is null then
    raise exception 'Court not found.';
  end if;

  for v_row in
    select player_id, fee
    from public.session_players
    where session_id = p_session_id
  loop
    update public.profiles
    set credit_balance = credit_balance + v_row.fee
    where id = v_row.player_id;

    insert into public.credit_transactions (player_id, amount, description, created_by)
    values (
      v_row.player_id,
      v_row.fee,
      concat('Session update refund for ', to_char(v_old_date, 'YYYY-MM-DD')),
      v_admin_id
    );
  end loop;

  delete from public.session_players
  where session_id = p_session_id;

  v_duration_hours := extract(epoch from (p_end_time - p_start_time)) / 3600;
  v_total_cost := v_hourly_rate * v_duration_hours;
  v_fee_per_player := v_total_cost / v_distinct_player_count;

  update public.sessions
  set court_id = p_court_id,
      date = p_date,
      start_time = p_start_time,
      end_time = p_end_time,
      total_cost = v_total_cost,
      notes = nullif(p_notes, '')
  where id = p_session_id;

  for v_player_id in
    select distinct unnest(p_player_ids)
  loop
    insert into public.session_players (session_id, player_id, fee, paid_from_credit)
    values (p_session_id, v_player_id, v_fee_per_player, true);

    update public.profiles
    set credit_balance = credit_balance - v_fee_per_player
    where id = v_player_id;

    insert into public.credit_transactions (player_id, amount, description, created_by)
    values (
      v_player_id,
      -v_fee_per_player,
      concat('Session booking deduction for ', to_char(p_date, 'YYYY-MM-DD')),
      v_admin_id
    );
  end loop;

  return p_session_id;
end;
$$;

grant execute on function public.admin_delete_session(uuid) to authenticated;
grant execute on function public.admin_update_session(uuid, uuid, date, time, time, text, uuid[]) to authenticated;
