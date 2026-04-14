-- Qayra note-first schema + Postgres FTS (run in Supabase SQL editor or via CLI)

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  content text not null default '',
  source text,
  speaker text,
  note_date date,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) stored
);

create table if not exists public.note_verses (
  note_id uuid not null references public.notes (id) on delete cascade,
  verse_key text not null,
  primary key (note_id, verse_key)
);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_note_date_idx on public.notes (note_date desc nulls last);
create index if not exists notes_tags_idx on public.notes using gin (tags);
create index if not exists notes_search_vector_idx on public.notes using gin (search_vector);

alter table public.notes enable row level security;
alter table public.note_verses enable row level security;

drop policy if exists "notes_select_own" on public.notes;
drop policy if exists "notes_insert_own" on public.notes;
drop policy if exists "notes_update_own" on public.notes;
drop policy if exists "notes_delete_own" on public.notes;

create policy "notes_select_own" on public.notes for select to authenticated using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes for insert to authenticated with check (auth.uid() = user_id);
create policy "notes_update_own" on public.notes for update to authenticated using (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "note_verses_select_own" on public.note_verses;
drop policy if exists "note_verses_insert_own" on public.note_verses;
drop policy if exists "note_verses_delete_own" on public.note_verses;

create policy "note_verses_select_own" on public.note_verses for select to authenticated using (
  exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
);
create policy "note_verses_insert_own" on public.note_verses for insert to authenticated with check (
  exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
);
create policy "note_verses_delete_own" on public.note_verses for delete to authenticated using (
  exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
);

create or replace function public.set_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_notes_updated_at();

-- Full-text search helper (RLS applies via invoker)
create or replace function public.search_user_notes(
  q text default null,
  tag_filter text default null,
  source_filter text default null,
  date_from date default null,
  date_to date default null
)
returns setof public.notes
language sql
stable
security invoker
set search_path = public
as $$
  select n.*
  from public.notes n
  where
    (q is null or trim(q) = '' or n.search_vector @@ websearch_to_tsquery('english', q))
    and (tag_filter is null or trim(tag_filter) = '' or tag_filter = any (n.tags))
    and (source_filter is null or trim(source_filter) = '' or n.source = source_filter)
    and (date_from is null or n.note_date is null or n.note_date >= date_from)
    and (date_to is null or n.note_date is null or n.note_date <= date_to)
  order by n.note_date desc nulls last, n.created_at desc
$$;

grant execute on function public.search_user_notes(text, text, text, date, date) to authenticated;
