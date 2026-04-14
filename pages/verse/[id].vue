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
        <header class="mb-12 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-sm font-mono text-[#52525B] dark:text-stone-400 mb-6">
            @{{ id }}
          </div>
          <h1 class="text-3xl md:text-4xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
            {{ verseData.chapter_id ? `Surah ${verseData.chapter_id}, Ayat ${verseData.verse_number || id.split(':')[1]}` : id }}
          </h1>
        </header>

        <div class="space-y-12">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] p-8 md:p-12 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <p class="text-3xl md:text-4xl font-arabic text-[#18181B] dark:text-stone-100 text-center leading-[2] md:leading-[2.5]">
              {{ verseData.text }}
            </p>
          </div>

          <div v-if="translation" class="bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-700/60 rounded-[1.5rem] p-8 md:p-10">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-6 h-px bg-amber-500"></div>
              <span class="text-xs uppercase tracking-widest text-[#52525B] dark:text-stone-500 font-medium">Translation</span>
            </div>
            <p class="text-xl md:text-2xl text-[#18181B] dark:text-stone-200 leading-relaxed">
              {{ translation }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-4 pt-4">
            <NuxtLink 
              v-if="user" 
              :to="`/notes/new?verse=${encodeURIComponent(id)}`"
              class="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-full font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
              New note citing this verse
            </NuxtLink>
            <NuxtLink 
              v-else 
              to="/login"
              class="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100 rounded-full font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300"
            >
              <UIcon name="i-heroicons-arrow-right-end-on-rectangle" class="w-4 h-4" />
              Sign in to add notes
            </NuxtLink>

            <button 
              @click="shareVerse"
              class="inline-flex items-center gap-2 px-4 py-2 text-[#52525B] dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all duration-300"
            >
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
              Share
            </button>
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
definePageMeta({ layout: 'default' })

const route = useRoute()
const id = route.params.id as string

const verseData = ref<{
  text: string
  chapter_id?: number
  verse_number?: number
  translations?: { text: string }[]
} | null>(null)
const translation = ref('')
const loading = ref(true)
const error = ref('')

const { verse } = useQuran()
const user = useSupabaseUser()

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

onMounted(async () => {
  try {
    const result = await verse(id)
    if (result) {
      verseData.value = result
      if (result.translations?.length) {
        translation.value = result.translations[0].text
      }
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
