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
              {{ user ? 'Your journey across the Quran' : 'Quran engagement statistics' }}
            </p>
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
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ combinedData.totalNotes }}</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span class="text-xs text-stone-400 uppercase tracking-wide">Reading Sessions</span>
            </div>
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ combinedData.totalReadingSessions }}</p>
          </div>
          
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span class="text-xs text-stone-400 uppercase tracking-wide">Active Days</span>
            </div>
            <p class="text-3xl font-bold text-[#18181B] dark:text-stone-100">{{ combinedData.totalActiveDays }}</p>
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
          <div class="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 class="text-lg font-semibold text-[#18181B] dark:text-stone-100">Activity Calendar</h2>
              <p class="text-sm text-stone-400 mt-1">Combined notes and reading activity over the last year</p>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-stone-400">
              <span>Less</span>
              <div class="flex gap-0.5">
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
            <div class="flex gap-0.5 min-w-[600px]">
              <div class="flex flex-col gap-0.5 pr-2">
                <div v-for="(day, idx) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="idx" class="h-3 text-[10px] text-stone-400 leading-3 flex items-center justify-end w-4">
                  <span v-if="idx % 2 === 1">{{ day }}</span>
                </div>
              </div>
              
              <div class="flex gap-0.5">
                <div 
                  v-for="(week, weekIdx) in combinedWeeks" 
                  :key="weekIdx"
                  class="flex flex-col gap-0.5"
                >
                  <div 
                    v-for="(day, dayIdx) in week" 
                    :key="dayIdx"
                    class="w-3 h-3 rounded-sm cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-amber-400/50 hover:scale-125"
                    :class="getContributionColor(day.level)"
                    :title="getDayTitle(day)"
                    @click="showDayActivity(day)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity List -->
        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-[#18181B] dark:text-stone-100">Recent Activity</h2>
          </div>
          
          <div v-if="!combinedActivities.length" class="text-center py-4 text-stone-400">
            <p>No activity yet. Start taking notes and reading verses!</p>
          </div>
          <div v-else class="space-y-3 max-h-80 overflow-y-auto">
            <div 
              v-for="activity in combinedActivities" 
              :key="activity.id"
              class="flex items-center justify-between py-2.5 border-b border-stone-100 dark:border-stone-800 last:border-0"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :class="activity.type === 'note' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'"
                >
                  <UIcon 
                    :name="activity.type === 'note' ? 'i-heroicons-document-text' : 'i-heroicons-book-open'" 
                    :class="activity.type === 'note' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'" 
                    class="w-4 h-4" 
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-sm text-[#18181B] dark:text-stone-100">
                    <template v-if="activity.type === 'reading'">
                      <template v-for="(chunk, idx) in activity.descriptionChunks" :key="idx">
                        <button
                          v-if="chunk.verse"
                          @click="navigateToVerse(chunk.verseKey!)"
                          class="inline text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                        >
                          {{ chunk.text }}
                        </button>
                        <span v-else class="text-stone-400">{{ chunk.text }}</span>
                      </template>
                    </template>
                    <template v-else-if="activity.noteId">
                      <button
                        @click="navigateToNote(activity.noteId)"
                        class="inline text-[#18181B] dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                      >
                        {{ activity.description }}
                      </button>
                    </template>
                    <span v-else>{{ activity.description }}</span>
                  </p>
                  <p class="text-xs text-stone-400">
                    {{ activity.dateLabel }}
                  </p>
                </div>
              </div>
              <span class="text-xs text-stone-400 shrink-0 ml-4">
                {{ activity.badge }}
              </span>
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
              {{ selectedDay.count === 1 ? 'activity' : 'activities' }} on {{ formatDateFull(selectedDay.date) }}
            </p>
            <div v-if="selectedDay.notes > 0 || selectedDay.readings > 0" class="mt-3 space-y-1 text-sm">
              <div v-if="selectedDay.notes > 0" class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                <span>{{ selectedDay.notes }} note{{ selectedDay.notes > 1 ? 's' : '' }}</span>
              </div>
              <div v-if="selectedDay.readings > 0" class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
                <span>{{ selectedDay.readings }} reading session{{ selectedDay.readings > 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
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
  notes: number
  readings: number
}

interface DescriptionChunk {
  text: string
  verse?: boolean
  verseKey?: string
}

interface CombinedActivity {
  id: string
  type: 'note' | 'reading'
  date: string
  dateLabel: string
  description: string
  badge: string
  verseKeys?: string[]
  noteId?: string
  descriptionChunks: DescriptionChunk[]
}

interface MonthLabel {
  month: string
  weekIndex: number
}

const chapters = ref<HeatmapChapter[]>([])
const combinedWeeks = ref<ActivityDay[][]>([])
const combinedActivities = ref<CombinedActivity[]>([])
const combinedData = ref({
  totalNotes: 0,
  totalReadingSessions: 0,
  totalActiveDays: 0
})
const loading = ref(true)
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

function getDayTitle(day: ActivityDay): string {
  const parts = []
  if (day.notes > 0) parts.push(`${day.notes} note${day.notes > 1 ? 's' : ''}`)
  if (day.readings > 0) parts.push(`${day.readings} reading${day.readings > 1 ? 's' : ''}`)
  return `${formatDate(day.date)}: ${parts.join(', ') || 'No activity'}`
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

function navigateToVerse(verseKey: string) {
  router.push(`/verse/${verseKey}`)
}

function navigateToNote(noteId: string) {
  router.push(`/notes/${noteId}`)
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseRangeToDescription(range: string): string {
  const parts = range.split('-')
  const start = parts[0]
  const end = parts[1] || start
  
  const [startChapter, startVerse] = start.split(':')
  const [endChapter, endVerse] = end.split(':')
  
  if (startChapter === endChapter) {
    if (startVerse === endVerse) {
      return `${startChapter}:${startVerse}`
    }
    return `${startChapter}:${startVerse}-${endVerse}`
  }
  
  return `${start}-${end}`
}

function parseRangeToChunks(range: string): DescriptionChunk[] {
  const parts = range.split('-')
  const start = parts[0]
  const end = parts[1] || start
  
  const [startChapter, startVerse] = start.split(':')
  const [endChapter, endVerse] = end.split(':')
  
  const chunks: DescriptionChunk[] = []
  
  if (startChapter === endChapter) {
    if (startVerse === endVerse) {
      chunks.push({ text: `${startChapter}:${startVerse}`, verse: true, verseKey: start })
    } else {
      chunks.push({ text: `${startChapter}:${startVerse}`, verse: true, verseKey: start })
      chunks.push({ text: '–', verse: false })
      chunks.push({ text: `${endVerse}`, verse: true, verseKey: `${startChapter}:${endVerse}` })
    }
  } else {
    chunks.push({ text: start, verse: true, verseKey: start })
    chunks.push({ text: '–', verse: false })
    chunks.push({ text: end, verse: true, verseKey: end })
  }
  
  return chunks
}

function buildCombinedCalendar(
  notesByDate: Record<string, number>,
  readingsByDate: Record<string, number>
): { weeks: ActivityDay[][]; totalNotes: number; totalReadings: number; totalActiveDays: number } {
  const today = new Date()
  const todayStr = formatLocalDate(today)
  const weeks: ActivityDay[][] = []
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)
  
  let currentWeek: ActivityDay[] = []
  const currentDate = new Date(startDate)
  let totalNotes = 0
  let totalReadings = 0
  const activeDays = new Set<string>()
  
  while (formatLocalDate(currentDate) <= todayStr) {
    const dateStr = formatLocalDate(currentDate)
    const notes = notesByDate[dateStr] || 0
    const readings = readingsByDate[dateStr] || 0
    const count = notes + readings
    
    if (notes > 0) totalNotes += notes
    if (readings > 0) totalReadings += readings
    if (count > 0) activeDays.add(dateStr)
    
    let level = 0
    if (count >= 1) level = 1
    if (count >= 2) level = 2
    if (count >= 4) level = 3
    if (count >= 6) level = 4
    
    currentWeek.push({ date: dateStr, count, level, notes, readings })
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }
  
  return { weeks, totalNotes, totalReadings, totalActiveDays: activeDays.size }
}

function buildCombinedActivities(
  localNotes: Array<{ id?: string; date: string; title?: string; verseKeys?: string[] }>,
  qfReadings: Array<{ date: string; ranges?: string[]; type?: string }>
): CombinedActivity[] {
  const activities: CombinedActivity[] = []
  let idCounter = 0
  
  for (const note of localNotes) {
    const date = new Date(note.date + 'T00:00:00')
    let description: string
    let badge: string
    let chunks: DescriptionChunk[]
    
    if (note.verseKeys && note.verseKeys.length > 0) {
      const verseDesc = note.verseKeys.length === 1 
        ? note.verseKeys[0]
        : note.verseKeys.length <= 3 
          ? note.verseKeys.join(', ')
          : `${note.verseKeys.slice(0, 2).join(', ')} +${note.verseKeys.length - 2} more`
      description = `Reflected on ${verseDesc}`
      badge = verseDesc
      chunks = note.verseKeys.map((key) => {
        const parts = key.split(':')
        return { text: `${parts[0]}:${parts[1]}`, verse: true, verseKey: key }
      })
      chunks = [{ text: 'Reflected on ', verse: false }, ...chunks]
    } else if (note.title) {
      description = `Created note "${note.title}"`
      badge = 'Note'
      chunks = [{ text: description, verse: false }]
    } else {
      description = 'Created a note'
      badge = 'Note'
      chunks = [{ text: description, verse: false }]
    }
    
    activities.push({
      id: `note-${idCounter++}`,
      type: 'note',
      date: note.date,
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description,
      badge,
      verseKeys: note.verseKeys,
      noteId: note.id,
      descriptionChunks: chunks
    })
  }
  
  for (const reading of qfReadings) {
    const date = new Date(reading.date + 'T00:00:00')
    const ranges = reading.ranges || []
    
    if (ranges.length === 0) {
      activities.push({
        id: `reading-${idCounter++}`,
        type: 'reading',
        date: reading.date,
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: 'Read Quran',
        badge: 'Reading',
        descriptionChunks: [{ text: 'Read Quran', verse: false }]
      })
      continue
    }
    
    const chunks: DescriptionChunk[] = [{ text: 'Read ', verse: false }]
    const descParts: string[] = []
    
    ranges.forEach((range, idx) => {
      if (idx > 0) {
        chunks.push({ text: ', ', verse: false })
      }
      const rangeChunks = parseRangeToChunks(range)
      chunks.push(...rangeChunks)
      descParts.push(parseRangeToDescription(range))
    })
    
    if (ranges.length > 3) {
      chunks.push({ text: ` +${ranges.length - 2} more`, verse: false })
    }
    
    activities.push({
      id: `reading-${idCounter++}`,
      type: 'reading',
      date: reading.date,
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Read ${descParts.join(', ')}`,
      badge: descParts.join(', '),
      descriptionChunks: chunks
    })
  }
  
  activities.sort((a, b) => b.date.localeCompare(a.date))
  return activities.slice(0, 50)
}

onMounted(async () => {
  try {
    const [heatmapRes, activityRes, qfActivityRes] = await Promise.all([
      $fetch<{ chapters: HeatmapChapter[] }>('/api/heatmap'),
      $fetch('/api/activity'),
      $fetch<{ authenticated: boolean; activities: Array<{ date: string; count: number; type: string; ranges?: string[] }>; error?: string }>('/api/qf/user-activity').catch(() => ({ authenticated: false, activities: [], error: '' }))
    ])
    
    chapters.value = heatmapRes.chapters || []
    
    const notesByDate: Record<string, number> = {}
    const noteList: Array<{ id?: string; date: string; title?: string; verseKeys?: string[] }> = []
    ;(activityRes as any)?.weeks?.forEach((week: ActivityDay[]) => {
      week.forEach(day => {
        if (day.count > 0) {
          notesByDate[day.date] = day.count
        }
      })
    })
    const noteDetails = (activityRes as any)?.noteDetails || []
    for (const detail of noteDetails) {
      noteList.push({
        id: detail.id,
        date: detail.date,
        title: detail.title,
        verseKeys: detail.verseKeys || []
      })
    }
    
    const readingsByDate: Record<string, number> = {}
    const readingList: Array<{ date: string; ranges?: string[] }> = []
    if (qfActivityRes.authenticated && qfActivityRes.activities) {
      for (const activity of qfActivityRes.activities) {
        readingsByDate[activity.date] = (readingsByDate[activity.date] || 0) + 1
        readingList.push({ date: activity.date, ranges: activity.ranges })
      }
    }
    
    const calendarData = buildCombinedCalendar(notesByDate, readingsByDate)
    combinedWeeks.value = calendarData.weeks
    combinedData.value = {
      totalNotes: calendarData.totalNotes,
      totalReadingSessions: calendarData.totalReadings,
      totalActiveDays: calendarData.totalActiveDays
    }
    
    combinedActivities.value = buildCombinedActivities(noteList, readingList)
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
