<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <header class="pt-16 pb-8 px-6 max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">
            {{ pageTitle }}
          </h1>
          <p class="text-[#52525B] dark:text-stone-400 text-lg">
            {{ pageSubtitle }}
          </p>
        </div>
        <div class="relative">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, Arabic, or number..."
            title="Search surah by name (English/Arabic), translated name, or chapter number (e.g., '2', 'Baqarah', 'البقرة')"
            class="pl-11 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-64"
          />
        </div>
      </div>
      
      <!-- Quick filters -->
      <div class="flex flex-wrap items-center gap-2">
        <button 
          v-for="filter in mainFilters" 
          :key="filter.id"
          @click="activeFilter = filter.id; handleFilterChange()"
          class="px-4 py-1.5 text-sm font-medium rounded-full transition-all"
          :class="activeFilter === filter.id 
            ? 'bg-[#18181B] dark:bg-amber-600 text-white' 
            : 'bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 text-[#52525B] dark:text-stone-400 hover:border-amber-200 dark:hover:border-amber-700/50'"
        >
          {{ filter.label }}
        </button>
        
        <div class="w-px h-5 bg-stone-300 dark:bg-stone-600 mx-1"></div>
        
        <button 
          v-for="filter in topicFilters" 
          :key="filter.id"
          @click="activeFilter = filter.id; handleFilterChange()"
          class="px-4 py-1.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5"
          :class="activeFilter === filter.id 
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40' 
            : 'bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 text-[#52525B] dark:text-stone-400 hover:border-amber-200 dark:hover:border-amber-700/50'"
        >
          <UIcon v-if="filter.icon" :name="filter.icon" class="w-3.5 h-3.5" />
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
        
        <div v-if="activeTopic" class="mb-8">
          <h3 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-4">
            Related Verses
          </h3>
          
          <div v-if="loadingTopicVerses" class="space-y-4">
            <div v-for="i in 3" :key="i" class="h-24 bg-stone-200/50 dark:bg-stone-800/50 rounded-xl animate-pulse"></div>
          </div>
          
          <div v-else-if="topicVersesData.length > 0" class="space-y-6">
            <div 
              v-for="surah in topicChapters" 
              :key="surah.id"
              class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl overflow-hidden"
            >
              <div class="bg-stone-50 dark:bg-stone-800/50 px-4 py-3 border-b border-stone-200/60 dark:border-stone-700/60">
                <h4 class="text-lg font-medium text-[#18181B] dark:text-stone-100">
                  {{ surah.name_simple }}
                  <span class="text-sm text-stone-400 ml-2">({{ surah.name_arabic }})</span>
                </h4>
              </div>
              <div class="divide-y divide-stone-100 dark:divide-stone-800">
                <NuxtLink
                  v-for="verse in getTopicVersesForSurah(surah.id)"
                  :key="verse.verse_key"
                  :to="`/verse/${verse.verse_key}`"
                  class="block p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all group"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-sm font-mono text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded flex-shrink-0">
                      {{ verse.verse_key.replace(surah.id + ':', '') }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <p class="text-base Arabic text-[#18181B] dark:text-stone-100 mb-1" dir="rtl">
                        {{ verse.text_uthmani }}
                      </p>
                      <p v-if="verse.translations?.[0]?.text" class="text-sm text-[#52525B] dark:text-stone-400 line-clamp-2">
                        {{ verse.translations[0].text }}
                      </p>
                      <div v-if="getTopicsForVerse(verse.verse_key).length > 1" class="flex flex-wrap gap-1.5 mt-2">
                        <span 
                          v-for="topic in getTopicsForVerse(verse.verse_key)" 
                          :key="topic.slug"
                          class="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                        >
                          {{ topic.name }}
                        </span>
                      </div>
                    </div>
                    <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <div v-else-if="topicVersesData.length === 0 && !loadingTopicVerses && activeTopic" class="text-center py-8 text-[#52525B] dark:text-stone-400">
            No verses found for this topic
          </div>
        </div>

        <!-- Chapter cards (only when no active topic) -->
        <template v-if="!activeTopic">
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
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { quranTopics } from '~/data/quranTopics'

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

const filters = computed(() => {
  const base = [
    { id: 'all', label: 'All' },
    { id: 'meccan', label: 'Makkiyah' },
    { id: 'medinan', label: 'Madaniyah' },
  ]
  
  // Add topics
  const topicFilters = quranTopics.slice(0, 4).map(t => ({
    id: `topic:${t.slug}`,
    label: t.name,
    icon: t.icon,
    isTopic: true
  }))
  
  return [...base, ...topicFilters]
})

const allFilters = quranTopics.map(t => ({
  id: `topic:${t.slug}`,
  label: t.name
}))

const mainFilters = computed(() => [
  { id: 'all', label: 'All' },
  { id: 'meccan', label: 'Makkiyah' },
  { id: 'medinan', label: 'Madaniyah' },
])

const topicFilters = computed(() => 
  quranTopics.map(t => ({
    id: `topic:${t.slug}`,
    label: t.name,
    icon: t.icon
  }))
)

const topicVersesData = ref<Array<{
  verse_key: string
  text_uthmani: string
  translations: Array<{ text: string; resource_name: string }>
}>>([])
const loadingTopicVerses = ref(false)

const { chapters: getChapters } = useQuran()
const user = useSupabaseUser()

const surahHasReflection = ref<Record<number, boolean>>({})

// Check if current filter is a topic
const activeTopic = computed(() => {
  if (activeFilter.value.startsWith('topic:')) {
    const slug = activeFilter.value.replace('topic:', '')
    return quranTopics.find(t => t.slug === slug)
  }
  return null
})

const pageTitle = computed(() => {
  if (activeTopic.value) return activeTopic.value.name
  if (activeFilter.value === 'meccan') return 'Makkiyah'
  if (activeFilter.value === 'medinan') return 'Madaniyah'
  return 'Al-Quran'
})

const filteredChapters = computed(() => {
  let list = chapters.value
  
  // Topic filter - show verses from topic, grouped by surah
  if (activeTopic.value) {
    const verseKeys = activeTopic.value.verses
    // Filter chapters that have at least one verse in this topic
    const surahIdsWithTopicVerses = new Set(
      verseKeys.map(v => parseInt(v.split(':')[0]))
    )
    list = list.filter(c => surahIdsWithTopicVerses.has(c.id))
  }
  
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

// Group verses by surah for display
const topicVersesBySurah = computed(() => {
  if (!activeTopic.value) return {}
  const grouped: Record<number, string[]> = {}
  for (const verseKey of activeTopic.value.verses) {
    const [surah, ayah] = verseKey.split(':')
    const surahId = parseInt(surah)
    if (!grouped[surahId]) grouped[surahId] = []
    grouped[surahId].push(ayah)
  }
  return grouped
})

// Get chapters that have topic verses (in order)
const topicChapters = computed(() => {
  if (!activeTopic.value) return []
  return filteredChapters.value
})

// Get actual verse data for a specific surah
function getTopicVersesForSurah(surahId: number) {
  return topicVersesData.value.filter(v => v.verse_key.startsWith(surahId + ':'))
}

// Get topics that contain a specific verse
function getTopicsForVerse(verseKey: string) {
  return quranTopics.filter(t => t.verses.includes(verseKey))
}

const meccanChapters = computed(() => 
  filteredChapters.value.filter(c => c.revelation_place?.toLowerCase().includes('makkah'))
)

const medinanChapters = computed(() => 
  filteredChapters.value.filter(c => c.revelation_place?.toLowerCase().includes('madinah'))
)

const pageSubtitle = computed(() => {
  if (activeTopic.value) {
    return `${activeTopic.value.verses.length} verses about ${activeTopic.value.description.toLowerCase()}`
  }
  if (activeFilter.value === 'meccan') {
    return `${meccanChapters.value.length} surahs revealed in Mecca`
  }
  if (activeFilter.value === 'medinan') {
    return `${medinanChapters.value.length} surahs revealed in Medina`
  }
  return '114 surahs of divine guidance • 6,236 verses'
})

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

async function loadTopicVerses() {
  if (!activeTopic.value) {
    topicVersesData.value = []
    return
  }
  
  loadingTopicVerses.value = true
  try {
    const keys = activeTopic.value.verses.join(',')
    const data = await $fetch<{ verses: typeof topicVersesData.value }>(
      `/api/quran/verses?keys=${encodeURIComponent(keys)}`
    )
    topicVersesData.value = data.verses || []
  } catch (e) {
    console.error('[Browse] Failed to load topic verses:', e)
    topicVersesData.value = []
  } finally {
    loadingTopicVerses.value = false
  }
}

async function handleFilterChange() {
  if (activeTopic.value) {
    await loadTopicVerses()
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
