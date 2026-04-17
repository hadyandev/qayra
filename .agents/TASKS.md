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

## QF Integration (Hackathon Goal: 1 Content API + 1 User API)

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

### Phase 10: Browse Quran by Topics/Categories ⏳ IN PROGRESS
> Browse Quran by Islamic topics (patience, mercy, prayer, etc.)

**Topics:** prayer, patience, charity, faith, paradise, hell, prophet, allah, mercy, justice, knowledge, family, death, creation, guidance

**Implementation:**
- [ ] Create topic data structure (verse keys grouped by topic)
- [ ] Add topic filter/tabs on browse page
- [ ] Create topic detail page (`/browse/topic/:slug`)
- [ ] Add topic badges on verse cards
- [ ] Add topic-based search capability

**Current:** Creating topic data and adding topic filter to browse page

### Phase 11: Publish to QF (Option A) — Per Verse Reflection
> Allow users to publish individual verse reflections to their Quran.com profile

**Data Model:**
```
Qayra: note_verses table (note_id, verse_key)
  ↓ Each row = one verse reflection
QF: POST /v1/notes { body: "...", ranges: ["1:1"] }
```

- [ ] Add QF User API base URL to config (prelive: `https://api-prelive.quran.foundation`)
- [ ] Create `POST /api/qf/notes` endpoint to publish single verse reflection
- [ ] Add `qf_published_at` column to `note_verses` table (track publish status)
- [ ] Add "Publish to Quran.com" button on verse detail page (per reflection)
- [ ] Show "Published ✓" badge on successfully published reflections

**Implementation Notes:**
- Extract reflection text from note content for specific verse_key
- Map Qayra verse_key (e.g., "1:1") to QF range format (e.g., "1:1-1:1")
- Handle auth: Use QF access token (obtained same way as Content API)

---

## Extended Features (Post-Hackathon)

### Phase 12: Add Hadith to Qayra
> Expand from Quran-only to complete Islamic knowledge workspace

**Vision:** Browse Quran + Hadith + make reflections on both

**Data Source:** `@quranmcp/server` - provides Hadith collections:
- Sahih Bukhari (7,563)
- Sahih Muslim (7,563)
- Sunan Abu Dawud (5,274)
- Jami' at-Tirmidhi (3,956)
- Sunan an-Nasa'i (5,758)
- Sunan Ibn Majah (4,341)

**Features:**
- [ ] Browse Hadith collections (6 major collections)
- [ ] Browse by book/chapter
- [ ] Search Hadith by keywords
- [ ] Search Hadith by topic
- [ ] Add note/reflection on Hadith
- [ ] Show related ahadith on verse detail page

### Phase 13: Browse by Category/Topic
> Browse Quran and Hadith by Islamic topics

**Topics:** prayer, patience, charity, faith, paradise, hell, prophet, allah, mercy, justice, knowledge, family, death, creation, guidance

**Features:**
- [ ] Category/Topic pages for Quran
- [ ] Category/Topic pages for Hadith
- [ ] Topic-based discovery (AI understands topics)

### Phase 14: Hybrid MCP Architecture
> Use remote MCP but fall back to local when rate limited

**Pattern:**
```
1. Try remote MCP (npx @quranmcp/server)
2. If rate limited → fall back to local cache
3. Local cache populated from initial sync
```

**Implementation:**
- [ ] Add MCP fetcher with fallback logic
- [ ] Implement local cache for Hadith data
- [ ] Handle offline gracefully
- [ ] Sync strategy for cache population

---

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
