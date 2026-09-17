-- Unions'Q database schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  campus text not null default 'Masters'' Union',
  avatar_url text,
  credits integer not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists slots (
  id text primary key,
  label text not null,
  start_time text not null,
  end_time text not null,
  is_peak boolean not null default true,
  capacity integer not null default 30
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id text not null references slots (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'waiting', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Seed the three peak slots + one off-peak slot from the original spec
insert into slots (id, label, start_time, end_time, is_peak, capacity) values
  ('morning', 'Morning peak', '06:00', '09:00', true, 40),
  ('afternoon', 'Afternoon peak', '12:30', '14:00', true, 50),
  ('evening', 'Evening peak', '17:00', '22:00', true, 60),
  ('off-peak', 'Off-peak', '09:00', '12:30', false, 30)
on conflict (id) do nothing;

-- Row Level Security: users can read all slots/bookings, but only write their own
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table credit_transactions enable row level security;

create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "bookings are viewable by everyone" on bookings for select using (true);
create policy "users can create their own bookings" on bookings for insert with check (auth.uid() = user_id);

create policy "users can view their own transactions" on credit_transactions for select using (auth.uid() = user_id);
