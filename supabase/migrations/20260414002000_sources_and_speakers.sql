-- Dynamic sources and speakers tables (user-specific)

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.speakers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- RLS for sources and speakers
alter table public.sources enable row level security;
alter table public.speakers enable row level security;

-- Sources policies
drop policy if exists "sources_select_own" on public.sources;
drop policy if exists "sources_insert_own" on public.sources;
drop policy if exists "sources_delete_own" on public.sources;

create policy "sources_select_own" on public.sources for select to authenticated using (auth.uid() = user_id);
create policy "sources_insert_own" on public.sources for insert to authenticated with check (auth.uid() = user_id);
create policy "sources_delete_own" on public.sources for delete to authenticated using (auth.uid() = user_id);

-- Speakers policies
drop policy if exists "speakers_select_own" on public.speakers;
drop policy if exists "speakers_insert_own" on public.speakers;
drop policy if exists "speakers_delete_own" on public.speakers;

create policy "speakers_select_own" on public.speakers for select to authenticated using (auth.uid() = user_id);
create policy "speakers_insert_own" on public.speakers for insert to authenticated with check (auth.uid() = user_id);
create policy "speakers_delete_own" on public.speakers for delete to authenticated using (auth.uid() = user_id);

-- Indexes
create index if not exists sources_user_id_idx on public.sources (user_id);
create index if not exists speakers_user_id_idx on public.speakers (user_id);
