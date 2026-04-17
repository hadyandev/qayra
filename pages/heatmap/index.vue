<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <header class="mb-12">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-chart-bar-square" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
              Statistics
            </h1>
            <p class="text-[#52525B] dark:text-stone-400">
              {{ user ? 'Your note journey across the Quran' : 'Quran engagement statistics' }}
            </p>
            
            <div v-if="!user" class="mt-4 text-xs text-amber-600 dark:text-amber-500">
              Sign in to see your personal statistics
            </div>
          </div>
        </div>
      </header>

      <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          <p class="text-[#52525B] dark:text-stone-400">Loading statistics...</p>
        </div>
      </div>

      <template v-else>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span class="text-xs text-stone-400 uppercase tracking-wide">Notes</span>
            </div>
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ activityData.totalContributions }}</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span class="text-xs text-stone-400 uppercase tracking-wide">Cited Verses</span>
            </div>
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ totalReflected }}</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span class="text-xs text-stone-400 uppercase tracking-wide">Active Days</span>
            </div>
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ activityData.totalDays }}</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 text-stone-600 dark:text-stone-400" />
              </div>
              <span class="text-xs text-stone-400 uppercase tracking-wide">Completion</span>
            </div>
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ completionPercentage }}%</p>
          </div>
        </div>

        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-[#18181B] dark:text-stone-100">Activity Calendar</h2>
              <p class="text-sm text-stone-400 mt-1">
                Your note creation over the last year
              </p>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-stone-400">
              <span>Less</span>
              <div class="flex gap-0.5">
                <div class="w-3 h-3 rounded-sm bg-stone-100 dark:bg-stone-800"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-900/50"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-800/70"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700/80"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-500"></div>
              </div>
              <span>More</span>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <div class="flex gap-1 min-w-[800px]">
              <div class="flex flex-col gap-0.5 pt-6">
                <div v-for="(day, idx) in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="h-3 text-[9px] text-stone-400 leading-3">
                  <span v-if="idx % 2 === 1">{{ day }}</span>
                </div>
              </div>
              
              <div class="flex gap-0.5">
                <div v-if="activityData.monthLabels?.length" class="flex gap-0.5 mb-1">
                  <span 
                    v-for="(label, idx) in activityData.monthLabels" 
                    :key="idx"
                    class="text-[9px] text-stone-400 whitespace-nowrap"
                    :style="{ marginLeft: idx === 0 ? '0' : '4px' }"
                  >
                    {{ label.month }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex gap-0.5">
              <div class="flex flex-col gap-0.5 pr-1">
                <div v-for="(day, idx) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="idx" class="h-3 text-[9px] text-stone-400 leading-3 flex items-center">
                  <span v-if="idx % 2 === 1">{{ day }}</span>
                </div>
              </div>
              
              <div class="flex gap-0.5">
                <div 
                  v-for="(week, weekIdx) in activityData.weeks" 
                  :key="weekIdx"
                  class="flex flex-col gap-0.5"
                >
                  <div 
                    v-for="(day, dayIdx) in week" 
                    :key="dayIdx"
                    class="w-3 h-3 rounded-sm cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-amber-400/50 hover:scale-125"
                    :class="getContributionColor(day.level)"
                    :title="`${formatDate(day.date)}: ${day.count} note${day.count !== 1 ? 's' : ''}`"
                    @click="showDayActivity(day)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 class="text-xl font-semibold text-[#18181B] dark:text-stone-100 mb-4">Chapter Overview</h2>
        
        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl overflow-hidden mb-8">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-stone-200/60 dark:border-stone-800">
                  <th class="text-left px-5 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-14">#</th>
                  <th class="text-left px-5 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider">Chapter</th>
                  <th class="text-center px-5 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-20">Type</th>
                  <th class="text-center px-5 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-20">Verses</th>
                  <th class="text-center px-5 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-24">Notes</th>
                  <th class="text-left px-5 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
                <tr 
                  v-for="chapter in chapters" 
                  :key="chapter.id"
                  class="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer group"
                  @click="navigateToChapter(chapter.id)"
                >
                  <td class="px-5 py-4">
                    <span class="font-mono text-sm font-medium text-amber-600 dark:text-amber-500">{{ chapter.id }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <span class="text-arabic text-lg text-stone-400">{{ chapter.name_arabic }}</span>
                      <span class="font-medium text-[#18181B] dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                        {{ chapter.name_simple }}
                      </span>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span 
                      class="px-2 py-0.5 text-xs rounded-full"
                      :class="chapter.chapter_type === 'Meccan' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'"
                    >
                      {{ chapter.chapter_type === 'Meccan' ? 'Meccan' : 'Medinan' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span class="font-mono text-sm text-stone-500">{{ chapter.verse_count }}</span>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span class="font-mono text-sm font-medium" :class="chapter.reflection_count > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-stone-400'">
                      {{ chapter.reflection_count }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden max-w-[120px]">
                        <div 
                          class="h-full bg-amber-500 rounded-full transition-all duration-300"
                          :style="{ width: `${(chapter.reflection_count / chapter.verse_count) * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-xs text-stone-400 w-12 text-right">
                        {{ Math.round((chapter.reflection_count / chapter.verse_count) * 100) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <ReflectionPanel
        v-if="selectedVerse"
        :verse-key="selectedVerse"
        @close="selectedVerse = null"
      />

      <Teleport to="body">
        <div 
          v-if="selectedDay"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="selectedDay = null"
        >
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="selectedDay = null"></div>
          <div class="relative bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in">
            <button 
              @click="selectedDay = null"
              class="absolute top-4 right-4 p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-stone-400" />
            </button>
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100 mb-1">
              {{ selectedDay.count }}
            </p>
            <p class="text-stone-500 dark:text-stone-400 mb-1">
              {{ selectedDay.count === 1 ? 'note' : 'notes' }} on {{ formatDateFull(selectedDay.date) }}
            </p>
            <p v-if="selectedDay.count === 0" class="text-sm text-stone-400 mt-3">
              No notes were created on this day.
            </p>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const user = useSupabaseUser()

onMounted(() => {
  if (!user.value) {
    navigateTo('/login')
  }
})

const router = useRouter()

interface HeatmapVerse {
  key: string
  hasReflection: boolean
}

interface HeatmapChapter {
  id: number
  name_simple: string
  name_arabic: string
  verse_count: number
  chapter_type: string
  verses: HeatmapVerse[]
  reflection_count: number
}

interface ActivityDay {
  date: string
  count: number
  level: number
}

interface MonthLabel {
  month: string
  weekIndex: number
}

const chapters = ref<HeatmapChapter[]>([])
const activityData = ref<{
  weeks: ActivityDay[][]
  monthLabels: MonthLabel[]
  totalContributions: number
  totalDays: number
}>({ weeks: [], monthLabels: [], totalContributions: 0, totalDays: 0 })
const loading = ref(true)
const selectedVerse = ref<string | null>(null)
const selectedDay = ref<ActivityDay | null>(null)

const totalVerses = 6236

const totalReflected = computed(() => {
  return chapters.value.reduce((sum, ch) => sum + ch.reflection_count, 0)
})

const completionPercentage = computed(() => {
  if (totalVerses === 0) return 0
  return Math.round((totalReflected.value / totalVerses) * 100)
})

function getContributionColor(level: number): string {
  switch (level) {
    case 0: return 'bg-stone-100 dark:bg-stone-800'
    case 1: return 'bg-amber-200 dark:bg-amber-900/50'
    case 2: return 'bg-amber-300 dark:bg-amber-800/70'
    case 3: return 'bg-amber-400 dark:bg-amber-700/80'
    case 4: return 'bg-amber-500 dark:bg-amber-600'
    default: return 'bg-stone-100 dark:bg-stone-800'
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function showDayActivity(day: ActivityDay) {
  selectedDay.value = day
}

function navigateToChapter(id: number) {
  router.push(`/heatmap/${id}`)
}

function openVersePanel(verseKey: string) {
  selectedVerse.value = verseKey
}

onMounted(async () => {
  try {
    const [heatmapRes, activityRes] = await Promise.all([
      $fetch<{ chapters: HeatmapChapter[] }>('/api/heatmap'),
      $fetch('/api/activity')
    ])
    chapters.value = heatmapRes.chapters || []
    activityData.value = activityRes
  } catch (e) {
    console.error('Failed to load statistics:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-in {
  animation: animate-in 0.2s ease-out;
}
</style>
