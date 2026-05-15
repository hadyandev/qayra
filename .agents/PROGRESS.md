# Qayra — progress

**Last updated:** 2026-05-15

## Implemented

- **Supabase Auth** (magic link) + **RLS** on `notes` / `note_verses`.
- **Notes CRUD** + **Postgres FTS** (`search_vector`, `search_user_notes` RPC) + `/api/search/notes`.
- **Quran Foundation** (prelive): OAuth client credentials, `x-auth-token` + `x-client-id`, chapters / verse / search Nitro routes.
- **UI:** All pages redesigned with premium editorial luxury theme.
  - Home hub, `/notes` timeline + filters, TipTap note editor, `/browse` chapter grid, `/verse/[id]` reader.
  - Auth pages: `/login`, `/confirm`.
  - Floating glass navigation with spring animations.
- **Publish API:** `POST /api/publish` for QF snippet publishing.
- **TypeScript types:** `types/database.types.ts` for Supabase.
- **README / `.env.example`** document setup.
- **Prelive flag** - displays PRELIVE badge in top-left corner when `QF_ENV=prelive`
- **Random verse restriction** - only chapters 1-2 in prelive mode
- **QF OAuth2 Integration (PKCE + Supabase persistence)** — completed 2026-05-01
- **NotePanel component** — slide-in panel for note view/edit on verse detail page
- **Mention system** — fully working with chapter search + verse preview
- **CommandPalette** — Ctrl+K search with chapter verse display
- **Split QF credentials** — content API uses production, user API uses prelive

## QF OAuth2 Integration (2026-05-01)

### What was built
- **OAuth Authorization Code + PKCE flow** replacing client_credentials
- **Scopes:** `openid offline_access activity_day streak`
- **Supabase persistence:** `qf_connections` table stores refresh token, user info, scopes
- **Auto-restore middleware:** `server/middleware/qf-session.ts` restores QF session on every page load when cookies are missing
- **One-time login:** User connects QF account once, stays connected across browser sessions

### New files
- `supabase/migrations/20260421000000_qf_connections.sql` — Table with RLS policies
- `server/api/qf/connection.get.ts` — Connection status API
- `server/api/qf/connection.delete.ts` — Disconnect API (revoke token + delete local record)
- `server/middleware/qf-session.ts` — Auto-restores QF session from Supabase on page load
- `composables/useQfConnection.ts` — Frontend composable for connection state
- `server/api/qf/oauth/callback.ts` — OAuth callback (GET + POST), saves to Supabase

### Modified files
- `server/api/qf/oauth/login.get.ts` — PKCE auth URL + custom redirect support
- `server/utils/qfTokenExchange.ts` — Added `first_name`/`last_name` to IdTokenPayload
- `server/api/qf/user-activity.get.ts` — Returns ranges from QF activity
- `server/api/activity/index.get.ts` — Returns note details with titles + verse keys
- `layouts/default.vue` — User menu shows QF status (green dot / Connect button)
- `components/QfConnectModal.vue` — Connected/disconnected states
- `pages/oauth/callback.vue` — OAuth callback page with redirect
- `pages/heatmap/index.vue` — Complete rewrite (see below)

### Disconnect behavior
Disconnecting revokes the token on QF's `/oauth2/revoke` endpoint, deletes the local `qf_connections` record, and clears cookies. No redirects or extra steps.

## Heatmap / Statistics Page Rewrite (2026-05-01)

### Calendar
- Combined activity calendar showing **both notes + reading sessions** on one GitHub-style grid
- Fixed date mismatch: uses local dates (`formatLocalDate`) instead of UTC (`toISOString`) so today's readings appear correctly
- Click any cell to see breakdown (notes vs readings count)
- Amber color scale (4 levels) for contribution intensity

### Stats cards
- **Notes** — total notes count
- **Reading Sessions** — total QF reading sessions
- **Active Days** — unique days with any activity
- **Completion** — percentage of verses with notes

### Recent Activity List
- Combined list of notes + reading sessions, sorted by date
- **Notes with verses:** `Reflected on 2:255` — verse is clickable, navigates to `/verse/2:255`
- **Notes with title only:** `Created note "My Thoughts"` — entire description clickable, navigates to `/notes/{id}`
- **Reading sessions:** `Read 2:255-260, 3:1-5` — verse ranges are clickable, navigates to `/verse/{range}`
- Multiple verse ranges shown up to 3, then `+N more`

### Chapter Overview
- Table showing all chapters with note counts and progress bars
- Clickable rows navigate to chapter heatmap

### Activity API (`/api/activity`)
Now returns enriched data:
```json
{
  "weeks": [...],
  "noteDetails": [
    { "id": "uuid", "date": "2026-05-01", "title": "My Note", "verseKeys": ["2:255"] }
  ]
}
```

### QF Activity API (`/api/qf/user-activity`)
Returns activity with ranges:
```json
{
  "authenticated": true,
  "activities": [
    { "date": "2026-05-01", "count": 60, "type": "QURAN", "ranges": ["2:255-260"] }
  ]
}
```

## Recent Updates (2026-04-19)

### QF Activity Integration
- Note creation logs LESSON activity to QF (`/auth/v1/activity-days` POST)
- Verse viewing logs QURAN activity after 10 seconds
- Heatmap uses local activity data (notes from Supabase)
- Activity list shows recent notes with date + count
- Info message on heatmap: "QF activity logs here after OAuth is configured"

