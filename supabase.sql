-- schema
create table if not exists players (
  id uuid primary key,
  team text not null,
  name text not null,
  inserted_at timestamp with time zone default now()
);

create table if not exists positions (
  id bigserial primary key,
  player_id uuid references players(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  acc double precision,
  created_at timestamp with time zone default now()
);

create table if not exists progress (
  id bigserial primary key,
  player_id uuid references players(id) on delete cascade,
  checkpoint_id text not null,
  reached_at timestamp with time zone default now()
);

-- RLS
alter table players enable row level security;
alter table positions enable row level security;
alter table progress enable row level security;

create policy "players_read" on players for select using (true);
create policy "players_write" on players for insert with check (true);
create policy "positions_read" on positions for select using (true);
create policy "positions_write" on positions for insert with check (true);
create policy "progress_read" on progress for select using (true);
create policy "progress_write" on progress for insert with check (true);

-- Realtime
alter publication supabase_realtime add table positions;
'use client';
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

