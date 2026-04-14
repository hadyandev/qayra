-- Dynamic sources and speakers tables (user-specific)

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.speakers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- RLS disabled for testing
alter table public.sources disable row level security;
alter table public.speakers disable row level security;

-- Grant permissions for testing
grant select, insert, update, delete on table public.sources to anon, authenticated;
grant select, insert, update, delete on table public.speakers to anon, authenticated;
