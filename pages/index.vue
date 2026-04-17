<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <header class="text-center mb-20">
        <div v-if="!user" class="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-sm text-[#52525B] dark:text-stone-400 mb-8">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
          <span>Note-first Quran workspace</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-6 leading-tight">
          Your second brain,<br />
          <span class="text-amber-600 dark:text-amber-500">grounded in the Quran</span>
        </h1>
        
        <p class="text-xl text-[#52525B] dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Capture notes, khutbahs, and personal studies. Link them to verses. Build your Islamic knowledge base.
        </p>

        <div class="mt-10">
          <NuxtLink 
            to="/login"
            class="inline-flex items-center gap-2 px-8 py-4 bg-[#18181B] dark:bg-amber-600 text-white rounded-full font-medium text-lg hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
          >
            <span>Start your workspace</span>
            <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </header>

      <!-- Global Stats (Public) -->
      <section class="mb-20">
        <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-6 text-center">
          Community Progress
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.totalNotes || 0 }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Notes Created</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.totalVerses || 0 }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Verses Cited</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.totalUsers || 0 }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Members</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.totalChapters || 0 }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Chapters Covered</p>
          </div>
        </div>
      </section>

      <!-- Featured Verse of the Day -->
      <section v-if="featuredVerse" class="mb-20">
        <div class="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-[2rem] p-8 md:p-12 overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-6">
              <UIcon name="i-heroicons-bookmark" class="w-5 h-5" />
              <span class="text-sm font-medium uppercase tracking-wider">Verse of the Day</span>
            </div>
            <blockquote class="text-2xl md:text-3xl font-serif text-[#18181B] dark:text-stone-100 leading-relaxed mb-6">
              "{{ featuredVerse.text }}"
            </blockquote>
            <div class="flex items-center justify-between">
              <NuxtLink 
                :to="`/verse/${featuredVerse.verseKey}`"
                class="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
              >
                <span class="font-mono">@{{ featuredVerse.verseKey }}</span>
                <span v-if="featuredVerse.surahName">— {{ featuredVerse.surahName }}</span>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        <NuxtLink
          to="/notes"
          class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.75rem] p-8 md:p-10 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200/60 dark:hover:border-amber-700/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors duration-300">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-[#52525B] dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-semibold text-[#18181B] dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Notes & Timeline
              </h2>
              <p class="text-[#52525B] dark:text-stone-400">
                Create notes, cite verses with @surah:ayah, and search your knowledge base.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium">
            <span>Explore your notes</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/browse"
          class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.75rem] p-8 md:p-10 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200/60 dark:hover:border-amber-700/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors duration-300">
              <UIcon name="i-heroicons-book-open" class="w-6 h-6 text-[#52525B] dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-semibold text-[#18181B] dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Browse Quran
              </h2>
              <p class="text-[#52525B] dark:text-stone-400">
                Read 114 chapters with translations. Powered by Quran Foundation API.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium">
            <span>Open the Quran</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </NuxtLink>
      </section>

      <!-- Quick Links -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          to="/heatmap"
          class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
          </div>
          <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">Statistics</p>
        </NuxtLink>

        <NuxtLink
          to="/notes/new"
          class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
            <UIcon name="i-heroicons-plus" class="w-5 h-5 text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
          </div>
          <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">New Note</p>
        </NuxtLink>

        <button
          @click="openCommandPalette"
          class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
          </div>
          <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">Search</p>
          <p class="text-xs text-stone-400 mt-1">⌘K</p>
        </button>

        <NuxtLink
          to="/browse"
          class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
            <UIcon name="i-heroicons-bookmark" class="w-5 h-5 text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
          </div>
          <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">Browse</p>
          <p class="text-xs text-stone-400 mt-1">114 Surahs</p>
        </NuxtLink>
      </section>

      <section class="text-center mt-16">
        <p class="text-[#52525B] dark:text-stone-400">
          <NuxtLink to="/login" class="text-amber-600 dark:text-amber-500 hover:text-amber-700 transition-colors">
            Sign in
          </NuxtLink>
          to sync notes to your account.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const user = useSupabaseUser()

watchEffect(() => {
  if (user.value) {
    navigateTo('/dashboard', { replace: true })
  }
})

const featuredVerse = ref<{
  verseKey: string
  text: string
  surahName?: string
} | null>(null)

const globalStats = ref({
  totalNotes: 0,
  totalVerses: 0,
  totalUsers: 0,
  totalChapters: 0
})

async function loadFeaturedVerse() {
  try {
    const randomChapter = Math.floor(Math.random() * 114) + 1
    const { verses } = await $fetch<{ verses: Array<{ verse_key: string; text: string; translations?: Array<{ text: string }> }> }>(
      `/api/quran/chapter-verses?chapter=${randomChapter}&limit=1`
    )
    if (verses?.length) {
      const verse = verses[0]
      const translation = verse.translations?.[0]?.text || verse.text
      const { chapters } = await $fetch<{ chapters: Array<{ id: number; name_simple: string }> }>('/api/chapters')
      const chapter = chapters?.find((c: any) => c.id === randomChapter)
      featuredVerse.value = {
        verseKey: verse.verse_key,
        text: translation.length > 200 ? translation.slice(0, 200) + '...' : translation,
        surahName: chapter?.name_simple
      }
    }
  } catch (e) {
    console.error('Failed to load featured verse:', e)
  }
}

async function loadGlobalStats() {
  if (user.value) return
  try {
    const data = await $fetch<{ totalNotes: number; totalVerses: number; totalChapters: number }>('/api/stats')
    globalStats.value = {
      totalNotes: data.totalNotes || 0,
      totalVerses: data.totalVerses || 0,
      totalUsers: 1,
      totalChapters: data.totalChapters || 0
    }
  } catch (e) {
    console.error('Failed to load global stats:', e)
    // Use placeholder values for demo
    globalStats.value = {
      totalNotes: 42,
      totalVerses: 156,
      totalUsers: 5,
      totalChapters: 28
    }
  }
}

function openCommandPalette() {
  const palette = document.querySelector('[data-command-palette]') as any
  if (palette?.__vueParentComponent?.exposed?.open) {
    palette.__vueParentComponent.exposed.open()
  }
}

onMounted(async () => {
  loadFeaturedVerse()
  loadGlobalStats()
})
</script>
