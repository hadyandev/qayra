# Qayra

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

Qayra uses Quran Foundation APIs as the source of truth for Quran content and activity.

### Content APIs
- Chapters, verses, translations, tafsir  
- Verse search  
- Chapter-by-chapter verse listing with previews

### User APIs (OAuth2 + PKCE)
- Full OAuth2 Authorization Code flow with PKCE
- Auto-restore session from Supabase on page load
- Record Quran reading activity  
- Record learning activity (notes/reflections)  
- Support progress tracking (heatmap, active days)  
- Disconnect with token revocation

### Connected Features
- One-time QF account connection — persists across logins
- Unified activity calendar combining local notes + QF reading sessions
- Clickable verse mentions in activity list
- Auto-sync reading activity to QF on note creation and verse viewing

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
