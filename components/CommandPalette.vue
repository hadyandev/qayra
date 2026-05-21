<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
        <div class="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/60 dark:border-stone-700/60 overflow-hidden">
          <div class="flex items-center gap-3 px-4 py-3 border-b border-stone-200/60 dark:border-stone-700/60">
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-stone-400 flex-shrink-0" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Search verses, notes, or type @ for Quran..."
              class="flex-1 bg-transparent text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none text-base"
              @keydown.escape="close"
              @keydown.up.prevent="navigateUp"
              @keydown.down.prevent="navigateDown"
              @keydown.enter.prevent="selectCurrent"
            />
            <kbd class="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-stone-400 bg-stone-100 dark:bg-stone-800 rounded">
              esc
            </kbd>
          </div>

          <div class="max-h-[60vh] overflow-y-auto">
            <div v-if="isLoading" class="flex items-center justify-center py-12">
              <div class="w-6 h-6 border-2 border-stone-300 dark:border-stone-600 border-t-amber-500 rounded-full animate-spin"></div>
            </div>

            <div v-else-if="query && results.notes.length === 0 && results.verses.length === 0" class="py-12 text-center">
              <p class="text-stone-500 dark:text-stone-400">No results found</p>
              <p class="text-sm text-stone-400 dark:text-stone-500 mt-1">Try a different search term</p>
            </div>

            <div v-else-if="!query" class="py-8 px-4">
              <p class="text-sm text-stone-500 dark:text-stone-400 text-center mb-6">Quick navigation</p>
              <div class="space-y-1">
                <button
                  v-for="shortcut in shortcuts"
                  :key="shortcut.label"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                  @click="navigateTo(shortcut.to)"
                >
                  <div class="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <UIcon :name="shortcut.icon" class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">{{ shortcut.label }}</p>
                    <p class="text-xs text-stone-400 dark:text-stone-500">{{ shortcut.description }}</p>
                  </div>
                </button>
              </div>
            </div>

            <div v-else class="py-2">
              <div v-if="results.verses.length > 0">
                <p class="px-4 py-2 text-xs font-medium text-stone-400 uppercase tracking-wider">Verses</p>
                <button
                  v-for="(verse, index) in results.verses"
                  :key="verse.verseKey"
                  class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  :class="{ 'bg-amber-50 dark:bg-amber-900/20': selectedIndex === index }"
                  @click="selectVerse(verse)"
                  @mouseenter="selectedIndex = index"
                >
                  <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-sm font-mono font-semibold text-amber-700 dark:text-amber-400">{{ verse.verseKey }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-[#18181B] dark:text-stone-100 line-clamp-1">{{ verse.surahName || 'Quran' }}</p>
                    <p class="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">{{ verse.text }}</p>
                  </div>
                </button>
              </div>

              <div v-if="results.notes.length > 0">
                <p class="px-4 py-2 text-xs font-medium text-stone-400 uppercase tracking-wider">Your Notes</p>
                <button
                  v-for="(note, noteIndex) in results.notes"
                  :key="note.id"
                  class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  :class="{ 'bg-amber-50 dark:bg-amber-900/20': selectedIndex === results.verses.length + noteIndex }"
                  @click="selectNote(note)"
                  @mouseenter="selectedIndex = results.verses.length + noteIndex"
                >
                  <div class="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-stone-500 dark:text-stone-400" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-[#18181B] dark:text-stone-100 line-clamp-1" v-html="highlightMatch(note.title || 'Untitled Note')"></p>
                    <p v-if="note.content" class="text-xs text-[#52525B] dark:text-stone-400 line-clamp-1 mt-0.5" v-html="highlightMatch(note.content)"></p>
                    <div class="flex items-center gap-2 mt-1">
                      <span v-if="note.source" class="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">{{ note.source }}</span>
                      <span v-if="note.note_date" class="text-[10px] text-stone-400 dark:text-stone-500">{{ note.note_date }}</span>
                    </div>
                  </div>
                </button>
              </div>

              <div v-if="!user && query" class="px-4 py-3 mt-2 border-t border-stone-100 dark:border-stone-800/50">
                <div class="flex items-center justify-between">
                  <p class="text-xs text-stone-500 dark:text-stone-400">Looking for your notes?</p>
                  <NuxtLink to="/login" @click="close" class="text-xs font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 transition-colors">
                    Sign in to search workspace &rarr;
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <div v-if="query" class="flex items-center justify-between px-4 py-2 border-t border-stone-200/60 dark:border-stone-700/60 text-xs text-stone-400 dark:text-stone-500">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">↑</kbd>
                <kbd class="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">↓</kbd>
                to navigate
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">↵</kbd>
                to select
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useCommandPalette } from '~/composables/useCommandPalette'

