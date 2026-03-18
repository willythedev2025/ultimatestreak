-- Ultimate Streak Database Schema

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default 'Player',
  avatar_url text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Contests table
create table public.contests (
  id uuid primary key default gen_random_uuid(),
  month int not null check (month between 1 and 12),
  year int not null,
  entry_fee_cents int not null default 1000,
  prize_pool_cents int not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'settling', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (month, year)
);

alter table public.contests enable row level security;

create policy "Contests are readable by everyone"
  on public.contests for select
  using (true);

-- Contest Entries table
create table public.contest_entries (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  stripe_payment_intent_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

alter table public.contest_entries enable row level security;

create policy "Users can read own entries"
  on public.contest_entries for select
  using (auth.uid() = user_id);

create policy "Leaderboard: everyone can read entries"
  on public.contest_entries for select
  using (true);

-- Picks table
create table public.picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  contest_entry_id uuid not null references public.contest_entries(id) on delete cascade,
  kalshi_event_ticker text not null,
  kalshi_market_ticker text not null,
  event_title text not null,
  market_title text not null,
  predicted_outcome text not null check (predicted_outcome in ('yes', 'no')),
  status text not null default 'active' check (status in ('active', 'settled')),
  result text check (result in ('correct', 'incorrect')),
  picked_at timestamptz not null default now(),
  settled_at timestamptz
);

-- Partial unique index: only one active pick per user at a time
create unique index one_active_pick_per_user
  on public.picks (user_id)
  where (status = 'active');

alter table public.picks enable row level security;

create policy "Users can read own picks"
  on public.picks for select
  using (auth.uid() = user_id);

create policy "Users can insert own picks"
  on public.picks for insert
  with check (auth.uid() = user_id);

-- Function to increment prize pool
create or replace function public.increment_prize_pool(p_contest_id uuid, p_amount int)
returns void
language sql
as $$
  update public.contests
  set prize_pool_cents = prize_pool_cents + p_amount,
      updated_at = now()
  where id = p_contest_id;
$$;

-- Function to settle a pick and update streak
create or replace function public.settle_pick(
  p_pick_id uuid,
  p_result text -- 'correct' or 'incorrect'
)
returns void
language plpgsql
as $$
declare
  v_pick record;
begin
  -- Get the pick
  select * into v_pick from public.picks where id = p_pick_id and status = 'active';
  if not found then
    raise exception 'Pick not found or already settled';
  end if;

  -- Update pick status
  update public.picks
  set status = 'settled',
      result = p_result,
      settled_at = now()
  where id = p_pick_id;

  -- Update streak
  if p_result = 'correct' then
    update public.contest_entries
    set current_streak = current_streak + 1,
        longest_streak = greatest(longest_streak, current_streak + 1),
        updated_at = now()
    where id = v_pick.contest_entry_id;
  else
    update public.contest_entries
    set current_streak = 0,
        updated_at = now()
    where id = v_pick.contest_entry_id;
  end if;
end;
$$;
