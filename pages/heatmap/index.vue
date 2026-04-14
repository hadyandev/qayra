<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <header class="mb-12">
        <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">
          Reflection Heatmap
        </h1>
        <p class="text-[#52525B] dark:text-stone-400">
          Visual overview of your Quran reflections across all chapters
        </p>
      </header>

      <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          <p class="text-[#52525B] dark:text-stone-400">Loading heatmap...</p>
        </div>
      </div>

      <template v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p class="text-3xl font-semibold text-[#18181B] dark:text-stone-100">114</p>
            <p class="text-sm text-stone-400">Total Chapters</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p class="text-3xl font-semibold text-[#18181B] dark:text-stone-100">{{ totalVerses.toLocaleString() }}</p>
            <p class="text-sm text-stone-400">Total Verses</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p class="text-3xl font-semibold text-[#18181B] dark:text-stone-100">{{ totalReflected }}</p>
            <p class="text-sm text-stone-400">Reflected Verses</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 text-stone-600 dark:text-stone-400" />
              </div>
            </div>
            <p class="text-3xl font-semibold text-[#18181B] dark:text-stone-100">{{ completionPercentage }}%</p>
            <p class="text-sm text-stone-400">Completion</p>
          </div>
        </div>

        <!-- GitHub-style Contribution Calendar -->
        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100">Contribution Activity</h2>
              <p class="text-sm text-stone-400 mt-1">
                {{ activityData.totalContributions }} reflections in the last year
              </p>
            </div>
            <div class="flex items-center gap-2 text-xs text-stone-400">
              <span>Less</span>
              <div class="flex gap-1">
                <div class="w-3 h-3 rounded-sm bg-stone-100 dark:bg-stone-800"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-900/50"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-800/70"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700/80"></div>
                <div class="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-600"></div>
              </div>
              <span>More</span>
            </div>
          </div>
          
          <div class="overflow-x-auto pb-2">
            <div class="flex gap-1 min-w-max">
              <div class="flex flex-col gap-1">
                <div class="h-4"></div>
                <div class="flex flex-col gap-1 text-[10px] text-stone-400 leading-3">
                  <span class="h-3">Mon</span>
                  <span class="h-3"></span>
                  <span class="h-3">Wed</span>
                  <span class="h-3"></span>
                  <span class="h-3">Fri</span>
                  <span class="h-3"></span>
                  <span class="h-3">Sun</span>
                </div>
              </div>
              
              <div class="flex gap-1">
                <div v-if="activityData.monthLabels && activityData.monthLabels.length > 0" class="flex flex-col">
                  <div class="flex gap-1 mb-1">
                    <span 
                      v-for="(label, idx) in activityData.monthLabels" 
                      :key="idx"
                      class="text-[10px] text-stone-400"
                      :style="{ marginLeft: idx === 0 ? '0' : `${(label.weekIndex - (activityData.monthLabels[idx-1]?.weekIndex || 0) - 1) * 12}px` }"
                    >
                      {{ label.month }}
                    </span>
                  </div>
                  <div class="flex gap-1">
                    <div 
                      v-for="(week, weekIdx) in activityData.weeks" 
                      :key="weekIdx"
                      class="flex flex-col gap-1"
                    >
                      <div 
                        v-for="(day, dayIdx) in week" 
                        :key="dayIdx"
                        class="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-amber-400/50"
                        :class="getContributionColor(day.level)"
                        :title="`${day.date}: ${day.count} reflection${day.count !== 1 ? 's' : ''}`"
                        @click="showDayActivity(day)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter List with mini grids -->
        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-stone-200/60 dark:border-stone-800">
                  <th class="text-left px-6 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-16">#</th>
                  <th class="text-left px-6 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider">Chapter</th>
                  <th class="text-center px-6 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-24">Type</th>
                  <th class="text-center px-6 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-24">Verses</th>
                  <th class="text-center px-6 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider w-32">Reflected</th>
                  <th class="text-left px-6 py-4 text-xs font-medium text-stone-400 uppercase tracking-wider">Activity</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
                <tr 
                  v-for="chapter in chapters" 
                  :key="chapter.id"
                  class="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer group"
                  @click="navigateToChapter(chapter.id)"
                >
                  <td class="px-6 py-4">
                    <span class="font-mono text-sm text-amber-600 dark:text-amber-500">{{ chapter.id }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <span class="text-arabic text-xl text-stone-400">{{ chapter.name_arabic }}</span>
                      <div>
                        <p class="font-medium text-[#18181B] dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                          {{ chapter.name_simple }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span 
                      class="px-2 py-1 text-xs rounded-full"
                      :class="chapter.chapter_type === 'Meccan' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'"
                    >
                      {{ chapter.chapter_type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="font-mono text-sm text-stone-500 dark:text-stone-400">{{ chapter.verse_count }}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="font-mono text-sm font-medium" :class="chapter.reflection_count > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-stone-400'">
                      {{ chapter.reflection_count }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex gap-1 flex-wrap max-w-[300px]">
                      <div 
                        v-for="v in chapter.verses.slice(0, 50)" 
                        :key="v.key"
                        class="w-2 h-2 rounded-sm transition-transform hover:scale-150 cursor-pointer"
                        :class="v.hasReflection ? 'bg-amber-500' : 'bg-stone-200 dark:bg-stone-700'"
                        :title="`${v.key}${v.hasReflection ? ' - has reflection' : ''}`"
                        @click.stop="openVersePanel(v.key)"
                      ></div>
                      <span v-if="chapter.verse_count > 50" class="text-xs text-stone-400 self-center ml-1">
                        +{{ chapter.verse_count - 50 }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="text-center py-8">
          <div class="inline-flex items-center gap-6 text-sm text-[#52525B] dark:text-stone-400">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
              <span>Total Chapters: 114</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
              <span>Total Verses: 6,236</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4" />
              <span>Reflected: {{ totalReflected }} ({{ completionPercentage }}%)</span>
            </div>
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
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="selectedDay = null"
        >
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="selectedDay = null"></div>
          <div class="relative bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <button 
              @click="selectedDay = null"
              class="absolute top-4 right-4 p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-stone-400" />
            </button>
            <p class="text-2xl font-semibold text-[#18181B] dark:text-stone-100 mb-1">
              {{ selectedDay.count }} {{ selectedDay.count === 1 ? 'reflection' : 'reflections' }}
            </p>
            <p class="text-stone-400">{{ formatDateFull(selectedDay.date) }}</p>
            <p v-if="selectedDay.count === 0" class="text-stone-400 mt-4">No reflections on this day.</p>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

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

const chapters = ref<HeatmapChapter[]>([])
const activityData = ref<{
  weeks: ActivityDay[][]
  monthLabels: Array<{ month: string; weekIndex: number }>
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

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
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
    console.error('Failed to load heatmap:', e)
  } finally {
    loading.value = false
  }
})
</script>
