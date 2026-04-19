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
- [x] Fallback verse data: First 10 verses (Arabic + translation) in verse API when QF returns empty

## Session Updates (2026-04-19)

- [x] Verse detail page fixes:
  - [x] Chapter name (Al-Fatihah vs "Chapter 1")
  - [x] Verse count (1/7 vs 1/0)
  - [x] Tafsir expandable section (removed dropdown)
  - [x] Related verses with content
  - [x] CTA centering
- [x] Footer added to default layout
- [x] Dashboard stats using heatmap API
- [x] Hadith navigation commented out
- [x] README.md comprehensive documentation

---

## QF Content APIs (Implemented)

### Environment
- `QF_ENV=prelive` — Content API + User API available
- `QF_ENV=live` — Content API only (User API pending)

### Phase 8: Use QF JS SDK (Option C)
> Replace manual qfHttp.ts calls with `@quranjs/api` SDK for cleaner code

- [ ] Install `@quranjs/api` package
- [ ] Update `composables/useQuran.ts` to use SDK methods
- [ ] Update `server/api/quran/*.ts` to use SDK where applicable
- [ ] Keep `qfHttp.ts` as fallback / for User API calls

### Phase 9: Enhance Search with QF Search API
> Upgrade command palette search to use QF Search API

- [ ] Update `/api/quran/search.get.ts` to use QF Search API
- [ ] Implement `SearchMode.Quick` for command palette (chapters, juz, pages + verses)
- [ ] Update `components/CommandPalette.vue` to show navigation results
- [ ] Support multi-language search (English, Arabic, Urdu)

### Phase 10: Browse Quran by Topics (Completed)
> Browse Quran by Islamic topics (patience, mercy, prayer, etc.)

**Topics implemented in `data/quranTopics.ts`:**
- Faith & Belief
- Prayer & Worship
- Patience & Perseverance
- Mercy & Compassion
- Charity & Giving
- Family & Relations
- Knowledge & Wisdom
- Guidance & Light
- Paradise & Jannah
- Creation & Signs

- [x] Create topic data structure (`data/quranTopics.ts`)
- [x] Related verses use topic data (on verse detail page)

---

## QF User APIs (Future Development)

### Phase 15: QF User API Integration
> Integrate Quran Foundation User APIs for bookmarks, highlights, sync progress

**Planned Features:**
- [ ] Save user bookmarks/favorites to QF profile
- [ ] Sync reading progress
- [ ] User-specific highlights backup

**Current Status:**
- Not started - OAuth scope support exists in `qfHttp.ts`
- Need User API credentials and endpoint documentation

**Implementation Notes:**
- QF user APIs use separate base URL (`userApiBase` in config)
- Token scope: `note` (mapped from `user` scope in OAuth)
- Requires OAuth token with `user` scope

---

## Extended Features (Post-Hackathon)

### Phase 12: Add Hadith to Qayra
> Expand from Quran-only to complete Islamic knowledge workspace

**Vision:** Browse Quran + Hadith + make reflections on both

**Data Source:** Local data (`data/hadithBooks.ts`) or remote MCP

**Features (Not Started):**
- [ ] Browse Hadith collections (future)
- [ ] Browse by book/chapter (future)
- [ ] Search Hadith (future)
- [ ] Add note/reflection on Hadith (future)
- [ ] Show related ahadith on verse detail page (future)

Note: Hadith API infrastructure exists (`/api/hadith/*`) but navigation is commented out. Not a priority.

### Phase 13: Browse by Category/Topic
> Browse Quran and Hadith by Islamic topics

 Topics: prayer, patience, charity, faith, paradise, hell, prophet, allah, mercy, justice, knowledge, family, death, creation, guidance

**Features:**
- [x] Category/Topic pages for Quran (completed in Phase 10)
- [ ] Category/Topic pages for Hadith (future)

---

## Database Setup

Run migrations in Supabase Dashboard SQL Editor (no CLI needed):

1. Go to https://supabase.com/dashboard → your project → SQL Editor
2. Run each migration file in order:
   - `supabase/migrations/20260414000000_notes.sql`
   - `supabase/migrations/20260414001000_disable_rls_for_testing.sql` (optional, for testing)
   - `supabase/migrations/20260414002000_sources_and_speakers.sql`
   - Additional migrations as needed

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