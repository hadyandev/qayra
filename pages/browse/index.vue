<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <header class="pt-16 pb-8 px-6 max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">
            Al-Quran
          </h1>
          <p class="text-[#52525B] dark:text-stone-400 text-lg">
            114 chapters of divine guidance
          </p>
        </div>
        <div class="relative">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search surah name..."
            class="pl-11 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-64"
          />
        </div>
      </div>
      
      <!-- Quick filters -->
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          @click="activeFilter = filter.id"
          class="px-4 py-1.5 text-sm font-medium rounded-full transition-all"
          :class="activeFilter === filter.id 
            ? 'bg-[#18181B] dark:bg-amber-600 text-white' 
            : 'bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 text-[#52525B] dark:text-stone-400 hover:border-amber-200 dark:hover:border-amber-700/50'"
        >
          {{ filter.label }}
        </button>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 pb-24">
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 12" :key="i" class="h-32 bg-stone-200/50 dark:bg-stone-800/50 rounded-[1.5rem] animate-pulse"></div>
      </div>

      <UAlert
        v-else-if="error"
        color="red"
        variant="soft"
        class="mb-8 rounded-2xl"
        :title="error"
      />

      <div v-else>
        <div v-if="activeFilter === 'meccan'" class="mb-8">
          <h2 class="text-sm font-medium text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span class="w-8 h-px bg-stone-300 dark:bg-stone-600"></span>
            Meccan Surahs (Makkiyah) — Revealed in Mecca
            <span class="ml-auto text-stone-400">{{ meccanChapters.length }}</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <SurahCard v-for="surah in meccanChapters" :key="surah.id" :surah="surah" />
          </div>
        </div>

        <div v-else-if="activeFilter === 'medinan'" class="mb-8">
          <h2 class="text-sm font-medium text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span class="w-8 h-px bg-stone-300 dark:bg-stone-600"></span>
            Medinan Surahs (Madaniyah) — Revealed in Medina
            <span class="ml-auto text-stone-400">{{ medinanChapters.length }}</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <SurahCard v-for="surah in medinanChapters" :key="surah.id" :surah="surah" />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <SurahCard v-for="surah in filteredChapters" :key="surah.id" :surah="surah" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const chapters = ref<
  Array<{
    id: number
    name_simple: string
    name_complex: string
    name_arabic: string
    translated_name: string
    verses_count: number
    revelation_place: string
  }>
>([])

const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const activeFilter = ref('all')

const filters = [
  { id: 'all', label: 'All (114)' },
  { id: 'meccan', label: 'Meccan' },
  { id: 'medinan', label: 'Medinan' },
]

const { chapters: getChapters } = useQuran()
const user = useSupabaseUser()

const surahHasReflection = ref<Record<number, boolean>>({})

const filteredChapters = computed(() => {
  let list = chapters.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => 
      c.name_simple.toLowerCase().includes(q) ||
      c.name_arabic.includes(q) ||
      c.translated_name.toLowerCase().includes(q) ||
      c.id.toString() === q
    )
  }
  return list.map(chapter => ({
    ...chapter,
    hasReflection: user.value ? surahHasReflection.value[chapter.id] : false
  }))
})

const meccanChapters = computed(() => 
  filteredChapters.value.filter(c => c.revelation_place === 'meccan')
)

const medinanChapters = computed(() => 
  filteredChapters.value.filter(c => c.revelation_place === 'medinan')
)

async function loadUserReflections() {
  if (!user.value) return
  try {
    const { data: userNotes } = await useSupabaseClient()
      .from('notes')
      .select('id')
      .eq('user_id', user.value.id)
    
    if (!userNotes?.length) return
    
    const { data: verseLinks } = await useSupabaseClient()
      .from('note_verses')
      .select('verse_key')
      .in('note_id', userNotes.map(n => n.id))
    
    const surahWithReflection = new Set<number>()
    for (const link of verseLinks ?? []) {
      const surahId = Number(link.verse_key.split(':')[0])
      surahWithReflection.add(surahId)
    }
    
    for (const id of surahWithReflection) {
      surahHasReflection.value[id] = true
    }
  } catch (e) {
    console.error('[Browse] Failed to load user reflections:', e)
  }
}

onMounted(async () => {
  try {
    console.log('[Browse] Loading chapters...')
    chapters.value = await getChapters()
    console.log('[Browse] Loaded chapters:', chapters.value.length)
    if (chapters.value.length === 0) {
      error.value = 'No chapters returned. Check QF credentials in .env file.'
    }
    if (user.value) {
      await loadUserReflections()
    }
  } catch (err: any) {
    console.error('[Browse] Error:', err)
    error.value = err.message || 'Failed to load chapters'
  } finally {
    loading.value = false
  }
})
</script>
