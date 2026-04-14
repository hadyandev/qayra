# Qayra — development tasks

> Aligned with [`qayra_full_deep_spec.md`](qayra_full_deep_spec.md) (note-first, QF APIs, Supabase FTS).

## Done (implementation pass)

- [x] Phase 1: `@nuxtjs/supabase`, runtime config, `.env.example` (QF + Supabase).
- [x] Phase 2: SQL migration [`supabase/migrations/20260414000000_notes.sql`](../supabase/migrations/20260414000000_notes.sql) — run in Supabase dashboard.
- [x] Phase 3: `/api/notes` CRUD + verse extraction into `note_verses`; pages `/notes`, `/notes/new`, `/notes/[id]`; layout + auth middleware; magic link login.
- [x] Phase 4: TipTap editor (`components/NoteEditor.vue`) — cite verses as `@surah:ayah` in text/HTML.
- [x] Phase 5: Quran Foundation via Nitro [`server/utils/qfHttp.ts`](../server/utils/qfHttp.ts) (OAuth `content` / `search` scopes); `/api/quran/chapters`, `verse`, `search`.
- [x] Phase 6: `GET /api/search/notes` → RPC `search_user_notes` (Postgres FTS).

## Optional / next

- [ ] Phase 7: `POST /api/publish` + QF User-related APIs + OAuth hardening for hackathon demo.
- [ ] Typed Supabase: add `types/database.types.ts` (or generate) to silence module warning.
- [ ] TipTap `@` dropdown wired to `/api/quran/search` (mention UI polish).

## Verify locally

1. Apply SQL migration in Supabase.
2. `cp .env.example .env` and fill keys.
3. `npm run dev` → sign in → create note → browse Quran.
