<template>
  <div class="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 font-sans transition-colors duration-300">
    <!-- Hero / Header Section -->
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

      <!-- Search & Filters -->
      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-500/50 flex flex-col md:flex-row gap-2">
        <div class="relative flex-grow flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800">
          <UIcon name="i-heroicons-magnifying-glass" class="text-stone-400 w-5 h-5 absolute" />
          <input 
            v-model="filters.q" 
            placeholder="Search within your notes..." 
            class="w-full pl-8 bg-transparent outline-none text-[#18181B] dark:text-stone-100 placeholder:text-stone-400"
            @keyup.enter="runSearch" 
          />
        </div>
        <div class="flex flex-wrap md:flex-nowrap gap-2 items-center px-2 py-1">
          <UInput v-model="filters.tag" placeholder="Tag" class="w-full md:w-28 ui-transparent-input" variant="none" />
          <div class="hidden md:block w-px h-6 bg-stone-200 dark:bg-stone-800"></div>
          <UInput v-model="filters.source" placeholder="Source" class="w-full md:w-32 ui-transparent-input" variant="none" />
          <div class="hidden md:block w-px h-6 bg-stone-200 dark:bg-stone-800"></div>
          <UButton variant="ghost" color="gray" class="text-stone-500 hover:text-stone-900 mx-auto" @click="clearFilters">Clear</UButton>
          <UButton 
            @click="runSearch" 
            class="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 rounded-full px-6"
          >
            Search
          </UButton>
        </div>
      </div>
    </header>

    <!-- Content Grid -->
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
        <p class="text-[#52525B] dark:text-stone-500 mb-6 max-w-sm">Capture your first reflection or adjust your search filters to explore your knowledge base.</p>
        <NuxtLink to="/notes/new" class="text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 transition-colors">Start writing &rarr;</NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mt-8">
        <article 
          v-for="n in notes" 
          :key="n.id" 
          class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] p-8 md:p-10 hover:shadow-xl hover:-translate-y-1 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300 cursor-pointer"
          @click="navigateTo(`/notes/${n.id}`)"
        >
          <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-6">
            <div class="flex-grow space-y-3">
              <div class="flex items-center gap-3 text-sm font-mono text-[#52525B] dark:text-stone-400">
                <time>{{ formatDate(n.note_date, n.created_at) }}</time>
                <span v-if="n.source" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {{ n.source }}
                </span>
                <span v-if="n.speaker" class="text-stone-400 dark:text-stone-500">— {{ n.speaker }}</span>
              </div>
              
              <h2 class="text-2xl font-medium text-[#18181B] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                {{ n.title || 'Untitled Reflection' }}
              </h2>
            </div>

            <div v-if="n.tags?.length" class="flex flex-wrap gap-2 md:max-w-[200px] md:justify-end">
              <span 
                v-for="t in n.tags.slice(0, 3)" 
                :key="t" 
                class="px-3 py-1 bg-stone-50 dark:bg-stone-800/80 border border-stone-200/50 dark:border-stone-700 rounded-full text-xs text-[#52525B] dark:text-stone-400 whitespace-nowrap"
              >
                {{ t }}
              </span>
              <span v-if="n.tags.length > 3" class="px-2 py-1 text-xs text-stone-400">
                +{{ n.tags.length - 3 }}
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

type NoteRow = {
  id: string
  title: string | null
  note_date: string | null
  created_at: string
  source: string | null
  tags: string[] | null
}

const notes = ref<NoteRow[]>([])
const pending = ref(true)
const error = ref('')
const filters = reactive({
  q: '',
  tag: '',
  source: '',
  from: '',
  to: ''
})

function formatDate(noteDate: string | null, created: string) {
  if (noteDate) return noteDate
  return new Date(created).toLocaleDateString()
}

async function load() {
  pending.value = true
  error.value = ''
  try {
    const hasSearch =
      filters.q.trim() ||
      filters.tag.trim() ||
      filters.source.trim() ||
      filters.from ||
      filters.to

    if (hasSearch) {
      const { notes: rows } = await $fetch<{ notes: NoteRow[] }>('/api/search/notes', {
        query: {
          q: filters.q.trim() || undefined,
          tag: filters.tag.trim() || undefined,
          source: filters.source.trim() || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined
        }
      })
      notes.value = rows ?? []
    } else {
      const { notes: rows } = await $fetch<{ notes: NoteRow[] }>('/api/notes')
      notes.value = rows ?? []
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to load notes'
    notes.value = []
  } finally {
    pending.value = false
  }
}

function runSearch() {
  load()
}

function clearFilters() {
  filters.q = ''
  filters.tag = ''
  filters.source = ''
  filters.from = ''
  filters.to = ''
  load()
}

onMounted(() => load())
</script>
