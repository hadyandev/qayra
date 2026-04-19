<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-3xl mx-auto px-6 py-12">
      <NuxtLink 
        to="/browse" 
        class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 mb-12 group"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to chapters
      </NuxtLink>

      <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          <p class="text-[#52525B] dark:text-stone-400">Loading verse...</p>
        </div>
      </div>

      <UAlert
        v-else-if="error"
        color="red"
        variant="soft"
        class="mb-8 rounded-2xl"
        :title="error"
      />

      <template v-else-if="verseData">
        <header class="mb-12">
          <div class="flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 mb-4">
            <NuxtLink to="/browse" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Chapters</NuxtLink>
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
            <NuxtLink :to="`/browse?filter=topic:${verseTopics[0]?.slug}`" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              {{ chapterInfo?.name_simple || chapterInfo?.name || 'Chapter ' + chapter }}
            </NuxtLink>
          </div>
          
          <div v-if="chapterInfo" class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 class="text-3xl md:text-4xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
                {{ chapterInfo.name }}
                <span class="text-2xl md:text-3xl font-arabic opacity-60 ml-3">{{ verseData.chapter_name_arabic || '' }}</span>
              </h1>
              <p v-if="chapterInfo.meaning" class="text-[#52525B] dark:text-stone-400 mt-1">
                {{ chapterInfo.meaning }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-xs font-medium text-[#52525B] dark:text-stone-400">
                {{ verseData.verse_number }} / {{ verseData.total_verses }}
              </span>
              <span v-if="chapterInfo.revelation" class="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 capitalize">
                {{ chapterInfo.revelation }}
              </span>
            </div>
          </div>

          <div v-if="verseTopics.length > 0" class="flex flex-wrap gap-2">
            <NuxtLink 
              v-for="topic in verseTopics" 
              :key="topic.slug"
              :to="`/browse?filter=topic:${topic.slug}`"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-700/50 rounded-full text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            >
              <UIcon :name="topic.icon" class="w-4 h-4" />
              {{ topic.name }}
            </NuxtLink>
          </div>
        </header>

        <div class="space-y-12">
          <!-- Main Verse -->
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] p-8 md:p-12 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <p class="text-3xl md:text-4xl font-arabic text-[#18181B] dark:text-stone-100 text-center leading-[2] md:leading-[2.5]">
              {{ verseData.text }}
            </p>
          </div>

          <!-- Translation -->
          <div v-if="translation" class="bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-700/60 rounded-[1.5rem] p-8 md:p-10">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-6 h-px bg-amber-500"></div>
              <span class="text-xs uppercase tracking-widest text-[#52525B] dark:text-stone-500 font-medium">Translation</span>
            </div>
            <p class="text-xl md:text-2xl text-[#18181B] dark:text-stone-200 leading-relaxed">
              {{ translation }}
            </p>
          </div>

          <!-- Audio Recitation -->
          <div v-else-if="loadingAudio" class="flex items-center gap-3 p-4 text-stone-400">
            <div class="w-6 h-6 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
            <span class="text-sm">Loading audio...</span>
          </div>
          <div v-else-if="audio" class="bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-700/60 rounded-[1.5rem] p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <UIcon name="i-heroicons-speaker-wave" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span class="text-sm font-medium text-[#18181B] dark:text-stone-100">Audio Recitation</span>
                <span v-if="audio.reciter" class="text-xs text-stone-400 ml-2">by {{ audio.reciter }}</span>
              </div>
            </div>
            <audio controls class="w-full" :src="audio.url">
              Your browser does not support the audio element.
            </audio>
          </div>

<!-- Tafsir Section - Expandable -->
          <div v-if="tafsirSources.length > 0" class="bg-gradient-to-br from-amber-50/50 to-stone-50/50 dark:from-amber-950/20 dark:to-stone-950/20 border border-amber-200/40 dark:border-amber-800/40 rounded-[1.5rem] overflow-hidden">
            <button 
              class="w-full p-6 flex items-center justify-between"
              @click="tafsirExpanded = !tafsirExpanded"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span class="text-sm font-medium text-[#18181B] dark:text-stone-100">Tafsir</span>
                <span class="text-xs text-stone-400">({{ tafsirSources[0] }})</span>
              </div>
              <UIcon 
                :name="tafsirExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                class="w-5 h-5 text-stone-400"
              />
            </button>
            
            <div v-if="tafsirExpanded" class="px-6 pb-6 border-t border-amber-200/40 dark:border-amber-800/40 pt-4">
              <div class="tafsir-content text-[#18181B] dark:text-stone-200 leading-relaxed" v-html="selectedTafsirContent"></div>
            </div>
          </div>
          
          <div v-else-if="loadingTafsir" class="bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-700/60 rounded-[1.5rem] p-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-stone-400 animate-pulse" />
              </div>
              <span class="text-sm text-stone-400">Loading tafsir...</span>
            </div>
          </div>

          <!-- Navigation with centered CTA -->
          <div class="py-4 border-t border-b border-stone-200/60 dark:border-stone-700/60">
            <div class="flex items-center justify-center gap-4">
              <NuxtLink 
                v-if="prevVerse"
                :to="`/verse/${prevVerse}`"
                class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-full hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors group"
              >
                <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                <span class="font-mono text-sm text-[#18181B] dark:text-stone-100">@{{ prevVerse }}</span>
              </NuxtLink>
              <NuxtLink 
                v-if="nextVerse"
                :to="`/verse/${nextVerse}`"
                class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-full hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors group"
              >
                <span class="font-mono text-sm text-[#18181B] dark:text-stone-100">@{{ nextVerse }}</span>
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </NuxtLink>
            </div>
          </div>

          <!-- Related Verses (by topic first, then same surah) -->
          <div v-if="relatedByTopic.length > 0 || relatedVerses.length > 0" class="space-y-4">
            <h3 class="text-sm font-medium text-[#18181B] dark:text-stone-200 uppercase tracking-wide">
              Related Verses
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
<template v-if="relatedByTopic.length > 0">
                <NuxtLink 
                  v-for="v in relatedByTopic.slice(0, 4)"
                  :key="v.verse_key"
                  :to="`/verse/${v.verse_key}`"
                  class="group p-4 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/40 dark:border-amber-800/40 rounded-xl hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors"
                >
                  <div class="flex items-start gap-3">
                    <span class="font-mono text-xs text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded shrink-0">@{{ v.verse_key }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-amber-500 dark:text-amber-400 mb-1">{{ v.topic }}</p>
                      <p class="text-sm text-[#52525B] dark:text-stone-400 line-clamp-2 group-hover:text-[#18181B] dark:group-hover:text-stone-200 transition-colors">
                        {{ v.translation?.slice(0, 80) || v.text?.slice(0, 80) || 'Tap to view' }}
                      </p>
                    </div>
                  </div>
                </NuxtLink>
              </template>
              <template v-else-if="relatedVerses.length > 0">
                <NuxtLink 
                  v-for="v in relatedVerses.slice(0, 4)"
                  :key="v.verse_key"
                  :to="`/verse/${v.verse_key}`"
                  class="group p-4 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-xl hover:border-amber-200/60 dark:hover:border-amber-700/50 transition-colors"
                >
                  <div class="flex items-start gap-3">
                    <span class="font-mono text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded shrink-0">@{{ v.verse_key }}</span>
                    <p class="text-sm text-[#52525B] dark:text-stone-400 line-clamp-2 group-hover:text-[#18181B] dark:group-hover:text-stone-200 transition-colors">
                      {{ v.translation?.slice(0, 80) || v.text?.slice(0, 80) }}
                    </p>
                  </div>
                </NuxtLink>
              </template>
            </div>
          </div>

          <!-- Reflections Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-[#18181B] dark:text-stone-200 uppercase tracking-wide flex items-center gap-2">
                <span>Notes on @{{ id }}</span>
                <span v-if="reflections.length > 0" class="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full text-xs font-normal normal-case tracking-normal">
                  {{ reflections.length }} {{ reflections.length === 1 ? 'note' : 'notes' }}
                </span>
              </h3>
              <NuxtLink 
                v-if="user"
                :to="`/notes/new?verse=${encodeURIComponent(id)}`"
                class="text-sm text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors font-medium"
              >
                + New note
              </NuxtLink>
            </div>
            
            <div v-if="loadingReflections" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
            </div>
            
            <div v-else-if="reflections.length > 0" class="space-y-3">
              <div
                v-for="(reflection, idx) in reflections"
                :key="idx"
                class="relative"
              >
                <div class="flex items-start gap-3">
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
                  <div class="ml-4 pl-5 py-4 pr-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-xl border border-amber-100 dark:border-amber-800/50 w-full">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-chat-bubble-left" class="w-4 h-4 text-amber-500" />
                        <span class="text-xs font-medium text-amber-600 dark:text-amber-400">From:</span>
                        <NuxtLink 
                          :to="`/notes/${reflection.noteId}`"
                          class="text-sm font-medium text-[#18181B] dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                        >
                          {{ reflection.noteTitle || 'Untitled Note' }}
                        </NuxtLink>
                      </div>
                      <span class="text-xs text-stone-400 flex items-center gap-1">
                        <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                        {{ formatDate(reflection.created_at) }}
                      </span>
                    </div>
                    <p class="text-[#18181B] dark:text-stone-200 leading-relaxed">
                      {{ reflection.reflection }}
                    </p>
                    <div class="flex items-center justify-between mt-3 pt-2 border-t border-amber-100 dark:border-amber-800/50">
                      <div class="flex items-center gap-3 text-xs text-stone-400">
                        <span v-if="reflection.source" class="flex items-center gap-1">
                          <UIcon name="i-heroicons-bookmark" class="w-3 h-3" />
                          {{ reflection.source }}
                        </span>
                        <span v-if="reflection.speaker" class="flex items-center gap-1">
                          <UIcon name="i-heroicons-user" class="w-3 h-3" />
                          {{ reflection.speaker }}
                        </span>
                      </div>
                      <div v-if="reflection.tags?.length" class="flex flex-wrap gap-1">
                        <span 
                          v-for="tag in reflection.tags.slice(0, 3)" 
                          :key="tag"
                          class="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs rounded-full"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8 px-4 bg-stone-50/50 dark:bg-stone-800/30 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
              <div class="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
                <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-6 h-6 text-stone-400" />
              </div>
              <p class="text-sm text-[#52525B] dark:text-stone-400 mb-3">No notes yet on this verse</p>
              <template v-if="user">
                <NuxtLink 
                  :to="`/notes/new?verse=${encodeURIComponent(id)}`"
                  class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#18181B] dark:bg-amber-600 text-white rounded-full text-sm font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors"
                >
                  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                  Add the first note
                </NuxtLink>
              </template>
              <template v-else>
                <div class="space-y-3">
                  <p class="text-xs text-stone-500 dark:text-stone-400">Sign in to capture your reflections on this verse</p>
                  <NuxtLink 
                    to="/login"
                    class="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100 rounded-full text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    <UIcon name="i-heroicons-arrow-right-end-on-rectangle" class="w-4 h-4" />
                    Sign in to add notes
                  </NuxtLink>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="text-center py-24">
        <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-heroicons-book-open" class="w-8 h-8 text-stone-300 dark:text-stone-600" />
        </div>
        <h2 class="text-2xl font-medium text-[#18181B] dark:text-stone-100 mb-2">Verse not found</h2>
        <p class="text-[#52525B] dark:text-stone-400 mb-6">This verse could not be loaded.</p>
        <NuxtLink to="/browse" class="text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 transition-colors">Browse Quran &rarr;</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { quranTopics } from '~/data/quranTopics'
import { surahMeanings } from '~/data/surahMeanings'

definePageMeta({ layout: 'default' })

const route = useRoute()
const id = route.params.id as string

const verseData = ref<{
  text: string
  chapter_id?: number
  chapter_name?: string
  chapter_name_arabic?: string
  verse_number?: number
  total_verses?: number
  revelation_place?: string
  translations?: { text: string }[]
  surah?: {
    id: number
    name_simple: string
    name_complex: string
    name_arabic: string
  }
  tafsirs?: { text: string; resourceName: string }[]
} | null>(null)
const translation = ref('')
const loading = ref(true)
const error = ref('')
const relatedVerses = ref<Array<{ verse_key: string; text: string; translation: string }>>([])
const reflections = ref<Array<{
  noteId: string
  noteTitle: string | null
  reflection: string
  source: string | null
  speaker: string | null
  tags: string[]
  created_at: string
}>>([])
const loadingReflections = ref(false)

const tafsir = ref<{
  text: string
  resourceName: string
} | null>(null)
const tafsirExpanded = ref(false)

const tafsirSources = ref<string[]>([])
const selectedTafsir = ref('')
const selectedTafsirContent = ref('')

watch(selectedTafsir, (source) => {
  const t = verseData.value?.tafsirs?.find((t: any) => t.resourceName === source)
  if (t) {
    selectedTafsirContent.value = t.text
  }
})

const audio = ref<{
  url: string
  reciter: string | null
} | null>(null)
const loadingAudio = ref(false)

const { verse } = useQuran()
const user = useSupabaseUser()

const [chapter, verseNum] = id.split(':').map(Number)

const prevVerse = computed(() => {
  if (!verseNum || verseNum <= 1) return null
  return `${chapter}:${verseNum - 1}`
})

const nextVerse = computed(() => {
  if (!verseNum) return null
  return `${chapter}:${verseNum + 1}`
})

const chapterInfo = computed(() => {
  if (!chapter) return null
  const surah = verseData.value?.surah
  return {
    id: chapter,
    name: surah?.name_simple || surah?.name_complex || verseData.value?.chapter_name || `Chapter ${chapter}`,
    name_simple: surah?.name_simple || surah?.name_complex || verseData.value?.chapter_name || '',
    name_arabic: surah?.name_arabic || verseData.value?.chapter_name_arabic || '',
    meaning: surahMeanings[chapter] || '',
    revelation: verseData.value?.revelation_place || ''
  }
})

const verseTopics = computed(() => {
  return quranTopics.filter(t => t.verses.includes(id))
})

// Related verses by topic - just showverse keys, content loads on click
const relatedByTopic = computed(() => {
  if (verseTopics.value.length === 0) return []
  const all: Array<{ verse_key: string; text: string; translation: string; topic: string }> = []
  for (const topic of verseTopics.value) {
    for (const verseKey of topic.verses) {
      if (verseKey !== id) {
        all.push({
          verse_key: verseKey,
          text: '',
          translation: '',
          topic: topic.name
        })
      }
    }
  }
  return all.slice(0, 8)
})

function shareVerse() {
  if (navigator.share) {
    navigator.share({
      title: `Quran ${id}`,
      text: verseData.value?.text || '',
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

async function loadReflections() {
  if (!user.value) {
    reflections.value = []
    loadingReflections.value = false
    return
  }
  loadingReflections.value = true
  try {
    const timestamp = Date.now()
    const data = await $fetch<{ reflections: typeof reflections.value }>(`/api/notes/by-verse?verse=${encodeURIComponent(id)}&_=${timestamp}`)
    console.log('Loaded reflections:', data.reflections?.length, 'reflections')
    reflections.value = data.reflections || []
  } catch (e) {
    console.error('Failed to load reflections:', e)
    reflections.value = []
  } finally {
    loadingReflections.value = false
  }
}

async function loadRelatedVerses() {
  if (!chapter) return
  
  // Get other verses from same chapter
  const totalVerses = 7 // Al-Fatihah has 7 verses
  const verseNums = Array.from({ length: totalVerses }, (_, i) => i + 1).filter(n => n !== verseNum)
  const sampleVerses = verseNums.slice(0, 4)
  
  try {
    relatedVerses.value = await Promise.all(
      sampleVerses.map(async (vn) => {
        const key = `${chapter}:${vn}`
        const v = await verse(key)
        return v ? {
          verse_key: key,
          text: v.text_uthmani || v.text || '',
          translation: v.translations?.[0]?.text || ''
        } : null
      })
    ).then(results => results.filter(Boolean))
  } catch (e) {
    console.error('Failed to load related verses:', e)
  }
}



// Track verse viewing for QF activity - log after 10 seconds if still on page
let verseActivityLogged = false

onMounted(async () => {
  // After 10 seconds, log the reading activity if still on this verse
  setTimeout(() => {
    if (verseData.value?.verse_key && !verseActivityLogged) {
      verseActivityLogged = true
      const verseKey = verseData.value.verse_key
      // Convert single verse "2:2" to range "2:2-2:2"
      const range = verseKey + '-' + verseKey
      $fetch('/api/qf/activity-days', {
        method: 'POST',
        body: {
          type: 'QURAN',
          seconds: 10,
          ranges: [range],
          date: new Date().toISOString().split('T')[0]
        }
      }).catch(err => console.log('[QF Activity] Verse viewing:', err))
    }
  }, 10000) // 10 seconds
  
  try {
    const result = await verse(id)
    if (result) {
      verseData.value = result
      if (result.translations?.length) {
        translation.value = result.translations[0].text
      }
      // Use tafsir and audio from combined verse API response
      if (result.tafsirs?.length > 0) {
        tafsirSources.value = result.tafsirs.map((t: any) => t.resourceName)
        if (result.tafsirs.length > 0) {
          selectedTafsir.value = result.tafsirs[0].resourceName
          selectedTafsirContent.value = result.tafsirs[0].text
        }
      }
      if (result.audio?.url) {
        audio.value = {
          url: result.audio.url,
          reciter: result.audio.reciter
        }
      }
      await Promise.all([loadRelatedVerses(), loadReflections()])
    } else {
      error.value = 'Verse not found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load verse'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