### Verse Detail Page
- Chapter name displays correctly (Al-Fatihah instead of "Chapter 1")
- Verse count shows correct total (1/7 instead of 1/0)
- Tafsir section is expandable (no dropdown)
- Related verses from topic + same chapter
- Fallback verse data for first 10 verses (Arabic + translation) when QF API returns empty
- "New note citing this verse" CTA is centered

### Navigation & Layout
- Footer added to default layout (same as homepage)
- Hadith menu commented out in navigation

### Dashboard
- Stats now uses same API as heatmap page (`/api/heatmap`, `/api/activity`)
- Shows: Notes, Cited Verses, Active Days, Chapters

## QF Integration Status

### Content APIs (Implemented)
- Chapters API (`/content/api/v4/chapters`)
- Verses API (`/content/api/v4/verses/by_key/:key`)
- Chapter Verses API (`/content/api/v4/verses/by_chapter/:id`)
- Tafsir API (via verses endpoint)
- Translations (via verses endpoint)
- Search API (basic)

### User APIs (PRELIVE — OAuth PKCE)
- POST to `/auth/v1/activity-days` works ✅
- GET from `/auth/v1/activity-days` works ✅ (with user OAuth token)
- OAuth Authorization Code + PKCE flow fully implemented ✅
- Auto-restore from Supabase ✅
- Disconnect (revoke + cleanup) ✅

### QF API constraints
- `/auth/v1/activity-days` GET `first` param max: **20**
- QF User APIs require user OAuth token (not client_credentials)
- Refresh tokens are simple base64 (for now)

## Mention System (2026-05-15)

### Keyboard Navigation
- **Arrow keys (↑/↓)** navigate through the dropdown list
- **Enter** selects the highlighted item — no need to click
- **Escape** closes the dropdown

### Verse Insertion Format
- Selecting a verse inserts `@2:255 => ""` with cursor placed **between the quotes**
- Ready for immediate typing of reflection

### Verse Preview in Dropdown
- When selecting a chapter (e.g., `@11`), shows up to 10 verse previews with Arabic + English
- When selecting a specific verse (e.g., `@11:5`), shows actual verse content
- Falls back to "Jump directly to this verse" if preview not available

### Chapter Search (e.g., `11`)
- Query `11` to `114` returns both matching chapters AND verses (if exact chapter match)
- Chapter items show name + verse count

### CommandPalette Integration
- `Ctrl+K` opens search panel
- Type `@chapter` (e.g., `@1`) to see verses from that chapter
- Type `@chapter:verse` (e.g., `@1:1`) to jump directly to specific verse
- Verse previews show translation text (up to 10 results)
- Falls back to API search for text content

### New Endpoint
- `GET /api/quran/chapter-verses?chapterId=N` — fetches Arabic + translation for all verses in a chapter
- Cached for 5 minutes server-side
- Used by both MentionList and CommandPalette

## CommandPalette Search (2026-05-15)

### Search Capabilities
- Type `@chapter` (e.g., `@11` or `11`) to see first 10 verses with Arabic + translation
- Type `@chapter:verse` (e.g., `@11:5`) to jump directly with preview content
- API search for text content (fallback when no chapter match)
- Notes search for authenticated users

### Display
- Verse items show verse key badge + Surah name + preview text
- Notes items show icon + title + content snippet + date
- Keyboard navigation with visual highlight

## Final Polish & UX Improvements (2026-05-01)

### VersePanel Integration
- Integrated inline `VersePanel` reading into `/notes` list and Dashboard recent notes. Clicking an `@verse` chip smoothly opens the sliding panel instead of navigating away.
- VersePanel displays Arabic text, translation, and Tafsir beautifully with the Surah name.

### Search Highlighting
- Unified Search in Command Palette highlights search keywords in both note titles and content snippets.
- Advanced Search on the `/notes` page highlights search keywords in note titles.
- Jump to verse in Command Palette now displays full Surah names (e.g., "Al-Baqarah") alongside chapter numbers.

### Profile & Dashboard
- Fixed Profile page save functionality (reliably fetching User ID from session and handling upserts).
- Dashboard greeting fetches the user's display name.
- Dashboard "Verse of the Day" fully fetches Arabic text and English translation to populate the `VerseCard` correctly.

### App Branding & Logo Processing
- Processed the raw AI-generated Qayra logo using a custom Node.js `jimp` script (`image-processor/process.js`).
- Extracted transparent versions for dynamic UI integration:
  - `logo-light.png`: White background removed for seamless light mode support.
  - `logo-dark.png`: Charcoal colors intelligently inverted to off-white, while preserving the amber/golden accent colors.
  - `favicon.png`: Scaled down 32x32 variant.
- Built a Vue component (`components/Logo.vue`) to effortlessly handle dark/light mode switching using Tailwind classes (`dark:block`, `dark:hidden`).
- Logo implemented fully across the application: Top Navigation Bar (`layouts/default.vue`), Login Page (`pages/login.vue`), and document `useHead` (`app.vue`).

## Note on @quranjs/api

The published npm `@quranjs/api` targets **quran.com** REST. The app uses **direct QF HTTP** in `server/utils/qfHttp.ts` for hackathon alignment; swap if QF ships a matching SDK on npm.

## Design System

Premium Editorial Luxury theme applied:
- Canvas Sand (`#FAF9F6`) background
- Ink Charcoal (`#18181B`) typography
- Forest Gold (`#D97706`) accent
- Outfit font family
- Spring physics animations
- Asymmetric bento layouts
