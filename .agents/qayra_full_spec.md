# Qayra — Full Product, Technical & Implementation Specification (v3)

## 1. Overview
Qayra is a Quran-centered reflection and knowledge system that transforms passive reading into active thinking.

---

## 2. Vision
Build a personal thinking system on top of the Quran where every verse becomes a node of insight.

---

## 3. Core Principles
- Quran content always fetched from Quran Foundation APIs
- No long-term storage of Quran content
- Reflection is the atomic unit
- Notes are containers
- Publishing is optional

---

## 4. Architecture

Frontend:
- Nuxt 3 + Nuxt UI

Backend:
- Nitro server

Database:
- Supabase

Search:
- Meilisearch

External:
- Quran Foundation APIs

---

## 5. Data Flow

User → UI  
→ QF API (search, verses, tafsir)  
→ Backend → Supabase (store reflections)  
→ Backend → QF API (publish optional)  
→ Meilisearch (search reflections)

---

## 6. Database Schema

```sql
create table reflections (
  id uuid primary key default gen_random_uuid(),
  verse_key text not null,
  content text not null,
  created_at timestamp default now()
);
```

---

## 7. API Integration

### Quran Foundation

Search:
GET /search?q=

Verse:
GET /verses/by_key/{key}

Publish:
POST /posts

---

## 8. OAuth Flow

1. Redirect to QF OAuth
2. Receive code
3. Exchange for token
4. Store token in cookie

---

## 9. Supabase Integration

- Store reflections
- Query reflections by verse

---

## 10. Meilisearch

Index:
- reflections

Fields:
- content
- verse_key

---

## 11. API Contract

POST /api/reflection

Request:
{
  "verse_key": "2:153",
  "content": "...",
  "publish": true
}

---

## 12. UI Pages

/
- search

/verse/[id]
- verse detail
- reflection input
- reflection list

---

## 13. UX Flow

Search → Open Verse → Reflect → Save → (Optional Publish)

---

## 14. Security

- HTTPS
- Secure cookie
- No Quran data storage

---

## 15. Dev Setup

npm install  
cp .env.example .env  
npm run dev  

---

## 16. Future

- AI reflection
- tagging
- knowledge graph

---

## 17. Positioning

Qayra is not a Quran reader.  
Qayra is a thinking system.

---

END
