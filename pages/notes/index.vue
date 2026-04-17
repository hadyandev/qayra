<template>
  <div class="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 font-sans transition-colors duration-300">
    <header class="pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div class="space-y-4">
          <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight font-display">
            Your Knowledge
          </h1>
          <p class="text-[#52525B] dark:text-stone-400 text-lg max-w-xl leading-relaxed">
            A quiet space for your notes, khutbahs, and personal studies. Rooted in the Quran.
          </p>
        </div>
        <div>
          <UButton 
            to="/notes/new" 
            class="bg-[#18181B] hover:bg-[#3f3f46] text-white dark:bg-amber-600 dark:hover:bg-amber-500 rounded-full px-6 py-2.5 font-medium shadow-sm transition-transform active:scale-95"
            icon="i-heroicons-plus"
          >
            New Note
          </UButton>
        </div>
      </div>

      <!-- Advanced Search & Filters -->
      <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] p-4 shadow-sm ring-1 ring-stone-200/30 dark:ring-stone-800/30 space-y-4">
        <!-- Main Search -->
        <div class="relative flex items-center px-4">
          <UIcon name="i-heroicons-magnifying-glass" class="text-stone-400 w-5 h-5 absolute left-6" />
          <input 
            v-model="filters.q" 
            placeholder="Search by title, content, or @verse (e.g., @2:153)..." 
            class="w-full pl-10 pr-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
            @keyup.enter="runSearch" 
          />
        </div>

        <!-- Filter Pills -->
        <div class="flex flex-wrap items-center gap-2 px-2">
          <span class="text-xs text-[#52525B] dark:text-stone-500 font-medium uppercase tracking-wide mr-2">Filters:</span>
          
          <div class="relative">
            <input 
              v-model="filters.source" 
              placeholder="Source"
              list="sources-filter"
              class="w-32 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-[#18181B] dark:text-stone-100 placeholder:text-stone-400"
            />
            <datalist id="sources-filter">
              <option v-for="s in uniqueSources" :key="s" :value="s" />
            </datalist>
          </div>

          <div class="relative">
            <input 
              v-model="filters.tag" 
              placeholder="Tag"
              list="tags-filter"
              class="w-28 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-[#18181B] dark:text-stone-100 placeholder:text-stone-400"
            />
            <datalist id="tags-filter">
              <option v-for="t in uniqueTags" :key="t" :value="t" />
            </datalist>
          </div>

          <div class="relative">
            <input 
              v-model="filters.verse" 
              placeholder="@verse"
              list="verses-filter"
              class="w-28 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 font-mono"
            />
            <datalist id="verses-filter">
              <option v-for="v in uniqueVerses" :key="v" :value="v" />
            </datalist>
          </div>

          <UButton 
            @click="runSearch" 
            class="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 py-1.5 text-sm font-medium transition-all hover:scale-105"
          >
            Search
          </UButton>
          
          <UButton 
            v-if="hasActiveFilters" 
            variant="ghost" 
            color="gray" 
            class="text-stone-500 hover:text-stone-700 text-sm"
            @click="clearFilters"
          >
            Clear all
          </UButton>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 pb-24">
      <UAlert v-if="error" color="red" :title="error" class="mb-8 rounded-2xl" />

      <div v-if="pending" class="flex flex-col gap-6 animate-pulse mt-8">
        <div v-for="i in 3" :key="i" class="h-32 bg-stone-200/50 dark:bg-stone-800/50 rounded-3xl"></div>
      </div>

      <div v-else-if="notes.length === 0" class="text-center py-24 flex flex-col items-center justify-center border-t border-stone-200 dark:border-stone-800/50 mt-8">
        <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center mb-6">
          <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-stone-300 dark:text-stone-600" />
        </div>
        <h3 class="text-xl font-medium text-[#18181B] dark:text-stone-100 mb-2">No notes found</h3>
        <p class="text-[#52525B] dark:text-stone-500 mb-6 max-w-sm">
          {{ hasActiveFilters ? 'Try adjusting your search filters.' : 'Capture your first note to get started.' }}
        </p>
        <NuxtLink to="/notes/new" class="text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 transition-colors">
          {{ hasActiveFilters ? 'Clear filters' : 'Start writing' }} &rarr;
        </NuxtLink>
      </div>

      <div v-else class="space-y-6 mt-8">
        <div class="flex items-center justify-between text-sm text-[#52525B] dark:text-stone-500">
          <span>{{ notes.length }} {{ notes.length === 1 ? 'note' : 'notes' }} found</span>
          <span v-if="hasActiveFilters" class="text-amber-600 dark:text-amber-500">Filtered results</span>
        </div>

        <article 
          v-for="n in notes" 
          :key="n.id" 
          class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.75rem] p-8 md:p-10 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200/60 dark:hover:border-amber-700/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
          @click="navigateTo(`/notes/${n.id}`)"
        >
          <div class="flex flex-col gap-6">
            <!-- Header: Date, Source, Speaker -->
            <div class="flex flex-wrap items-center gap-3 text-sm text-[#52525B] dark:text-stone-400">
              <time class="font-mono">{{ formatDate(n.note_date, n.created_at) }}</time>
              <span v-if="n.source" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-300">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {{ n.source }}
              </span>
              <span v-if="n.speaker" class="text-stone-400 dark:text-stone-500">— {{ n.speaker }}</span>
            </div>

            <!-- Title -->
            <h2 class="text-2xl md:text-3xl font-medium text-[#18181B] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              {{ n.title || 'Untitled Reflection' }}
            </h2>

            <!-- Verse References -->
            <div v-if="n.verse_keys?.length" class="flex flex-wrap gap-2">
              <NuxtLink 
                v-for="vk in n.verse_keys.slice(0, 5)" 
                :key="vk"
                :to="`/verse/${vk}`"
                class="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/50 rounded-full text-sm font-mono text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                @click.stop
              >
                @{{ vk }}
              </NuxtLink>
              <span v-if="n.verse_keys.length > 5" class="px-2 py-1 text-sm text-stone-400">
                +{{ n.verse_keys.length - 5 }} more
              </span>
            </div>

            <!-- Tags -->
            <div v-if="n.tags?.length" class="flex flex-wrap gap-2">
              <span 
                v-for="t in n.tags.slice(0, 4)" 
                :key="t" 
                class="px-3 py-1 bg-stone-50 dark:bg-stone-800/80 border border-stone-200/50 dark:border-stone-700 rounded-full text-xs text-[#52525B] dark:text-stone-400 whitespace-nowrap"
              >
                {{ t }}
              </span>
              <span v-if="n.tags.length > 4" class="px-2 py-1 text-xs text-stone-400">
                +{{ n.tags.length - 4 }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const user = useSupabaseUser()
if (!user.value) {
  navigateTo('/login')
}

type NoteRow = {
  id: string
  title: string | null
  note_date: string | null
  created_at: string
  source: string | null
  speaker: string | null
  tags: string[] | null
  verse_keys?: string[]
}

const notes = ref<NoteRow[]>([])
const allNotes = ref<NoteRow[]>([])
const pending = ref(true)
const error = ref('')
const filters = reactive({
  q: '',
  tag: '',
  source: '',
  verse: '',
  from: '',
  to: ''
})

const uniqueSources = computed(() => {
  const sources = new Set(allNotes.value.map(n => n.source).filter(Boolean))
  return Array.from(sources).sort()
})

const uniqueTags = computed(() => {
  const tags = new Set(allNotes.value.flatMap(n => n.tags || []))
  return Array.from(tags).sort()
})

const uniqueVerses = computed(() => {
  const verses = new Set(allNotes.value.flatMap(n => n.verse_keys || []))
  return Array.from(verses).sort((a, b) => {
    const [aChapter, aVerse] = a.split(':').map(Number)
    const [bChapter, bVerse] = b.split(':').map(Number)
    if (aChapter !== bChapter) return aChapter - bChapter
    return aVerse - bVerse
  })
})

const hasActiveFilters = computed(() => {
  return filters.q.trim() || filters.tag.trim() || filters.source.trim() || filters.verse.trim()
})

function formatDate(noteDate: string | null, created: string) {
  if (noteDate) return noteDate
  return new Date(created).toLocaleDateString()
}

async function load() {
  pending.value = true
  error.value = ''
  try {
    const { notes: rows } = await $fetch<{ notes: NoteRow[] }>('/api/notes')
    allNotes.value = rows ?? []
    
    // Fetch verse keys for each note
    const notesWithVerses = await Promise.all(
      allNotes.value.map(async (note) => {
        try {
          const { verse_keys } = await $fetch<{ verse_keys: string[] }>(`/api/notes/${note.id}`)
          return { ...note, verse_keys }
        } catch {
          return { ...note, verse_keys: [] }
        }
      })
    )
    notes.value = notesWithVerses
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to load notes'
    notes.value = []
  } finally {
    pending.value = false
  }
}

function runSearch() {
  let filtered = [...allNotes.value]
  
  // Full text search
  if (filters.q.trim()) {
    const q = filters.q.trim().toLowerCase()
    const isVerseSearch = q.startsWith('@')
    const verseQuery = isVerseSearch ? q.slice(1) : null
    
    filtered = filtered.filter(note => {
      // Search in title and content
      const titleMatch = note.title?.toLowerCase().includes(q) ?? false
      const contentMatch = note.content?.toLowerCase().includes(q) ?? false
      
      if (isVerseSearch && verseQuery) {
        return note.verse_keys?.some(vk => vk.toLowerCase().includes(verseQuery)) ?? false
      }
      
      return titleMatch || contentMatch
    })
  }

  // Filter by source
  if (filters.source.trim()) {
    filtered = filtered.filter(n => n.source?.toLowerCase() === filters.source.trim().toLowerCase())
  }

  // Filter by tag
  if (filters.tag.trim()) {
    const tag = filters.tag.trim().toLowerCase()
    filtered = filtered.filter(n => n.tags?.some(t => t.toLowerCase() === tag))
  }

  // Filter by verse
  if (filters.verse.trim()) {
    const verse = filters.verse.trim().toLowerCase()
    filtered = filtered.filter(n => n.verse_keys?.some(vk => vk.toLowerCase().includes(verse)))
  }

  notes.value = filtered
}

function clearFilters() {
  filters.q = ''
  filters.tag = ''
  filters.source = ''
  filters.verse = ''
  filters.from = ''
  filters.to = ''
  notes.value = [...allNotes.value]
}

watch(() => filters.q, () => {
  if (!filters.q.trim()) {
    runSearch()
  }
})

onMounted(() => load())
</script>
