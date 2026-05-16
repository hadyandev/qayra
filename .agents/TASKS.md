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
- [x] Clickable verse mentions: `@2:153` renders as `<a href="/quran/verse/2:153">@2:153</a>`
- [x] Dynamic sources & speakers: User-specific autocomplete with Supabase persistence.
- [x] Typed Supabase: `types/database.types.ts`
- [x] QF API fixes: Fixed chapters/verse response mapping, default translation ID changed to 85
- [x] Fallback verse data: First 10 verses (Arabic + translation) in verse API when QF returns empty

## Session Updates (2026-05-01)

### QF OAuth2 + Supabase Persistence
- [x] Created `qf_connections` table migration with RLS policies
- [x] OAuth callback saves connection to Supabase after token exchange
- [x] Server middleware auto-restores QF session from stored refresh token
- [x] Connection status API (`GET /api/qf/connection`)
- [x] Disconnect API (`DELETE /api/qf/connection`) — revokes token on QF + deletes local record
- [x] `useQfConnection` composable for frontend state
- [x] User menu shows QF status (green dot when connected, "Connect" when not)
- [x] QfConnectModal shows connected state with details and disconnect option
- [x] OAuth callback redirects to previous page after success

### Heatmap Page Rewrite
- [x] Combined activity calendar (notes + reading) — no tabs
- [x] Fixed calendar date display (local dates instead of UTC)
- [x] Stat cards: Notes, Reading Sessions, Active Days, Completion %
- [x] Recent activity list with meaningful descriptions
- [x] Clickable verse references → `/quran/verse/{chapter:verse}` or `/quran/verse/{range}`
- [x] Clickable note descriptions → `/notes/{id}`
- [x] Chapter overview table with progress bars
- [x] Activity API returns note titles + verse keys
- [x] QF activity API returns verse ranges
- [x] Fixed QF API error: `first` param limited to 20

### Mention System Enhancements
- [x] Keyboard navigation: Arrow keys + Enter to select, Escape to close
- [x] Verse preview in dropdown: Arabic text + English translation
- [x] Chapter name shown in verse mode header
- [x] Verse insertion format: `@2:255 => ""` with cursor between quotes
- [x] New endpoint: `/api/quran/chapter-verses` for verse preview data
- [x] Server-side caching for chapter verses (5 min)
- [x] Chapter-only search (`11` to `114`) returns chapters + verses
- [x] MentionList.vue handles mixed chapter/verse items

## Session Updates (2026-05-16)

### Route Restructuring
- [x] `/browse` → `/quran` (chapter grid)
- [x] `/verse/[id]` → `/quran/verse/[id]` (verse detail)
- [x] All internal links updated to new paths

### QF Bookmarks
- [x] POST/GET/DELETE bookmark API endpoints
- [x] Bookmark toggle button on verse detail page
- [x] Bookmarks list page (`/bookmarks`) with preview cards
- [x] `useQfBookmarks` composable with session expiry handling
- [x] `BookmarkSlidePanel` component (Arabic, translation, tafsir)
- [x] Session expiration auto-cleanup from `qf_connections` table

### Chapter-Verses Endpoint
- [x] `GET /api/quran/chapter-verses?chapterId=N` for verse preview data
- [x] 5-minute server-side caching

### OAuth Scopes
- [x] Updated to include `bookmark` scope

### CommandPalette Enhancement
- [x] Type `@chapter` (e.g., `@11` or `11`) to see first 10 verses with translation
- [x] Type `@chapter:verse` (e.g., `@11:5`) to jump directly with preview content
- [x] Verse preview cache for performance
- [x] API search fallback for text content
- [x] Notes search for authenticated users

### NotePanel Component
- [x] Slide-in panel for note view/edit on verse detail page
- [x] View mode and edit mode support
- [x] Verse mention support (click to open VersePanel)
- [x] Stacking with VersePanel

### Split QF Credentials
- [x] Content API uses `QF_CONTENT_CLIENT_ID` / `QF_CONTENT_CLIENT_SECRET` (production)
- [x] User API uses `QF_CLIENT_ID` / `QF_CLIENT_SECRET` (prelive)
- [x] Updated nuxt.config.ts with split config maps

## Session Updates (2026-04-19)

- [x] Verse detail page fixes:
  - [x] Chapter name (Al-Fatihah vs "Chapter 1")
  - [x] Verse count (1/7 vs 1/0)
  - [x] Tafsir expandable section (removed dropdown)
  - [x] Related verses with content
  - [x] CTA centering

### Final Polish & Bug Fixes (2026-05-01)
- [x] Inline VersePanel reading integrated into `/notes` list and Dashboard recent notes.
- [x] Unified Search highlighing (Command Palette + Advanced Search note titles).
- [x] Profile page display name save 404 fix.
- [x] Dashboard greeting & VerseCard text fetching.
- [x] Mentions support for chapters 11-114 fix.
- [x] Automated Image Processing: Extracted generated AI logo using Node.js (`jimp`) to generate transparent light/dark mode variants (`logo-light.png`, `logo-dark.png`) and `favicon.png`.
- [x] Logo UI Integration: Created `<Logo />` Vue component and integrated across navbar, login page, and `useHead` layout.
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

**Completed (2026-05-16):**
- [x] OAuth Authorization Code + PKCE flow
- [x] Supabase persistence (`qf_connections` table)
- [x] Auto-restore QF session on page load (`server/middleware/qf-session.ts`)
- [x] Connection status API (`GET /api/qf/connection`)
- [x] Disconnect API (revoke token on QF + delete local record)
- [x] User menu shows QF connection status (green dot / Connect button)
- [x] QfConnectModal with connected/disconnected states
- [x] Heatmap combined activity calendar (notes + reading)
- [x] Activity list with meaningful descriptions and clickable verses/notes
- [x] OAuth callback redirects to previous page after success
- [x] **Bookmarks API** — save/remove verses to QF account
- [x] Bookmark button on verse detail page (`/quran/verse/[id]`)
- [x] `useQfBookmarks` composable for frontend state

**Planned Features:**
- [ ] Sync reading progress across apps (future)
- [ ] User-specific highlights backup (future)

**Implementation Notes:**
- QF user APIs use separate base URL (`userApiBase` in config)
- Token scopes: `openid offline_access activity_day streak bookmark`
- Requires OAuth token (Authorization Code + PKCE)
- Refresh tokens auto-restored from Supabase when cookies missing

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
   - `supabase/migrations/20260421000000_qf_connections.sql` (QF OAuth persistence)
   - `supabase/migrations/20260501000000_profiles.sql` (User profiles)

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