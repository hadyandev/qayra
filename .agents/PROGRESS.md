# Qayra — progress

**Last updated:** 2026-04-14

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

## Manual step for you

Run [`supabase/migrations/20260414000000_notes.sql`](../supabase/migrations/20260414000000_notes.sql) in the Supabase SQL editor so notes + RPC exist.

## Note on `@quranjs/api`

The published npm `@quranjs/api` targets **quran.com** REST. The app uses **direct QF HTTP** in `server/utils/qfHttp.ts` for hackathon alignment; swap if QF ships a matching SDK on npm.

## Design System

Premium Editorial Luxury theme applied:
- Canvas Sand (`#FAF9F6`) background
- Ink Charcoal (`#18181B`) typography
- Forest Gold (`#D97706`) accent
- Outfit font family
- Spring physics animations
- Asymmetric bento layouts
