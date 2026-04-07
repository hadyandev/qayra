
create table reflections (
  id uuid primary key default gen_random_uuid(),
  verse_key text,
  content text,
  created_at timestamp default now()
);
