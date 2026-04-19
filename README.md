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
- Quran Foundation APIs  

---

## Quran Foundation Integration

Qayra uses Quran Foundation APIs as the source of truth for Quran content and activity.

### Content APIs
- Chapters, verses, translations, tafsir  
- Verse search  

### User APIs
- Record Quran reading activity  
- Record learning activity (notes/reflections)  
- Support progress tracking (heatmap, active days)  

---

## How Qayra Uses the APIs

- Fetches Quran data dynamically  
- Links verses to user notes  
- Records user activity (reading + learning)  
- Keeps user notes stored locally (Supabase)  

---

## Features

- Note-taking with `@verse` mentions  
- Verse detail pages (Arabic, translation, tafsir)  
- Activity calendar (heatmap)  
- Chapter progress overview  
- Full-text search  

---

## Setup

### Install

```
npm install
```

### Configure

```
cp .env.example .env
```

Fill environment variables for Supabase and Quran Foundation.

### Run

```
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
