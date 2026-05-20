<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-5xl mx-auto px-6 py-16 md:py-24">
      
      <!-- SECTION 1: HERO -->
      <section class="text-center mb-24">
        <div class="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-sm text-[#52525B] dark:text-stone-400 mb-8">
          <UIcon name="i-heroicons-sparkles-solid" class="w-4 h-4 text-amber-600" />
          <span>A Quran Learning Workspace</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-6 leading-[1.1]">
          Learn the Quran<br />
          <span class="text-amber-600 dark:text-amber-500">by writing</span>, not just reading
        </h1>
        
        <p class="text-xl text-[#52525B] dark:text-stone-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Capture your reflections, connect them to verses, and track your journey across the Quran.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink 
            to="/notes/new"
            class="inline-flex items-center gap-2 px-8 py-4 bg-[#18181B] dark:bg-amber-600 text-white rounded-lg font-medium text-lg hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300"
          >
            <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
            <span>Start Writing</span>
          </NuxtLink>
          <NuxtLink 
            to="/quran"
            class="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[#18181B] dark:text-stone-100 rounded-lg font-medium text-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300"
          >
            <span>Browse Quran</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Verse of the Day -->
      <section class="mb-24">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-widest mb-8">
            <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
            Verse of the Day
          </div>

          <div v-if="!featuredVerse" class="animate-pulse space-y-6">
            <div class="h-16 bg-stone-100 dark:bg-stone-800 rounded-lg w-3/4 mx-auto"></div>
            <div class="h-4 bg-stone-100 dark:bg-stone-800 rounded w-1/2 mx-auto"></div>
            <div class="h-10 bg-stone-100 dark:bg-stone-800 rounded w-40 mx-auto mt-8"></div>
          </div>

          <template v-else>
            <p class="text-3xl md:text-4xl lg:text-5xl font-arabic text-[#18181B] dark:text-stone-100 leading-[2.2] mb-6" dir="rtl">
              {{ featuredVerse.text }}
            </p>
            <div class="w-12 h-0.5 bg-amber-300 dark:bg-amber-700 mx-auto mb-6"></div>
            <p class="text-base md:text-lg text-[#52525B] dark:text-stone-400 leading-relaxed max-w-xl mx-auto mb-2 italic">
              "{{ featuredVerse.translation }}"
            </p>
            <span class="inline-block font-mono text-xs text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full mb-10">
              @{{ featuredVerse.verseKey }}
            </span>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NuxtLink 
                :to="`/notes/new?verse=${featuredVerse.verseKey}`"
                class="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 shadow-sm"
              >
                <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
                Reflect on this verse
              </NuxtLink>
              <NuxtLink 
                :to="`/quran/verse/${featuredVerse.verseKey}`"
                class="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[#52525B] dark:text-stone-400 rounded-lg font-medium text-sm hover:text-[#18181B] dark:hover:text-stone-100 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300"
              >
                <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
                Read in context
              </NuxtLink>
            </div>
          </template>
        </div>
      </section>

      <!-- SECTION 2: PROBLEM → INSIGHT -->
      <section class="mb-20">
        <div class="max-w-2xl mx-auto text-center">
          <p class="text-lg text-[#52525B] dark:text-stone-400 leading-relaxed mb-8">
            You read the Quran.<br />
            You attend lectures.<br />
            You take notes...<br /><br />
            But your knowledge stays <span class="text-amber-600 dark:text-amber-500 font-medium">scattered</span>.
          </p>
          <div class="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl">
            <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <p class="text-lg text-[#18181B] dark:text-stone-100 font-medium">
              Qayra connects your notes to verses
            </p>
          </div>
        </div>
      </section>

      <!-- SECTION 3: THREE PILLARS -->
      <section class="mb-20">
        <h2 class="text-2xl font-light text-[#18181B] dark:text-stone-100 mb-10 text-center">Three pillars of Qayra</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-8">
            <div class="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-pencil" class="w-6 h-6 text-[#52525B] dark:text-stone-400" />
            </div>
            <h3 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-2">Write your understanding</h3>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Capture what you learn from lectures, reading, or personal reflection.</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-8">
            <div class="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-link" class="w-6 h-6 text-[#52525B] dark:text-stone-400" />
            </div>
            <h3 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-2">Connect to verses</h3>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Mention Quran verses directly in your notes (e.g. @2:153).</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-8">
            <div class="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-[#52525B] dark:text-stone-400" />
            </div>
            <h3 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-2">Track your journey</h3>
            <p class="text-sm text-[#52525B] dark:text-stone-400">See how your notes grow across the Quran over time.</p>
          </div>
        </div>
      </section>

      <!-- SECTION 4: HOW IT WORKS -->
      <section class="mb-20">
        <h2 class="text-2xl font-light text-[#18181B] dark:text-stone-100 mb-10 text-center">How it works</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="flex items-start gap-4">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm font-medium text-[#18181B] dark:text-stone-100">1</span>
            <div>
              <h3 class="text-base font-medium text-[#18181B] dark:text-stone-100 mb-1">Discover a verse</h3>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Start from the Quran</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm font-medium text-[#18181B] dark:text-stone-100">2</span>
            <div>
              <h3 class="text-base font-medium text-[#18181B] dark:text-stone-100 mb-1">Write your note</h3>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Capture understanding</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm font-medium text-[#18181B] dark:text-stone-100">3</span>
            <div>
              <h3 class="text-base font-medium text-[#18181B] dark:text-stone-100 mb-1">Connect verses</h3>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Use @ to link notes</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm font-medium text-[#18181B] dark:text-stone-100">4</span>
            <div>
              <h3 class="text-base font-medium text-[#18181B] dark:text-stone-100 mb-1">Track progress</h3>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Watch learning grow</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 5: PROGRESS -->
      <section class="mb-20">
        <h2 class="text-2xl font-light text-[#18181B] dark:text-stone-100 mb-8 text-center">Community Progress</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.totalNotes }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Notes Created</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.totalVerses }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Verses Cited</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.activeDays }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Active Days</p>
          </div>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
            <p class="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{{ globalStats.chaptersCovered }}</p>
            <p class="text-sm text-[#52525B] dark:text-stone-400">Chapters Covered</p>
          </div>
        </div>
      </section>

      <!-- SECTION 6: FINAL CTA -->
      <section class="text-center py-12">
        <h2 class="text-3xl font-light text-[#18181B] dark:text-stone-100 mb-6">
          Start building your Quran learning journey today
        </h2>
        <NuxtLink 
          to="/notes/new"
          class="inline-flex items-center gap-2 px-8 py-4 bg-[#18181B] dark:bg-amber-600 text-white rounded-lg font-medium text-lg hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300"
        >
          <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
          <span>Start Writing</span>
        </NuxtLink>
      </section>

      <!-- Back to Top -->
      <button 
        v-show="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group z-50"
      >
        <UIcon name="i-heroicons-arrow-up" class="w-5 h-5 text-[#52525B] dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors" />
      </button>

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
  translation: string
} | null>(null)

