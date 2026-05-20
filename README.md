# Qayra

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/logo-dark.png">
    <img src="public/logo-light.png" alt="Qayra Logo" width="120" height="120" />
  </picture>
</p>

> A Quran learning workspace where your notes connect directly to verses.

---

## Overview

Qayra is a note-first workspace designed to support active Quran learning.

Instead of focusing only on reading, Qayra helps users capture reflections, connect them to specific verses, and track their learning journey across the Quran over time.

---

## Why Qayra?

Many tools help people read the Quran, but fewer help them **retain and structure what they learn**.

When learning from:
- personal study  
- lectures or khutbahs  
- tafsir or discussions  

Notes often become scattered and disconnected from the Quran itself.

Qayra addresses this by making the Quran part of the note-taking process.

---

## What Qayra Enables

- ✍️ Write notes with `@verse` mentions (e.g. `@2:153`)
- 🔗 Connect thoughts directly to Quran verses  
- 📖 Browse the Quran and view related notes  
- 📊 Track learning activity with a GitHub-style heatmap
- 📈 Measure progress across chapters and verses  
- 🔐 Connect Quran Foundation account for cross-app sync
- 📅 Persistent login — connect once, stay connected

---

## How It Supports Quran Engagement

Qayra encourages a shift from passive reading to active engagement:

- Writing reflections instead of only consuming content  
- Linking understanding directly to verses  
- Revisiting notes in context  
- Tracking consistency and growth over time  

---

## Who It's For

- Individuals learning the Quran independently  
- Students of tafsir and Islamic studies  
- Anyone who wants to organize Quran-based knowledge in a structured way  

---

## Tech Stack

- Nuxt 3, Vue 3, Tailwind CSS  
- Nuxt UI, Nuxt Icon  
- Nitro server  
- Supabase (PostgreSQL + Auth)  
- TipTap (rich text editor)  
- Quran Foundation APIs (OAuth2 PKCE)

---

## Quran Foundation Integration

Qayra uses **Quran Foundation (QF) APIs** as the primary source for Quran content and as a sync backend for user activity across devices.

QF provides two API families, each with separate credentials and environments.

---

### Content APIs

Used for reading Quran data: chapters, verses, translations, tafsir, and search.

| Endpoint | Usage |
|----------|-------|
| `/content/api/v4/chapters` | All 114 surahs with names, verse counts |
| `/content/api/v4/verses/by_key/{key}` | Single verse with translation + tafsir |
| `/content/api/v4/verses/by_chapter/{id}` | All verses in a chapter |
| `/content/api/v4/search` | Multi-language verse search |

**Authentication:** Client credentials grant (server-to-server).
**Credentials:** `QF_CONTENT_CLIENT_ID` / `QF_CONTENT_CLIENT_SECRET`.
**Base URL:** `https://apis.quran.foundation` (production), configurable via `QF_CONTENT_API_BASE`.
**Environment:** Controlled by `QF_CONTENT_ENV` (defaults to `production`).
**Fallback:** If content credentials are missing, falls back to user API credentials (`QF_CLIENT_ID` / `QF_CLIENT_SECRET`).

**Content API is always production** — all 114 chapters available, no restrictions.

---

### User APIs

Used for user-specific data: bookmarks, activity days, streaks, and notes.

| Endpoint | Scope | Usage |
|----------|-------|-------|
| `/auth/v1/activity-days` | `activity_day` | Log and query reading/learning activity |
| `/auth/v1/streaks` | `streak` | Current and longest reading streaks |
| `/auth/v1/bookmarks` | `bookmark` | Save/remove/list verse bookmarks |
| `/auth/v1/notes` | `note` | Personal notes API (optional) |
| `/auth/v1/goals` | `goal` | Reading goals (future) |

**Authentication:** OAuth2 Authorization Code + PKCE (user delegated).
**Credentials:** `QF_CLIENT_ID` / `QF_CLIENT_SECRET`.
**Base URL:** `https://apis-prelive.quran.foundation` (prelive), configurable via `QF_USER_API_BASE`.
**Token URL:** `https://prelive-oauth2.quran.foundation/oauth2/token` (prelive).
**Environment:** Controlled by `QF_ENV` (defaults to `prelive`).

**User API currently uses prelive** — for testing OAuth, activity, bookmarks, and streaks.

---

### OAuth Flow

Qayra implements the full Authorization Code + PKCE flow:

