create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text not null default 'player' check (role in ('admin', 'player')),
  credit_balance numeric not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  hourly_rate numeric not null check (hourly_rate >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete restrict,
  date date not null,
  start_time time not null,
  end_time time not null,
  total_cost numeric not null check (total_cost >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint valid_session_time check (end_time > start_time)
);

create table if not exists public.session_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  fee numeric not null check (fee >= 0),
  paid_from_credit boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (session_id, player_id)
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  description text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_sessions_date on public.sessions(date desc);
create index if not exists idx_session_players_player on public.session_players(player_id);
create index if not exists idx_session_players_session on public.session_players(session_id);
create index if not exists idx_credit_transactions_player on public.credit_transactions(player_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'New player'),
    new.raw_user_meta_data ->> 'phone',
    'player'
  )
  on conflict (id) do update
    set name = excluded.name,
        phone = excluded.phone;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and role = 'admin'
  );
$$;

create or replace function public.admin_add_credit(
  p_player_id uuid,
  p_amount numeric,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
begin
  if v_admin_id is null or not public.is_admin(v_admin_id) then
    raise exception 'Only admins can add credit.';
  end if;

  if p_amount <= 0 then
    raise exception 'Credit amount must be greater than zero.';
  end if;

  update public.profiles
  set credit_balance = credit_balance + p_amount
  where id = p_player_id
    and role = 'player';

  if not found then
    raise exception 'Player profile not found.';
  end if;

  insert into public.credit_transactions (player_id, amount, description, created_by)
  values (p_player_id, p_amount, p_description, v_admin_id);
end;
$$;

create or replace function public.admin_book_session(
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
  v_hourly_rate numeric;
  v_duration_hours numeric;
  v_total_cost numeric;
  v_fee_per_player numeric;
  v_session_id uuid;
  v_player_id uuid;
  v_player_count integer;
  v_distinct_player_count integer;
begin
  if v_admin_id is null or not public.is_admin(v_admin_id) then
    raise exception 'Only admins can book sessions.';
  end if;

  if p_end_time <= p_start_time then
    raise exception 'End time must be after start time.';
  end if;

  if array_length(p_player_ids, 1) is null then
    raise exception 'At least one player must be selected.';
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

  v_duration_hours := extract(epoch from (p_end_time - p_start_time)) / 3600;
  v_total_cost := v_hourly_rate * v_duration_hours;
  v_fee_per_player := v_total_cost / v_distinct_player_count;

  insert into public.sessions (court_id, date, start_time, end_time, total_cost, notes)
  values (p_court_id, p_date, p_start_time, p_end_time, v_total_cost, nullif(p_notes, ''))
  returning id into v_session_id;

  for v_player_id in
    select distinct unnest(p_player_ids)
  loop
    insert into public.session_players (session_id, player_id, fee, paid_from_credit)
    values (v_session_id, v_player_id, v_fee_per_player, true);

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

  return v_session_id;
end;
$$;

grant execute on function public.admin_add_credit(uuid, numeric, text) to authenticated;
grant execute on function public.admin_book_session(uuid, date, time, time, text, uuid[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.credit_transactions enable row level security;

create policy "admin manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "players read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "players update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and role = 'player');

create policy "admin manage courts"
on public.courts
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "authenticated users can read courts"
on public.courts
for select
to authenticated
using (true);

create policy "admin manage sessions"
on public.sessions
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "players read their sessions"
on public.sessions
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.session_players
    where session_id = sessions.id
      and player_id = auth.uid()
  )
);

create policy "admin manage session players"
on public.session_players
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "players read own session rows"
on public.session_players
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or player_id = auth.uid()
);

create policy "admin manage credit transactions"
on public.credit_transactions
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "players read own transactions"
on public.credit_transactions
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or player_id = auth.uid()
);
