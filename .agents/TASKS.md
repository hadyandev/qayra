# 🌙 QAYRA — Development Tasks

> Quran-centered reflection system  
> Hackathon: https://launch.provisioncapital.com/quran-hackathon

---

## 📋 Current Status

**Foundation:** ✅ Complete (Nuxt 3, Supabase, QF API structure)
**MVP Goal:** 🎯 Functional search, verse display, reflections, OAuth

---

## 🎯 Task Breakdown

### Iteration 1: Core Search & Verse Display
- [ ] **Task 1.1:** Implement Quran Foundation API search in `useQuran.ts`
- [ ] **Task 1.2:** Update index.vue with real search results
- [ ] **Task 1.3:** Fetch verse detail with translation in `[id].vue`
- [ ] **Task 1.4:** Add loading states and error handling

### Iteration 2: Reflection System
- [ ] **Task 2.1:** Fix Supabase schema (add user_id, timestamps)
- [ ] **Task 2.2:** Implement save reflection API
- [ ] **Task 2.3:** Display reflection list per verse
- [ ] **Task 2.4:** Add delete/edit reflection

### Iteration 3: OAuth & Publishing
- [ ] **Task 3.1:** Setup OAuth login flow
- [ ] **Task 3.2:** Store token in secure cookie
- [ ] **Task 3.3:** Implement publish to QF posts
- [ ] **Task 3.4:** Add auth state to UI

### Iteration 4: UI Polish
- [ ] **Task 4.1:** Add proper Nuxt UI components
- [ ] **Task 4.2:** Responsive design
- [ ] **Task 4.3:** Dark mode support
- [ ] **Task 4.4:** Arabic font rendering

---

## 📁 Files to Modify

| File | Purpose |
|------|---------|
| `composables/useQuran.ts` | QF API integration |
| `pages/index.vue` | Search interface |
| `pages/verse/[id].vue` | Verse + reflection UI |
| `server/api/reflection.post.ts` | Save reflection |
| `server/api/auth/*.ts` | OAuth flow |
| `supabase/schema.sql` | Database schema |
| `nuxt.config.ts` | Config updates |

---

## 🚀 Commit Pattern

```
[QAYRA-ITER-{N}] {task description}

- What changed
- Why changed
- Status: ✅/🔄
```

---

## 📝 Notes

- Quran content fetched live from QF API (no storage)
- Reflections stored in Supabase
- OAuth for optional publishing to QF

**Next Action:** Start Iteration 1 — Task 1.1 (API integration)
