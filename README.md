# Qayra

Note-first Islamic knowledge workspace: **Supabase** (notes + Postgres full-text search) and **Quran Foundation** APIs (Content + Search via OAuth2 `client_credentials` on Nitro).

## Setup

```bash
npm install
cp .env.example .env
```

1. Add **Supabase** URL + anon key from the [Supabase dashboard](https://supabase.com/dashboard) (Auth → enable Email).
2. Run the SQL in [`supabase/migrations/20260414000000_notes.sql`](supabase/migrations/20260414000000_notes.sql) in the Supabase SQL editor (creates `notes`, `note_verses`, RLS, FTS, `search_user_notes` RPC).
3. Add **Quran Foundation** `QF_CLIENT_ID` and `QF_CLIENT_SECRET` (prelive credentials use the default `QF_API_BASE` / `QF_OAUTH_TOKEN_URL` in `.env.example`).

## Dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000): **Notes** (sign in with magic link), **Browse Quran** (chapters + verse), search notes with Postgres FTS.

## Build

```bash
npm run build
node .output/server/index.mjs
```

## Quran Foundation

The npm package `@quranjs/api` in this repo targets **quran.com**; the app uses **direct HTTP** to QF with `x-auth-token` + `x-client-id` per [QF Content APIs](https://api-docs.quran.foundation/docs/content_apis_versioned/content-apis/). If you obtain a Quran Foundation–specific SDK that matches their portal, you can swap the Nitro helpers in `server/utils/qfHttp.ts`.
