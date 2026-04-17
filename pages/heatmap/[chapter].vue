<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <NuxtLink 
        to="/heatmap" 
        class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 mb-8 group"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to heatmap
      </NuxtLink>

      <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          <p class="text-[#52525B] dark:text-stone-400">Loading chapter...</p>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-24">
        <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-stone-400" />
        </div>
        <h2 class="text-2xl font-medium text-[#18181B] dark:text-stone-100 mb-2">Chapter not found</h2>
        <p class="text-[#52525B] dark:text-stone-400 mb-6">{{ error }}</p>
        <NuxtLink to="/heatmap" class="text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 transition-colors">Back to heatmap →</NuxtLink>
      </div>

      <template v-else-if="chapter">
        <header class="mb-12">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="text-arabic text-5xl text-[#18181B] dark:text-stone-100 mb-3">
                {{ chapter.name_arabic }}
              </div>
              <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">
                {{ chapter.name_simple }}
              </h1>
              <p class="text-lg text-stone-400">{{ chapter.name_complex }}</p>
            </div>
            <div class="text-right">
              <span 
                class="px-3 py-1.5 text-sm rounded-full"
                :class="chapter.chapter_type === 'Meccan' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'"
              >
                {{ chapter.chapter_type }}
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-6 text-sm text-[#52525B] dark:text-stone-400">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
              <span>{{ chapter.verse_count }} verses</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4" />
              <span>{{ reflectionCount }} reflected</span>
            </div>
            <div class="flex-1"></div>
            <NuxtLink 
              :to="`/verse/${chapter.id}:1`"
              class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
            >
              Start reading
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </header>

        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 md:p-8 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-[#18181B] dark:text-stone-200 uppercase tracking-wide">
              Verse Grid
            </h2>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm bg-amber-500"></div>
                <span class="text-stone-400">Has reflection</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm bg-stone-200 dark:bg-stone-700"></div>
                <span class="text-stone-400">Empty</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            <button
              v-for="v in verses"
              :key="v.key"
              class="relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 hover:scale-105"
              :class="v.hasReflection 
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600' 
                : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600'"
              @click="openVersePanel(v.key)"
            >
              <span class="font-mono text-sm font-medium" :class="v.hasReflection ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400'">
                {{ v.number }}
              </span>
              <span v-if="v.hasReflection" class="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>
          </div>

          <div v-if="chapter.verse_count > 60" class="mt-4 pt-4 border-t border-stone-200/60 dark:border-stone-700/60 text-center text-sm text-stone-400">
            Showing all {{ chapter.verse_count }} verses. Click any verse to see reflections.
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p class="text-2xl font-semibold text-[#18181B] dark:text-stone-100">{{ chapter.verse_count }}</p>
                <p class="text-sm text-stone-400">Total Verses</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p class="text-2xl font-semibold text-[#18181B] dark:text-stone-100">{{ reflectionCount }}</p>
                <p class="text-sm text-stone-400">Reflected Verses</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 text-stone-600 dark:text-stone-400" />
              </div>
              <div>
                <p class="text-2xl font-semibold text-[#18181B] dark:text-stone-100">{{ Math.round((reflectionCount / chapter.verse_count) * 100) }}%</p>
                <p class="text-sm text-stone-400">Completion</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <ReflectionPanel
        v-if="selectedVerse"
        :verse-key="selectedVerse"
        @close="selectedVerse = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const user = useSupabaseUser()
const route = useRoute()
const chapterId = computed(() => parseInt(route.params.chapter as string))

onMounted(() => {
  if (!user.value) {
    navigateTo('/login')
  }
})

interface ChapterInfo {
  id: number
  name_simple: string
  name_complex: string
  name_arabic: string
  transliteration: string | null
  verse_count: number
  chapter_type: string
}

interface VerseInfo {
  number: number
  key: string
  hasReflection: boolean
  reflectionCount: number
}

const chapter = ref<ChapterInfo | null>(null)
const verses = ref<VerseInfo[]>([])
const loading = ref(true)
const error = ref('')
const selectedVerse = ref<string | null>(null)

const reflectionCount = computed(() => verses.value.filter(v => v.hasReflection).length)

function openVersePanel(verseKey: string) {
  selectedVerse.value = verseKey
}

onMounted(async () => {
  try {
    const data = await $fetch<{ chapter: ChapterInfo; verses: VerseInfo[] }>(`/api/heatmap/${chapterId.value}`)
    chapter.value = data.chapter
    verses.value = data.verses
  } catch (e: any) {
    error.value = e.message || 'Failed to load chapter'
  } finally {
    loading.value = false
  }
})
</script>
