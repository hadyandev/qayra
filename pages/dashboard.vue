<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <!-- Greeting Section -->
      <header class="mb-12">
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="text-sm text-amber-600 dark:text-amber-500 font-medium mb-2">Assalamu'alaikum 👋</p>
            <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">
              Welcome back{{ profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : '' }}
            </h1>
            <p class="text-[#52525B] dark:text-stone-400">
              <span v-if="lastLogin">Last active: {{ lastLogin }}</span>
              <span v-else>Start your reflection journey today</span>
            </p>
          </div>
          <UButton 
            to="/notes/new" 
            class="bg-amber-600 hover:bg-amber-500 text-white rounded-full px-6 py-2.5 font-medium shadow-sm"
            icon="i-heroicons-plus"
          >
            New Note
          </UButton>
        </div>
      </header>

      <!-- Quick Stats Grid (same as heatmap page) -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span class="text-xs text-stone-400 uppercase tracking-wide">Notes</span>
          </div>
          <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ stats.totalNotes || 0 }}</p>
        </div>

        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span class="text-xs text-stone-400 uppercase tracking-wide">Cited Verses</span>
          </div>
          <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ stats.totalVerses || 0 }}</p>
        </div>

        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span class="text-xs text-stone-400 uppercase tracking-wide">Active Days</span>
          </div>
          <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ stats.activeDays || 0 }}</p>
        </div>

        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </div>
            <span class="text-xs text-stone-400 uppercase tracking-wide">Chapters</span>
          </div>
          <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ stats.totalChapters || 0 }}</p>
          <p class="text-xs text-stone-400">of 114</p>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Verse of the Day & QF Banner -->
        <div class="space-y-6">
          <section class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6">
            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-4">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              <span class="text-sm font-medium uppercase tracking-wider">Verse of the Day</span>
            </div>
            
            <div v-if="!featuredVerse" class="animate-pulse space-y-3">
              <div class="h-4 bg-stone-100 dark:bg-stone-800 rounded w-3/4"></div>
              <div class="h-4 bg-stone-100 dark:bg-stone-800 rounded w-1/2"></div>
            </div>
            <VerseCard 
              v-else
              :verse-key="featuredVerse.verseKey"
              :text="featuredVerse.text"
              :translation="featuredVerse.translation"
              :interactive="true"
              class="shadow-sm"
            />
          </section>

          <!-- QF Connection CTA -->
          <section 
            v-if="!loadingQf && !qfConnection?.connected"
            class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl p-6 relative overflow-hidden"
          >
            <div class="absolute -right-12 -top-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
            <h3 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-2 relative z-10">Connect Quran Foundation</h3>
            <p class="text-sm text-stone-500 dark:text-stone-400 mb-4 relative z-10">
              Sync your reading history and track your daily streaks seamlessly across devices.
            </p>
            <NuxtLink 
              to="/profile"
              class="inline-flex items-center gap-2 px-4 py-2 bg-[#18181B] dark:bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all shadow-sm relative z-10"
            >
              <UIcon name="i-heroicons-link" class="w-4 h-4" />
              Connect Now
            </NuxtLink>
          </section>
        </div>

        <!-- Recent Notes -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100">Recent Notes</h2>
            <NuxtLink to="/notes" class="text-sm text-amber-600 dark:text-amber-500 hover:text-amber-700">
              View all →
            </NuxtLink>
          </div>
          <div v-if="loadingNotes" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 bg-stone-100 dark:bg-stone-800 rounded-xl animate-pulse"></div>
          </div>
          <div v-else-if="recentNotes.length === 0" class="text-center py-8 bg-stone-50 dark:bg-stone-900/50 rounded-xl">
            <p class="text-stone-400 mb-4">No notes yet</p>
            <UButton to="/notes/new" variant="outline" class="rounded-full">
              Create your first note
            </UButton>
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="note in recentNotes"
              :key="note.id"
              :to="`/notes/${note.id}`"
              class="block bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-4 hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-[#18181B] dark:text-stone-100 truncate">
                    {{ note.title || 'Untitled Note' }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1 text-xs text-stone-400">
                    <span>{{ formatDate(note.note_date || note.created_at) }}</span>
                    <span v-if="note.source">• {{ note.source }}</span>
                  </div>
                </div>
                <div v-if="note.verse_keys?.length" class="flex gap-1 relative z-10">
                  <button 
                    v-for="vk in note.verse_keys.slice(0, 2)" 
                    :key="vk"
                    class="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 rounded text-xs font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                    @click.stop.prevent="selectedVerse = vk"
                  >
                    @{{ vk }}
                  </button>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>

      <!-- Quick Actions -->
      <section class="mt-12">
        <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink
            to="/notes/new"
            class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-4 text-center hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors"
          >
            <UIcon name="i-heroicons-plus" class="w-6 h-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">New Note</p>
          </NuxtLink>
          <NuxtLink
            to="/browse"
            class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-4 text-center hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors"
          >
            <UIcon name="i-heroicons-book-open" class="w-6 h-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">Browse Quran</p>
          </NuxtLink>
          <NuxtLink
            to="/heatmap"
            class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-4 text-center hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors"
          >
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">My Stats</p>
          </NuxtLink>
          <button
            @click="openSearch"
            class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl p-4 text-center hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">Search</p>
          </button>
        </div>
      </section>
    </div>
    <VersePanel v-if="selectedVerse" :verse-key="selectedVerse" @close="selectedVerse = null" />
  </div>
</template>

<script setup lang="ts">
import VersePanel from '~/components/VersePanel.vue'
definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
const user = useSupabaseUser()
const isPrelive = computed(() => config.public.qfEnv === 'prelive')

if (!user.value) {
  navigateTo('/login')
}

const lastLogin = ref('')
const loadingNotes = ref(true)
const selectedVerse = ref<string | null>(null)
const { connection: qfConnection, loading: loadingQf, fetchConnection } = useQfConnection()
const recentNotes = ref<Array<{
  id: string
  title: string | null
  note_date: string | null
  created_at: string
  source: string | null
  verse_keys?: string[]
}>>([])

const stats = ref({
  totalNotes: 0,
  totalVerses: 0,
  totalChapters: 0,
  streakDays: 0,
  activeDays: 0
})

const chapters = ref<Array<{
  id: number
  name_simple: string
  name_arabic: string
  verse_count: number
  reflection_count: number
}>>([])

const activityData = ref<{
  weeks: Array<Array<{ date: string; count: number; level: number }>>
  totalContributions: number
  totalDays: number
}>({ weeks: [], totalContributions: 0, totalDays: 0 })

const featuredVerse = ref<{
  verseKey: string
  text: string
  translation: string
} | null>(null)

const profile = ref<{ display_name?: string }>({})

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function openSearch() {
  const palette = document.querySelector('[data-command-palette]') as any
  if (palette?.__vueParentComponent?.exposed?.open) {
    palette.__vueParentComponent.exposed.open()
  }
}

async function loadDashboard() {
  try {
    // Load notes
    const { notes } = await $fetch<{ notes: typeof recentNotes.value }>('/api/notes')
    recentNotes.value = (notes || []).slice(0, 5)
    
    // Load heatmap and activity data (same as heatmap page)
    const [heatmapRes, activityRes] = await Promise.all([
      $fetch<{ chapters: typeof chapters.value }>('/api/heatmap'),
      $fetch('/api/activity')
    ])
    
    chapters.value = heatmapRes.chapters || []
    activityData.value = activityRes
    
    // Calculate stats from heatmap data
    const totalReflectedVerses = chapters.value.reduce((sum, ch) => sum + ch.reflection_count, 0)
    const chaptersWithReflections = chapters.value.filter(ch => ch.reflection_count > 0).length
    
    // Try to get QF streak data (from user's Quran.com reading)
    let qfStreakDays = 0
    try {
      const qfStreak = await $fetch<{ currentStreakDays: number }>('/api/qf/streaks')
      qfStreakDays = qfStreak.currentStreakDays || 0
    } catch (e) {
      console.log('QF streak not available:', e)
    }
    
    stats.value = {
      totalNotes: activityData.value.totalContributions || 0,
      totalVerses: totalReflectedVerses,
      totalChapters: chaptersWithReflections,
      streakDays: qfStreakDays,
      activeDays: activityData.value.totalDays || 0
    }
  } catch (e) {
    console.error('Failed to load dashboard:', e)
  } finally {
    loadingNotes.value = false
  }
}

async function loadFeaturedVerse() {
  try {
    // In prelive, only use chapters 1-2 to avoid production data
    const maxChapter = isPrelive.value ? 2 : 114
    const randomChapter = Math.floor(Math.random() * maxChapter) + 1
    const { verses } = await $fetch<{ verses: Array<{ verse_key: string; text_uthmani?: string; text?: string; translations?: Array<{ text: string }> }> }>(
      `/api/quran/chapter-verses?chapter=${randomChapter}&limit=1`
    )
    if (verses?.length) {
      const verse = verses[0]
      const translation = verse.translations?.[0]?.text || ''
      featuredVerse.value = {
        verseKey: verse.verse_key,
        text: verse.text_uthmani || verse.text || '',
        translation: translation.length > 150 ? translation.slice(0, 150) + '...' : translation
      }
    }
  } catch (e) {
    console.error('Failed to load featured verse:', e)
  }
}

onMounted(async () => {
  if (user.value) {
    // Set last login greeting
    const now = new Date()
    lastLogin.value = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
    
    // Load profile
    const supabase = useSupabaseClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser?.id) {
      const { data } = await supabase.from('profiles').select('display_name').eq('id', currentUser.id).single()
      if (data) {
        profile.value = data
      }
    }
    
    fetchConnection()
    await Promise.all([loadDashboard(), loadFeaturedVerse()])
  }
})
</script>