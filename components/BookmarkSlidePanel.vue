<template>
  <Teleport to="body">
    <div 
      class="fixed inset-0 z-50 flex justify-end"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('close')"></div>
      
      <div 
        class="relative w-full max-w-lg bg-[#FAF9F6] dark:bg-stone-950 h-full overflow-y-auto shadow-2xl animate-slide-in"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800 px-6 py-4 z-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-bookmark" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span class="font-mono text-lg text-amber-600 dark:text-amber-500 font-semibold">@{{ verseKey }}</span>
                <p class="text-xs text-stone-500 dark:text-stone-400">{{ chapterName }}</p>
              </div>
            </div>
            <button 
              @click="$emit('close')"
              class="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-stone-500" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-8 h-8 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <p class="text-stone-500 dark:text-stone-400">{{ error }}</p>
            <button 
              @click="loadVersePreview"
              class="mt-4 text-amber-600 dark:text-amber-400 hover:underline"
            >
              Try again
            </button>
          </div>

          <template v-else-if="preview">
            <!-- Arabic + Translation Card -->
            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 ring-1 ring-stone-200/30 dark:ring-stone-800/30 shadow-sm mb-6">
              <p class="text-right text-3xl font-arabic text-[#18181B] dark:text-stone-100 leading-loose mb-6" dir="rtl">
                {{ preview.arabic }}
              </p>
              <p class="text-lg text-[#52525B] dark:text-stone-300 leading-relaxed font-serif">
                {{ preview.translation }}
              </p>
            </div>

            <!-- Tafsir Section -->
            <div v-if="preview.tafsir" class="bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-2xl p-6 shadow-sm mb-6">
              <h3 class="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-3">
                Tafsir <span v-if="preview.tafsirSource">({{ preview.tafsirSource }})</span>
              </h3>
              <div class="prose dark:prose-invert prose-sm max-w-none text-stone-600 dark:text-stone-400">
                <p>{{ tafsirPreview }}</p>
              </div>
              <button 
                v-if="preview.tafsir.length > 200"
                @click="showFullTafsir = !showFullTafsir"
                class="mt-3 text-sm text-amber-600 dark:text-amber-400 hover:underline"
              >
                {{ showFullTafsir ? 'Show less' : 'Read full tafsir...' }}
              </button>
            </div>

            <!-- Notes Section -->
            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider">
                  My Notes ({{ notes.length }})
                </h3>
              </div>

              <!-- Notes Loading -->
              <div v-if="notesLoading" class="flex items-center justify-center py-8">
                <div class="w-6 h-6 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
              </div>

              <!-- Notes List -->
              <div v-else-if="notes.length > 0" class="space-y-4">
                <div 
                  v-for="note in notes" 
                  :key="note.noteId"
                  class="bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl p-4 hover:border-amber-200/60 dark:hover:border-amber-700/60 transition-colors cursor-pointer"
                  @click="openNote(note.noteId)"
                >
                  <div v-if="note.noteTitle" class="text-sm font-medium text-[#18181B] dark:text-stone-100 mb-1">
                    {{ note.noteTitle }}
                  </div>
                  <p class="text-sm text-[#52525B] dark:text-stone-400">
                    "{{ note.reflection }}"
                  </p>
                  <div class="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-700/50">
                    <span class="text-xs text-stone-400">{{ formatDate(note.created_at) }}</span>
                    <span class="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      View
                      <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              <!-- No Notes -->
              <div v-else class="text-center py-8">
                <p class="text-sm text-stone-500 dark:text-stone-400 mb-4">No notes yet on this verse</p>
                <NuxtLink
                  :to="`/notes/new?verse=${encodeURIComponent(verseKey)}`"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[#18181B] dark:bg-amber-600 text-white rounded-full text-sm font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors"
                >
                  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                  Add note
                </NuxtLink>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-center mt-8">
              <NuxtLink 
                :to="`/quran/verse/${verseKey}`"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-xl font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors"
                @click="$emit('close')"
              >
                Go to full verse page
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </template>

          <div v-else class="text-center py-12">
            <p class="text-stone-500 dark:text-stone-400">No preview available.</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { surahMeanings } from '~/data/surahMeanings'

interface Note {
  noteId: string
  noteTitle: string | null
  reflection: string
  source: string | null
  speaker: string | null
  tags: string[]
  created_at: string
}

interface VersePreview {
  verseKey: string
  arabic: string
  translation: string
  tafsir: string
  tafsirSource: string
}

const props = defineProps<{
  isOpen: boolean
  verseKey: string
}>()

defineEmits<{
  close: []
}>()

const chapterName = computed(() => {
  const [chapter] = props.verseKey.split(':').map(Number)
  return surahMeanings[chapter] || `Chapter ${chapter}`
})

const loading = ref(false)
const error = ref<string | null>(null)
const preview = ref<VersePreview | null>(null)
const showFullTafsir = ref(false)

const notesLoading = ref(false)
const notes = ref<Note[]>([])

const tafsirPreview = computed(() => {
  if (!preview.value?.tafsir) return ''
  if (showFullTafsir.value) return preview.value.tafsir
  return preview.value.tafsir.slice(0, 300) + (preview.value.tafsir.length > 300 ? '...' : '')
})

async function loadVersePreview() {
  if (!props.verseKey) return
  
  loading.value = true
  error.value = null
  
  try {
    const data = await $fetch<{ 
      arabic?: string
      translation?: string
      tafsir?: string
      tafsirSource?: string
      error?: string 
    }>(`/api/quran/verse-preview?verse=${encodeURIComponent(props.verseKey)}`)
    
    if (data.error) {
      error.value = data.error
    } else {
      preview.value = {
        verseKey: props.verseKey,
        arabic: data.arabic || '',
        translation: data.translation || '',
        tafsir: data.tafsir || '',
        tafsirSource: data.tafsirSource || ''
      }
    }
  } catch (e: any) {
    error.value = 'Failed to load verse'
  } finally {
    loading.value = false
  }
}

async function loadNotes() {
  if (!props.verseKey) return
  
  notesLoading.value = true
  
  try {
    const data = await $fetch<{ reflections: Note[] }>(`/api/notes/by-verse?verse=${encodeURIComponent(props.verseKey)}`)
    notes.value = data.reflections || []
  } catch (e) {
    notes.value = []
  } finally {
    notesLoading.value = false
  }
}

function openNote(noteId: string) {
  navigateTo(`/notes/${noteId}`)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString()
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.verseKey) {
    loadVersePreview()
    loadNotes()
  } else {
    preview.value = null
    notes.value = []
    showFullTafsir.value = false
  }
})

watch(() => props.verseKey, (key) => {
  if (props.isOpen && key) {
    loadVersePreview()
    loadNotes()
  }
})
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>