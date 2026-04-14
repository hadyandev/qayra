# Qayra — development tasks

> Aligned with [`qayra_full_deep_spec.md`](qayra_full_deep_spec.md) (note-first, QF APIs, Supabase FTS).

## Done (implementation pass)

- [x] Phase 1: `@nuxtjs/supabase`, runtime config, `.env.example` (QF + Supabase).
- [x] Phase 2: SQL migrations — run in Supabase Dashboard SQL Editor:
  - [`20260414000000_notes.sql`](../supabase/migrations/20260414000000_notes.sql) — notes, note_verses, FTS
  - [`20260414001000_disable_rls_for_testing.sql`](../supabase/migrations/20260414001000_disable_rls_for_testing.sql) — disable RLS for testing
  - [`20260414002000_sources_and_speakers.sql`](../supabase/migrations/20260414002000_sources_and_speakers.sql) — sources, speakers (user-specific)
- [x] Phase 3: `/api/notes` CRUD + verse extraction into `note_verses`; pages `/notes`, `/notes/new`, `/notes/[id]`; layout + auth middleware; magic link login.
- [x] Phase 4: TipTap editor (`components/NoteEditor.vue`) — cite verses as `@surah:ayah` in text/HTML. Clickable verse mentions link to verse reader.
- [x] Phase 5: Quran Foundation via Nitro [`server/utils/qfHttp.ts`](../server/utils/qfHttp.ts) (OAuth `client_credentials`); `/api/quran/chapters`, `verse`, `search`.
- [x] Phase 6: `GET /api/search/notes` → RPC `search_user_notes` (Postgres FTS).
- [x] Phase 7: `POST /api/publish` endpoint for QF publishing.
- [x] UI Redesign: All pages upgraded to premium design system (Editorial Luxury theme).
- [x] Clickable verse mentions: `@2:153` renders as `<a href="/verse/2:153">@2:153</a>`
- [x] Dynamic sources & speakers: User-specific autocomplete with Supabase persistence.
- [x] Typed Supabase: `types/database.types.ts`
- [x] QF API fixes: Fixed chapters/verse response mapping, default translation ID changed to 85

## Remaining / Optional

- [ ] Custom 404 page — premium "page not found" experience
- [ ] RTK optimization — implement request caching/token optimization if needed

## Database Setup

Run migrations in Supabase Dashboard SQL Editor (no CLI needed):

1. Go to https://supabase.com/dashboard → your project → SQL Editor
2. Run each migration file in order:
   - `supabase/migrations/20260414000000_notes.sql`
   - `supabase/migrations/20260414001000_disable_rls_for_testing.sql` (optional, for testing)
   - `supabase/migrations/20260414002000_sources_and_speakers.sql`

See [`SUPABASE_MIGRATIONS.md`](../SUPABASE_MIGRATIONS.md) for details.

## Verify locally

1. Run SQL migrations in Supabase.
2. `cp .env.example .env` and fill keys:
   - `SUPABASE_URL`, `SUPABASE_KEY`
   - `QF_CLIENT_ID`, `QF_CLIENT_SECRET`
3. `npm run dev` → sign in → create note → browse Quran.

## QF Translation IDs

Available English translations (ID):
- `85` — M.A.S. Abdel Haleem (default)
- `131` — Pickthall
- `167` — Sahih International

Get more: `GET /content/api/v4/resources/translations`
