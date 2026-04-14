-- TEMPORARY TEST MODE (INSECURE)
-- Disables RLS and auth requirements so app flows can be tested without login.
-- Revert before production/hackathon submission.

alter table if exists public.notes alter column user_id drop not null;

alter table if exists public.notes disable row level security;
alter table if exists public.note_verses disable row level security;

drop policy if exists "notes_select_own" on public.notes;
drop policy if exists "notes_insert_own" on public.notes;
drop policy if exists "notes_update_own" on public.notes;
drop policy if exists "notes_delete_own" on public.notes;

drop policy if exists "note_verses_select_own" on public.note_verses;
drop policy if exists "note_verses_insert_own" on public.note_verses;
drop policy if exists "note_verses_delete_own" on public.note_verses;

grant select, insert, update, delete on table public.notes to anon, authenticated;
grant select, insert, update, delete on table public.note_verses to anon, authenticated;

grant execute on function public.search_user_notes(text, text, text, date, date) to anon, authenticated;
