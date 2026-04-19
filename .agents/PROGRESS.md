# Qayra — progress

**Last updated:** 2026-04-19

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

## Recent Updates (2026-04-19)

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

### User APIs (Planned - Not Implemented Yet)
- Bookmarks/favorites
- Sync reading progress
- User-specific highlights

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