const globalStats = ref({
  totalNotes: 0,
  totalVerses: 0,
  activeDays: 0,
  chaptersCovered: 0
})

async function loadGlobalStats() {
  try {
    const data = await $fetch('/api/stats')
    globalStats.value = {
      totalNotes: data.totalNotes || 0,
      totalVerses: data.totalVerses || 0,
      activeDays: data.activeDays || 0,
      chaptersCovered: data.totalChapters || 0
    }
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
}

const config = useRuntimeConfig()
const isContentPrelive = computed(() => config.public.qfContentEnv === 'prelive')

async function loadFeaturedVerse() {
  try {
    const maxChapter = isContentPrelive.value ? 2 : 114
    const randomChapter = Math.floor(Math.random() * maxChapter) + 1
    const { verses } = await $fetch<{ verses: Array<{ key: string; text: string; translation: string }> }>(
      `/api/quran/chapter-verses?chapterId=${randomChapter}`
    )
    if (verses?.length) {
      const verse = verses[0]
      let translation = verse.translation || ''
      if (translation.length > 150) translation = translation.slice(0, 150) + '...'
      featuredVerse.value = {
        verseKey: verse.key,
        text: verse.text || '',
        translation
      }
    }
  } catch (e) {
    console.error('Failed to load featured verse:', e)
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showBackToTop = ref(false)

function handleScroll() {
  showBackToTop.value = window.scrollY > 500
}

onMounted(() => {
  loadFeaturedVerse()
  loadGlobalStats()
  window.addEventListener('scroll', handleScroll)
})
</script>