type VerseResult = {
  verseKey: string
  text: string
  surahName?: string
}

type NoteResult = {
  id: string
  title: string | null
  content: string | null
  note_date: string | null
  source: string | null
}

function stripHtml(html: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '')
}

function highlightMatch(text: string) {
  if (!text || !query.value) return stripHtml(text)
  const cleanText = stripHtml(text)
  const q = query.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${q})`, 'gi')
  return cleanText.replace(regex, '<span class="bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 px-0.5 rounded">$1</span>')
}

const { isOpen, query, open, close, toggle, registerInputFocus } = useCommandPalette()

const user = useSupabaseUser()
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)
const isLoading = ref(false)
const chaptersData = ref<any[]>([])

const results = reactive({
  verses: [] as VerseResult[],
  notes: [] as NoteResult[]
})

const versePreviewCache = new Map<string, any[]>()

async function loadVersePreviews(chapterId: number): Promise<any[]> {
  const cacheKey = `ch-${chapterId}`
  if (versePreviewCache.has(cacheKey)) {
    return versePreviewCache.get(cacheKey)!
  }
  
  try {
    const data = await $fetch<{ verses: any[]; error?: string }>(
      `/api/quran/chapter-verses?chapterId=${chapterId}`
    )
    if (data.verses && data.verses.length > 0) {
      versePreviewCache.set(cacheKey, data.verses)
      return data.verses
    }
  } catch (e) {
    console.error(`Failed to load verse previews for chapter ${chapterId}:`, e)
  }
  return []
}

async function loadChapters(): Promise<any[]> {
  if (chaptersData.value.length > 0) return chaptersData.value
  
  try {
    const data = await $fetch<{ chapters: any[] }>('/api/chapters')
    chaptersData.value = data.chapters || []
    return chaptersData.value
  } catch (e) {
    console.error('Failed to load chapters:', e)
    return chaptersData.value
  }
}

const shortcuts = computed(() => {
  const items = [
    { label: 'Browse Quran', description: 'Explore all 114 chapters', to: '/quran', icon: 'i-heroicons-book-open' },
  ]
  if (user.value) {
    items.push(
      { label: 'My Notes', description: 'View your notes', to: '/notes', icon: 'i-heroicons-document-text' },
      { label: 'Saved Verses', description: 'View bookmarked verses', to: '/bookmarks', icon: 'i-heroicons-bookmark' },
      { label: 'Create Note', description: 'Start writing a new note', to: '/notes/new', icon: 'i-heroicons-plus' },
    )
  }
  return items
})

async function search() {
  if (!query.value.trim()) {
    results.verses = []
    results.notes = []
    return
  }

  isLoading.value = true
  selectedIndex.value = 0

  const q = query.value.trim()
  const chapterOnlyRegex = /^@?(\d{1,3}):?$/
  const chapterOnlyMatch = q.match(chapterOnlyRegex)
  const verseRegex = /^@?(\d{1,3}):(\d{1,3})$/
  const verseMatch = q.match(verseRegex)

  try {
    let versesList: VerseResult[] = []

    // Case 1: Pure chapter number with optional colon (e.g., "@11", "11", "@11:")
    if (chapterOnlyMatch) {
      const chapter = parseInt(chapterOnlyMatch[1])
      if (chapter >= 1 && chapter <= 114) {
        let surahName = `Chapter ${chapter}`
        const ch = chaptersData.value.find((c: any) => c.id === chapter)
        if (ch) {
          surahName = ch.name_simple
        }
        // Show all verses in that chapter
        const previews = await loadVersePreviews(chapter)
        const verseItems = (previews || []).slice(0, 10).map((v: any) => ({
          verseKey: v.key || `${chapter}:${v.verse_number || v.verseNumber}`,
          text: v.translation || v.text || '',
          surahName: surahName
        }))
        versesList = verseItems
      }
    }
    
    // Case 2: Chapter:Verse (e.g., "@11:5")
    if (verseMatch) {
      const chapter = parseInt(verseMatch[1])
      const verseStr = verseMatch[2]
      if (chapter >= 1 && chapter <= 114) {
        let surahName = `Chapter ${chapter}`
        const ch = chaptersData.value.find((c: any) => c.id === chapter)
        if (ch) {
          surahName = ch.name_simple
        }
        
        // Load verse previews for this chapter to show actual content
        const previews = await loadVersePreviews(chapter)
        const targetVerse = previews.find((v: any) => v.key === `${chapter}:${verseStr}`)
        
        if (targetVerse) {
          versesList.push({
            verseKey: `${chapter}:${verseStr}`,
            text: targetVerse.translation || '',
            surahName: surahName
          })
        } else {
          versesList.push({
            verseKey: `${chapter}:${verseStr}`,
            text: 'Jump directly to this verse',
            surahName: surahName
          })
        }
      }
    }

    // Case 3: Always try API search (for both cases above)
    try {
      const verseRes = await $fetch<{ results: any[] }>('/api/quran/search', { q: query.value })
      const fetchedVerses = (verseRes.results || []).slice(0, 5).map((r: any) => ({
        verseKey: r.verseKey || r.verse_key || '',
        text: r.text || r.translatedText || r.content || '',
        surahName: r.surahName || r.surah_name || ''
      }))

      const seen = new Set(versesList.map(v => v.verseKey))
      for (const fv of fetchedVerses) {
        if (!seen.has(fv.verseKey)) {
          versesList.push(fv)
          seen.add(fv.verseKey)
        }
      }
    } catch (e) {
      console.warn('Search API error, keeping chapter match:', e)
    }

    results.verses = versesList.slice(0, 5)

    if (user.value) {
      try {
        const noteRes = await $fetch<{ notes: NoteResult[] }>('/api/search/notes', { q: query.value })
        results.notes = (noteRes.notes || []).slice(0, 5)
      } catch {
        results.notes = []
      }
    }
  } catch (e) {
    console.error('Search error:', e)
  } finally {
    isLoading.value = false
  }
}

function navigateUp() {
  const total = results.verses.length + results.notes.length
  if (total === 0) return
  selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : total - 1
}

function navigateDown() {
  const total = results.verses.length + results.notes.length
  if (total === 0) return
  selectedIndex.value = selectedIndex.value < total - 1 ? selectedIndex.value + 1 : 0
}

function selectCurrent() {
  if (selectedIndex.value < results.verses.length) {
    selectVerse(results.verses[selectedIndex.value])
  } else {
    const noteIndex = selectedIndex.value - results.verses.length
    const note = results.notes[noteIndex]
    if (note) {
      selectNote(note)
    }
  }
}

function selectVerse(verse: VerseResult) {
  navigateTo(`/quran/verse/${verse.verseKey}`)
  close()
}

function selectNote(note: NoteResult) {
  navigateTo(`/notes/${note.id}`)
  close()
}

let debounceTimer: ReturnType<typeof setTimeout>

const keyHandler = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    toggle()
  }
}

watch(query, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(search, 200)
})

onMounted(async () => {
  try {
    const data = await $fetch<{ chapters: any[] }>('/api/chapters')
    chaptersData.value = data.chapters || []
  } catch(e) {}
  
  registerInputFocus(() => inputRef.value?.focus())
  window.addEventListener('keydown', keyHandler)
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyHandler)
})

// Reset results when opening
watch(isOpen, (val) => {
  if (val) {
    selectedIndex.value = 0
    results.verses = []
    results.notes = []
  }
})

defineExpose({ open, close, toggle })
</script>

<style scoped>
.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.15s ease;
}

.palette-enter-active > div:last-child,
.palette-leave-active > div:last-child {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from > div:last-child,
.palette-leave-to > div:last-child {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>
