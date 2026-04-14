# Qayra v2 — Full Product, Technical & Editor Specification

---

# 1. Overview

Qayra is a Quran-powered knowledge workspace designed for capturing, structuring, and revisiting Islamic knowledge (kajian, khutbah, personal study) with contextual linkage to Quranic verses.

Unlike Quran readers or reflection apps, Qayra is **note-first**, not verse-first.

---

# 2. Vision

> Build a second brain for Islamic knowledge, grounded in the Quran.

---

# 3. Core Principles

- Quran content is fetched from QF APIs (no storage)
- Notes are the primary entity
- Verses are references, not anchors
- Knowledge > content consumption
- Optional ecosystem sync (QF)

---

# 4. Core Concepts

## 4.1 Note (Primary Entity)

A note represents structured knowledge.

Fields:
- title
- content (rich text)
- source (kajian, khutbah, personal)
- speaker (optional)
- date
- tags

---

## 4.2 Verse Reference

- Format: @2:153
- Stored as: verse_key
- Extracted from content

---

## 4.3 Snippet (for publishing)

- Extracted from note
- Short meaningful insight
- Sent to QF API

---

# 5. Key Features

## 5.1 Note Management
- Create / edit / delete notes
- Rich text editor
- Tagging
- Source & date metadata

---

## 5.2 Verse Mention System
- Type @ → trigger verse search
- Select verse → insert inline reference
- Auto-link verse_key

---

## 5.3 Quran Integration
- Click verse → fetch from QF API
- Show:
  - Arabic
  - Translation
  - Tafsir

---

## 5.4 Search System
- Full-text search on notes
- Filter by:
  - tags
  - source
  - date

---

## 5.5 Timeline View
- Chronological notes
- Based on note_date

---

## 5.6 Optional Publishing
- User selects snippet
- System extracts verses
- Sends to QF per verse

---

# 6. User Flow

## Primary Flow

1. User logs in
2. Creates note
3. Writes content
4. Mentions verses (@2:153)
5. Saves note
6. System extracts verse references
7. User optionally publishes snippet
8. Notes appear in timeline

---

# 7. System Architecture

Frontend:
- Nuxt 3

Backend:
- Nitro server

Database:
- Supabase

Search:
- Meilisearch

External:
- Quran Foundation APIs

---

# 8. Database Schema

## notes

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  source text,
  speaker text,
  note_date date,
  created_at timestamp default now()
);
```

## note_verses

```sql
create table note_verses (
  note_id uuid references notes(id),
  verse_key text
);
```

---

# 9. Editor Specification (DEEP)

## 9.1 Editor Type

- Rich text editor (TipTap recommended)
- Supports inline tokens

---

## 9.2 Mention Trigger

Trigger:
- Character: @

---

## 9.3 Mention Flow

1. User types "@"
2. System opens dropdown
3. User types query (e.g. "2:153" or keyword)
4. System fetches from QF API
5. User selects verse
6. Insert formatted token

---

## 9.4 Mention Token Format

Internal:
```json
{
  "type": "verse",
  "verse_key": "2:153"
}
```

Rendered:
@2:153

---

## 9.5 Parser (Extract Verses)

```js
const extractVerses = (text) => {
  const regex = /@(\d+:\d+)/g
  return [...text.matchAll(regex)].map(m => m[1])
}
```

---

## 9.6 Edge Cases

- Duplicate verses → deduplicate
- Invalid format → ignore
- Deleted mention → update relation

---

# 10. API Design

## Create Note

POST /api/notes

```json
{
  "title": "...",
  "content": "...",
  "source": "kajian",
  "note_date": "2026-01-01"
}
```

---

## Publish Snippet

POST /api/publish

```json
{
  "note_id": "...",
  "snippet": "...",
  "verses": ["2:153", "94:5"]
}
```

---

# 11. QF API Integration

## Content API
- search verses
- fetch verse detail
- fetch tafsir

## User API
- publish post per verse

---

# 12. Implementation Steps

## Phase 1 — Setup
- Nuxt project
- Supabase setup
- Env config

---

## Phase 2 — Auth
- Supabase auth (email/magic link)
- Session handling

---

## Phase 3 — Notes CRUD
- Create note
- Edit note
- Delete note
- Fetch list

---

## Phase 4 — Editor + Mention
- Integrate editor (TipTap)
- Implement @ trigger
- Build verse search dropdown
- Insert mention token

---

## Phase 5 — Quran API
- Integrate search API
- Integrate verse detail API
- Display tafsir

---

## Phase 6 — Search
- Setup Meilisearch
- Index notes
- Build search UI

---

## Phase 7 — QF User API
- OAuth login
- Store token
- Publish snippet per verse

---

## Phase 8 — Timeline
- Sort by date
- Filter by source

---

# 13. Search Design

Indexed fields:
- title
- content
- tags
- source

---

# 14. Security

- HTTPS
- Secure cookies
- No Quran data storage
- RLS (Supabase)

---

# 15. Positioning

Qayra is not:
- a Quran reader
- a reflection feed

Qayra is:
> a Quran-powered knowledge workspace

---

# 16. Future Roadmap

- AI summarization
- Auto verse detection
- Knowledge graph
- Video transcription → notes

---

# 17. Developer Notes

- Prioritize core flow:
  create note → mention → save
- Avoid overengineering
- Focus UX clarity

---

END
