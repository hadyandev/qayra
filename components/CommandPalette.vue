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
                    <p class="text-sm font-medium text-[#18181B] dark:text-stone-100 line-clamp-1">{{ note.title || 'Untitled Note' }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span v-if="note.source" class="text-xs text-stone-500 dark:text-stone-400">{{ note.source }}</span>
                      <span v-if="note.note_date" class="text-xs text-stone-400 dark:text-stone-500">{{ note.note_date }}</span>
                    </div>
                  </div>
                </button>
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
type VerseResult = {
  verseKey: string
  text: string
  surahName?: string
}

type NoteResult = {
  id: string
  title: string | null
  source: string | null
  note_date: string | null
}

const isOpen = ref(false)
const query = ref('')
const isLoading = ref(false)
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const results = reactive({
  verses: [] as VerseResult[],
  notes: [] as NoteResult[]
})

const shortcuts = [
  { label: 'Browse Quran', description: 'Explore all 114 chapters', to: '/browse', icon: 'i-heroicons-book-open' },
{ label: 'My Notes', description: 'View your notes', to: '/notes', icon: 'i-heroicons-document-text' },

  { label: 'Create Note', description: 'Start writing a new note', to: '/notes/new', icon: 'i-heroicons-plus' },
]

function open() {
  isOpen.value = true
  query.value = ''
  selectedIndex.value = 0
  results.verses = []
  results.notes = []
  nextTick(() => inputRef.value?.focus())
}

function close() {
  isOpen.value = false
}

async function search() {
  if (!query.value.trim()) {
    results.verses = []
    results.notes = []
    return
  }

  isLoading.value = true
  selectedIndex.value = 0

  try {
    const [verseRes, noteRes] = await Promise.all([
      $fetch<{ results: any[] }>('/api/quran/search', { q: query.value }),
      $fetch<{ notes: NoteResult[] }>('/api/search/notes', { q: query.value })
    ])

    results.verses = (verseRes.results || []).slice(0, 5).map((r: any) => ({
      verseKey: r.verseKey || r.verse_key || '',
      text: r.text || r.translatedText || r.content || '',
      surahName: r.surahName || r.surah_name || ''
    }))

    results.notes = (noteRes.notes || []).slice(0, 5)
  } catch (e) {
    console.error('Search error:', e)
    results.verses = []
    results.notes = []
  } finally {
    isLoading.value = false
  }
}

function navigateUp() {
  const total = results.verses.length + results.notes.length
  selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : total - 1
}

function navigateDown() {
  const total = results.verses.length + results.notes.length
  selectedIndex.value = selectedIndex.value < total - 1 ? selectedIndex.value + 1 : 0
}

function selectCurrent() {
  if (selectedIndex.value < results.verses.length) {
    selectVerse(results.verses[selectedIndex.value])
  } else {
    const noteIndex = selectedIndex.value - results.verses.length
    selectNote(results.notes[noteIndex])
  }
}

function selectVerse(verse: VerseResult) {
  navigateTo(`/verse/${verse.verseKey}`)
  close()
}

function selectNote(note: NoteResult) {
  navigateTo(`/notes/${note.id}`)
  close()
}

let debounceTimer: ReturnType<typeof setTimeout>

watch(query, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(search, 200)
})

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      isOpen.value ? close() : open()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

defineExpose({ open, close })
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
