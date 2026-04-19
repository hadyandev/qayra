# Qayra

A note-first Quran learning workspace where users capture reflections, connect them to specific verses, and track their learning journey across the Quran over time.

## What problem does Qayra solve?

Notes become scattered and disconnected from source material. There's no way to track Quran learning progress over time or find previous insights on specific verses. Most engagement is passive (just reading).

## How does Qayra help people engage with the Quran?

- Write notes with `@verse` mentions (e.g., `@2:153`) that link directly to Quran verses
- View verse detail pages with Arabic text, translations, and tafsir
- Visualize learning progress via activity calendar (heatmap)
- Track unique verses cited, chapters covered, and active days

## Primary audience

- Quran learners who want active engagement (writing notes, not just reading)
- Students of tafsir (Quranic interpretation)
- Anyone tracking personal Quran study progress

## Tech Stack

| Category | Technology |
|----------|----------|
| Frontend | Nuxt 3, Vue 3, Tailwind CSS |
| Icons | Nuxt Icon (Heroicons) |
| Backend | Nitro (Nuxt server) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Magic Link |
| External API | Quran Foundation OAuth2 |

## Quran Foundation APIs

### Content APIs (Implemented)

| API | Endpoint | Description |
|-----|---------|-----------|
| Chapters | `/content/api/v4/chapters` | List of all 114 surahs |
| Verse | `/content/api/v4/verses/by_key/:key` | Get specific verse |
| Chapter Verses | `/content/api/v4/verses/by_chapter/:id` | List verses in a chapter |
| Tafsir | `/content/api/v4/verses/by_key/:key?tafsirs=168,169` | Get tafsir (Ibn Kathir, etc.) |
| Translations | `/content/api/v4/verses/by_key/:key?translations=85` | Get translations |
| Search | `/content/api/v4/search/verses` | Search verses |

### User APIs (PRELIVE - client_credentials OAuth)

| API | Endpoint | Description |
|-----|---------|-----------|
| POST Activity | `/auth/v1/activity-days` | Log LESSON (note) or QURAN (reading) |
| GET Activity | `/auth/v1/activity-days` | Fetch user activity (requires user OAuth) |

**Note:** Using `client_credentials` OAuth allows POSTing activity but GET requires Authorization Code flow (needs redirect_uri registration). Activity logging works; heatmap uses local Supabase data for display.

### Environment

Set `QF_ENV=prelive` in `.env` for testing:

- Random verse on homepage restricts to chapters 1-2
- PRELIVE badge displays in top-left corner

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- [Supabase account](https://supabase.com)
- [Quran Foundation developer account](https://developer.quran.foundation)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase (get from https://supabase.com/dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Quran Foundation (get from developer portal)
QF_CLIENT_ID=your-client-id
QF_CLIENT_SECRET=your-client-secret
QF_ENV=prelive  # or 'live' for production
```

### 3. Set up Supabase

1. Create a new Supabase project
2. Run migrations in `supabase/migrations/`:
   - `20260414000000_notes.sql` — Creates `notes`, `note_verses` tables with RLS
   - `20260414_chapters.sql` — Seeds chapter data
   - Additional migrations as needed

3. Enable **Email** provider in Supabase Dashboard → Authentication → Providers

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Note-taking with @verse mentions

Write notes and mention verses using `@chapter:verse` (e.g., `@2:153`). These are auto-linked in the note viewer.

### Verse detail pages

Each verse has its own page with:
- Arabic text (Uthmani)
- Translations (configurable)
- Tafsir (Ibn Kathir, etc.)
- Related verses (same topic or chapter)
- Navigation to prev/next verse

### Activity calendar (heatmap)

Your note creation over the last year, similar to GitHub contributions graph.

### Chapter overview

See which chapters and verses have notes attached, with progress percentages.

### Full-text search

Search your notes using PostgreSQL full-text search (built into Supabase).

## API Reference

### Internal APIs

All internal APIs are prefixed with `/api/`:

| Endpoint | Description | Auth Required |
|---------|------------|-------------|
| `/api/notes` | List user's notes | Yes |
| `/api/notes` (POST) | Create note | Yes |
| `/api/notes/:id` | Get/update/delete note | Yes |
| `/api/quran/verse?key=1:1` | Get verse data | No |
| `/api/quran/chapters` | List chapters | No |
| `/api/heatmap` | User heatmap data | Yes |
| `/api/activity` | Activity calendar | Yes |

### Quran Foundation APIs (External)

The app proxies requests to Quran Foundation APIs. You don't need to call them directly — use the internal endpoints above.

For testing QF APIs directly:

```bash
# Get token
curl -X POST https://prelive-oauth2.quran.foundation/oauth2/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials&scope=content"

# Use token
curl https://apis-prelive.quran.foundation/content/api/v4/chapters \
  -H "x-auth-token: YOUR_TOKEN" \
  -H "x-client-id: CLIENT_ID"
```

## Database Schema

### Key Tables

```sql
notes:
  - id          (uuid, PK)
  - user_id     (uuid, FK to auth.users)
  - title      (text)
  - content    (text)
  - created_at (timestamptz)

note_verses:
  - id        (uuid, PK)
  - note_id   (uuid, FK to notes)
  - verse_key (text, e.g., "2:153")

chapters:
  - id           (int, PK)
  - name_simple  (text)
  - name_arabic (text)
  - verse_count (int)
```

### Row Level Security (RLS)

- `notes` table: Users can only see their own notes
- `note_verses`: Linked to notes, respects notes RLS

## Building for Production

```bash
npm run build
node .output/server/index.mjs
```

Set environment variables in your deployment platform (Vercel, Netlify, Railway, etc.).

## Project Structure

```
qayra/
├── pages/              # Vue pages (Nuxt file-based routing)
│   ├── index.vue      # Homepage
│   ├── dashboard.vue # User dashboard
│   ├── browse/      # Browse chapters
│   ├── heatmap/     # Activity calendar
│   ├── notes/      # Note CRUD
│   └── verse/      # Verse detail
├── components/       # Reusable Vue components
├── composables/      # Vue composables (useQuran.ts)
├── server/          # Nitro API server
│   ├── api/       # API endpoints
│   └── utils/     # Helpers (qfHttp.ts)
├── data/           # Static data (quranTopics.ts)
└── supabase/
    └── migrations/ # SQL migrations
```

## License

MIT

## Links

- GitHub: https://github.com/hadyandev/qayra
- Quran Foundation: https://quran.foundation
- Supabase: https://supabase.com