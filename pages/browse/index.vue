<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <header class="pt-16 pb-12 px-6 max-w-6xl mx-auto">
      <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-4">
        Al-Quran
      </h1>
      <p class="text-[#52525B] dark:text-stone-400 text-lg max-w-xl">
        114 chapters, each revealing divine guidance. Click any surah to begin reading.
      </p>
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

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <template v-for="(surah, index) in chapters" :key="surah.id">
          <NuxtLink
            :to="`/verse/${surah.id}:1`"
            class="group relative bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] p-6 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden"
            :class="getCardClass(index)"
          >
            <div class="relative z-10">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-3">
                    <div 
                      class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-transform duration-300 group-hover:scale-110"
                      :class="isFeatured(surah.id) 
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' 
                        : 'bg-stone-100 dark:bg-stone-800 text-[#52525B] dark:text-stone-400'"
                    >
                      {{ surah.id }}
                    </div>
                    <div>
                      <h3 class="font-semibold text-[#18181B] dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                        {{ surah.name_simple }}
                      </h3>
                      <p class="text-sm text-[#52525B] dark:text-stone-400">{{ surah.translated_name }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-xs text-[#52525B] dark:text-stone-500">
                    <span>{{ surah.verses_count }} verses</span>
                    <span class="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600"></span>
                    <span class="capitalize">{{ surah.revelation_place }}</span>
                  </div>
                </div>
                <div class="text-3xl font-arabic text-[#18181B] dark:text-stone-200 opacity-60 group-hover:opacity-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all duration-300">
                  {{ surah.name_arabic }}
                </div>
              </div>
            </div>
            
            <div class="absolute inset-0 bg-gradient-to-br from-amber-50/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </NuxtLink>
        </template>
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

const { chapters: getChapters } = useQuran()

const featuredSurahs = new Set([1, 2, 36, 55, 56, 67])

function isFeatured(id: number) {
  return featuredSurahs.has(id)
}

function getCardClass(index: number) {
  if (isFeatured(chapters.value[index]?.id)) {
    return 'md:col-span-2 lg:col-span-1'
  }
  if (index % 7 === 0) {
    return 'lg:col-span-2'
  }
  return ''
}

onMounted(async () => {
  try {
    chapters.value = await getChapters()
    if (chapters.value.length === 0) {
      error.value = 'No chapters returned. Check QF credentials and API base in .env.'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load chapters'
  } finally {
    loading.value = false
  }
})
</script>
