<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-2xl mx-auto px-6 py-12">
      <NuxtLink 
        to="/quran" 
        class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 mb-8 group"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to Quran
      </NuxtLink>

      <header class="mb-10">
        <h1 class="text-3xl md:text-4xl font-light text-[#18181B] dark:text-stone-100 tracking-tight flex items-center gap-3">
          <UIcon name="i-heroicons-bookmark" class="w-8 h-8 text-amber-500" />
          Saved Verses
        </h1>
        <p v-if="qfConnection?.connected" class="text-[#52525B] dark:text-stone-400 mt-2">
          {{ bookmarkCount }} verses saved to your Quran Foundation account
        </p>
        <p v-else class="text-[#52525B] dark:text-stone-400 mt-2">
          Connect your Quran Foundation account to sync bookmarks across devices
        </p>
      </header>

      <!-- Not Connected -->
      <div v-if="connectionLoading" class="flex items-center justify-center py-16">
        <div class="flex flex-col items-center gap-4">
          <div class="w-10 h-10 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          <p class="text-[#52525B] dark:text-stone-400">Checking connection...</p>
        </div>
      </div>

      <div v-else-if="!qfConnection?.connected" class="text-center py-16 px-8 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem]">
        <div class="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-link" class="w-8 h-8 text-amber-500" />
        </div>
        <h2 class="text-xl font-medium text-[#18181B] dark:text-stone-100 mb-2">Connect to Quran Foundation</h2>
        <p class="text-[#52525B] dark:text-stone-400 mb-6 max-w-sm mx-auto">
          Link your account to save verses and access them from any device
        </p>
        <NuxtLink 
          to="/dashboard"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-full text-sm font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          Connect Account
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-else-if="isLoading" class="flex items-center justify-center py-16">
        <div class="flex flex-col items-center gap-4">
          <div class="w-10 h-10 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          <p class="text-[#52525B] dark:text-stone-400">Loading bookmarks...</p>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="bookmarks.length === 0" class="text-center py-16 px-8 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem]">
        <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-bookmark" class="w-8 h-8 text-stone-400" />
        </div>
        <h2 class="text-xl font-medium text-[#18181B] dark:text-stone-100 mb-2">No saved verses yet</h2>
        <p class="text-[#52525B] dark:text-stone-400 mb-6 max-w-sm mx-auto">
          Visit any verse and click the bookmark icon to save it here
        </p>
        <NuxtLink 
          to="/quran"
          class="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100 rounded-full text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
          Browse Quran
        </NuxtLink>
      </div>

      <!-- Bookmarks List -->
      <div v-else class="space-y-4">
        <div
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5 hover:border-amber-200/80 dark:hover:border-amber-800/60 transition-all cursor-pointer"
          @click="openPanel(bookmark)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <!-- Header: Chapter + Verse -->
              <div class="flex items-center gap-3 mb-3">
                <span class="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {{ bookmark.verseKey }}
                </span>
                <span class="text-sm font-medium text-[#18181B] dark:text-stone-100">
                  {{ getChapterName(bookmark.chapterNumber) }}
                </span>
                <span class="text-arabic text-lg text-stone-400 dark:text-stone-600">{{ chapterNames[bookmark.chapterNumber]?.arabic }}</span>
              </div>

              <!-- Arabic Preview -->
              <p v-if="bookmarkPreview(bookmark)?.arabic" class="text-lg font-arabic text-[#18181B] dark:text-stone-200 text-right mb-2 leading-relaxed">
                {{ truncateArabic(bookmarkPreview(bookmark).arabic, 80) }}
              </p>

              <!-- Translation Preview -->
              <p v-if="bookmarkPreview(bookmark)?.translation" class="text-sm text-[#52525B] dark:text-stone-400 mb-3 line-clamp-2">
                {{ truncateText(bookmarkPreview(bookmark).translation, 120) }}
              </p>

              <!-- Footer: Notes count + Date -->
              <div class="flex items-center gap-4 text-xs text-stone-400">
                <span v-if="bookmarkNotesCount(bookmark.verseKey) > 0" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                  {{ bookmarkNotesCount(bookmark.verseKey) }} note{{ bookmarkNotesCount(bookmark.verseKey) > 1 ? 's' : '' }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                  {{ formatDate(bookmark.createdAt) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click.stop="openPanel(bookmark)"
                class="px-3 py-1.5 bg-[#18181B] dark:bg-amber-600 text-white rounded-full text-xs font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors flex items-center gap-1"
              >
                View
                <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
              </button>
              <button
                @click.stop="handleRemove(bookmark.id)"
                class="p-2 text-stone-400 hover:text-red-500 transition-colors"
                title="Remove bookmark"
                :disabled="removingId === bookmark.id"
              >
                <UIcon 
                  :name="removingId === bookmark.id ? 'i-heroicons-minus-circle' : 'i-heroicons-trash'" 
                  class="w-5 h-5" 
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Preview -->
        <div v-if="loadingPreview" class="flex items-center justify-center py-4">
          <div class="w-5 h-5 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          <span class="ml-2 text-sm text-stone-400">Loading previews...</span>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore && bookmarks.length > 0" class="mt-8 text-center">
        <button
          @click="loadMore"
          class="px-6 py-2.5 bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100 rounded-full text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          Load more
        </button>
      </div>
    </div>

    <!-- Slide Panel -->
    <BookmarkSlidePanel
      v-if="selectedVerseKey"
      :is-open="panelOpen"
      :verse-key="selectedVerseKey"
      @close="closePanel"
    />
  </div>
</template>

<script setup lang="ts">
import { surahMeanings } from '~/data/surahMeanings'
import { useQfConnection } from '~/composables/useQfConnection'
import { useQfBookmarks } from '~/composables/useQfBookmarks'

definePageMeta({ layout: 'default' })

const { connection: qfConnection, loading: connectionLoading, fetchConnection } = useQfConnection()
const { bookmarks, isLoading, bookmarkCount, fetchBookmarks, removeBookmark, hasMore } = useQfBookmarks()

const removingId = ref<string | null>(null)
const panelOpen = ref(false)
const selectedVerseKey = ref('')

// Reactive preview cache — use object for Vue reactivity
const previewCache = reactive<Record<string, { arabic: string; translation: string }>>({})
const loadingPreview = ref(false)

// Notes count cache — also reactive
const notesCountCache = reactive<Record<string, number>>({})

// Panel state
const panelVerseKey = ref('')

// Chapter name cache from API
const chapterNames = ref<Record<number, { name: string; arabic: string }>>({})

async function loadChapterNames() {
  try {
    const data = await $fetch<{ chapters: any[] }>('/api/quran/chapters')
    const map: Record<number, { name: string; arabic: string }> = {}
    data.chapters.forEach(c => {
      map[c.id] = { name: c.name_simple, arabic: c.name_arabic }
    })
    chapterNames.value = map
  } catch (e) {
    // fallback: surahMeanings is used in getChapterName
  }
}

function openPanel(bookmark: { id: string; verseKey: string; chapterNumber: number; createdAt?: string }) {
  selectedVerseKey.value = bookmark.verseKey
  panelOpen.value = true
  
  // Preload preview if not cached
  if (!(bookmark.verseKey in previewCache)) {
    loadVersePreview(bookmark.verseKey)
  }
}

function closePanel() {
  panelOpen.value = false
  selectedVerseKey.value = ''
}

function bookmarkPreview(bookmark: { verseKey: string }): { arabic: string; translation: string } | null {
  return previewCache[bookmark.verseKey] || null
}

function bookmarkNotesCount(verseKey: string): number {
  return notesCountCache[verseKey] || 0
}

async function loadVersePreview(verseKey: string) {
  try {
    const data = await $fetch<{ arabic?: string; translation?: string; error?: string }>(
      `/api/quran/verse-preview?verse=${encodeURIComponent(verseKey)}`
    )
    if (!data.error && data.arabic) {
      previewCache[verseKey] = {
        arabic: data.arabic,
        translation: data.translation || ''
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

async function loadNotesCount(verseKey: string) {
  try {
    const data = await $fetch<{ reflections: any[] }>(
      `/api/notes/by-verse?verse=${encodeURIComponent(verseKey)}`
    )
    notesCountCache[verseKey] = data.reflections?.length || 0
  } catch (e) {
    notesCountCache[verseKey] = 0
  }
}

function truncateArabic(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

function getChapterName(chapterNumber: number): string {
  return chapterNames.value[chapterNumber]?.name || surahMeanings[chapterNumber] || `Chapter ${chapterNumber}`
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'recently'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString()
}

async function handleRemove(bookmarkId: string) {
  if (removingId.value) return
  removingId.value = bookmarkId
  
  try {
    await removeBookmark(bookmarkId)
  } finally {
    removingId.value = null
  }
}

function loadMore() {
  // Future: implement pagination
}

// Load previews for visible bookmarks
watch(bookmarks, (newBookmarks) => {
  if (newBookmarks.length > 0) {
    newBookmarks.forEach(bookmark => {
      loadVersePreview(bookmark.verseKey)
      loadNotesCount(bookmark.verseKey)
    })
  }
}, { immediate: true })

// Fetch connection on mount
onMounted(async () => {
  await loadChapterNames()
  await fetchConnection()
  if (qfConnection.value?.connected) {
    await fetchBookmarks()
  }
})
</script>