1. **Initiate:** User clicks "Connect QF Account" → redirects to QF's authorization page
2. **Callback:** QF redirects back with authorization code → exchanged for tokens
3. **Persistence:** Refresh token stored in Supabase (`qf_connections` table) + httpOnly cookies
4. **Auto-restore:** Middleware (`server/middleware/qf-session.ts`) restores session on page load
5. **Auto-refresh:** Tokens refreshed automatically when expired (stampede prevention)
6. **Disconnect:** Revokes token on QF + deletes local connection + clears cookies

**Scopes requested:** `openid offline_access activity_day streak bookmark`
- `note` scope can be added for QF notes API access

Session expiration is handled gracefully — expired connections are cleaned from the database automatically, and the UI shows a "reconnect" message instead of a cryptic error.

---

### Split Environment Architecture

Qayra keeps QF environments split by API family so you can use **production content** (all 114 chapters) alongside **prelive user APIs** for testing:

```
QF_CONTENT_ENV=production    # Content API: production credentials
QF_ENV=prelive               # User API: prelive credentials
```

Configured in `nuxt.config.ts` using separate config maps for each environment.

---

### Connected Features

- **Bookmarks:** Save/remove verses to your QF account from any verse detail page. Bookmarks list page with preview cards and slide panel for full verse details.
- **Activity Tracking:** QF activity API (activity_days + streaks) integrated with the heatmap calendar, combining local notes and reading sessions into a single view.
- **Session Persistence:** One-time QF connection persists across browser sessions. Log in on any device, and Qayra restores your QF session automatically.
- **Mention System:** Inline `@verse` mentions in the TipTap editor search all 114 chapters with Arabic + translation previews. Keyboard navigation, mixed chapter/verse results.

---

### Quick Start

```bash
# Content API credentials (production — all 114 chapters)
QF_CONTENT_CLIENT_ID=xxx
QF_CONTENT_CLIENT_SECRET=xxx

# User API credentials (prelive — OAuth + bookmarks + activity)
QF_CLIENT_ID=xxx
QF_CLIENT_SECRET=xxx

# OAuth scopes
QF_OAUTH_SCOPES="openid offline_access activity_day bookmark"
```

---

## Features

### Notes
- Rich text editor (TipTap) with bold, italic, headings, lists, quotes
- `@verse` mention system with chapter/verse picker and Arabic + translation preview
- Keyboard navigation (↑/↓ arrows + Enter to select)
- Verse chips render as styled badges that navigate to verse detail
- Full-text search via Postgres FTS

### Quran Reader
- Browse by chapter grid
- Verse detail pages with Arabic, translation, tafsir
- Related verses from topics and same chapter
- Fallback verse data for first 10 verses
- Auto-log reading activity to QF

### Statistics & Activity
- Combined activity calendar (notes + reading sessions)
- Stats cards: Notes, Reading Sessions, Active Days, Completion %
- Recent activity list with clickable verse references and note links
- Chapter overview with progress bars

### Authentication
- Supabase magic link auth
- QF OAuth2 PKCE integration with Supabase persistence
- Auto-restore QF session from stored refresh tokens

---

## Setup

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
```

Fill environment variables for Supabase and Quran Foundation.

**Qayra splits Quran Foundation credentials by API family** for maximum flexibility:

| Variable | Purpose | Environment |
|----------|---------|-------------|
| `QF_CONTENT_CLIENT_ID` / `QF_CONTENT_CLIENT_SECRET` | Quran content & search | **Production** (all 114 chapters) |
| `QF_CLIENT_ID` / `QF_CLIENT_SECRET` | OAuth, bookmarks, activity, streaks | **Prelive** (testing) |
| `QF_CONTENT_API_BASE` | Content API base URL | Production by default |
| `QF_ENV` | User API environment | `prelive` by default |
| `QF_OAUTH_SCOPES` | OAuth permission scopes | `openid offline_access activity_day streak bookmark` |

All credentials remain server-side only (never exposed to the client).

### Database

Run migrations in Supabase Dashboard SQL Editor:

1. `supabase/migrations/20260414000000_notes.sql`
2. `supabase/migrations/20260414001000_disable_rls_for_testing.sql` (optional)
3. `supabase/migrations/20260414002000_sources_and_speakers.sql`
4. `supabase/migrations/20260421000000_qf_connections.sql` (QF OAuth persistence)

### Run

```bash
npm run dev
```

---

## Key Idea

> Qayra is not a Quran reader.

It is a **workspace for learning through writing and connection**.

---

## One-sentence Summary

Qayra is a note-first Quran learning workspace that helps users connect their thoughts directly to verses and track their learning journey over time.

---

## License

MIT
