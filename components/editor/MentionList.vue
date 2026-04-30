<template>
  <div class="mention-list bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden flex flex-col w-96 origin-top-left transition-all duration-200">
    <div class="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
      <div class="flex items-center gap-2 mb-2">
        <span 
          class="px-2 py-0.5 text-xs rounded-full font-medium"
          :class="isVerseMode 
            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' 
            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'"
        >
          {{ isVerseMode ? 'Verse' : 'Chapter' }}
        </span>
        <span v-if="isVerseMode && chapterInfo" class="text-sm text-stone-500 dark:text-stone-400">
          {{ chapterInfo.name_simple }}
        </span>
      </div>
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="isVerseMode ? 'Search verse number...' : 'Search chapter name or number...'"
        class="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        @keydown="handleSearchKeydown"
      />
    </div>
    <div v-if="displayItems.length" class="flex flex-col py-1 max-h-72 overflow-y-auto overscroll-contain scroll-smooth">
      <button
        v-for="(item, index) in displayItems"
        :key="itemKey(item, index)"
        class="w-full text-left px-4 py-2 text-sm transition-colors duration-100 ease-out focus:outline-none flex items-start gap-3"
        :class="{
          'selected-item bg-amber-50 dark:bg-amber-900/30 text-stone-900 dark:text-white': index === selectedIndex,
          'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50': index !== selectedIndex
        }"
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <span class="font-mono text-amber-600 dark:text-amber-500 font-medium text-xs w-12 shrink-0 pt-0.5">
          {{ isVerseMode ? item.key : `${item.id}:` }}
        </span>
        <div class="flex-1 min-w-0">
          <template v-if="isVerseMode">
            <p v-if="item.text" class="text-arabic text-right text-sm leading-relaxed text-stone-800 dark:text-stone-200 line-clamp-2">
              {{ item.text }}
            </p>
            <p v-if="item.translation" class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1 leading-snug">
              {{ item.translation }}
            </p>
            <span v-else class="text-xs text-stone-400">Verse {{ item.verse_number }}</span>
          </template>
          <template v-else>
            <div class="flex items-center gap-3 w-full">
              <span class="flex-1 truncate text-left">{{ item.name_simple }}</span>
              <span v-if="item.name_arabic" class="text-arabic text-lg text-stone-400 dark:text-stone-600">{{ item.name_arabic }}</span>
              <span class="text-xs text-stone-400 shrink-0">({{ item.verse_count }})</span>
            </div>
          </template>
        </div>
      </button>
    </div>
    <div v-else class="px-4 py-6 text-sm text-stone-500 dark:text-stone-400 text-center">
      {{ isVerseMode ? 'No verses found' : 'No chapters found' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from 'vue'

interface ChapterItem {
  id: number
  name_simple: string
  name_arabic: string
  verse_count: number
  transliteration?: string
}

interface VerseItem {
  chapter_id: number
  verse_number: number
  key: string
  text?: string
  translation?: string
  chapter_name?: string
}

const props = defineProps<{
  items: (ChapterItem | VerseItem)[]
  command: (item: any) => void
}>()

const selectedIndex = ref(0)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const isReady = ref(false)

watch(() => props.items, (newItems) => {
  selectedIndex.value = 0
  searchQuery.value = ''
}, { deep: true })

onMounted(async () => {
  await nextTick()
  isReady.value = true
  searchInputRef.value?.focus()
})

watch(isReady, async (ready) => {
  if (ready) {
    await nextTick()
    searchInputRef.value?.focus()
  }
})

const isVerseMode = computed(() => {
  if (props.items.length === 0) return false
  const first = props.items[0]
  return 'verse_number' in first || 'chapter_id' in first
})

const chapterInfo = computed(() => {
  if (!isVerseMode.value || props.items.length === 0) return null
  const first = props.items[0] as VerseItem
  return { 
    name_simple: (first as any).chapter_name || `Chapter ${first.chapter_id}`,
    chapter_id: first.chapter_id
  }
})

const itemKey = (item: ChapterItem | VerseItem, index: number): string => {
  if ('verse_number' in item) {
    return item.key
  }
  return item.id.toString()
}

const displayItems = computed(() => {
  if (!props.items || props.items.length === 0) return []
  
  const q = searchQuery.value.toLowerCase().trim()
  
  if (isVerseMode.value) {
    const verses = props.items as VerseItem[]
    if (!q) return verses.slice(0, 10)
    return verses.filter(v => {
      const verseNum = v.key.split(':')[1]
      return verseNum.startsWith(q)
    }).slice(0, 10)
  }
  
  const chapters = props.items as ChapterItem[]
  if (!q) return chapters.slice(0, 10)
  
  return chapters.filter(c => {
    const chapterNum = c.id.toString()
    const matchesNumber = chapterNum.startsWith(q)
    const matchesName = c.name_simple?.toLowerCase().includes(q)
    const matchesArabic = c.name_arabic?.includes(searchQuery.value)
    const matchesTransliteration = c.transliteration?.toLowerCase().includes(q)
    return matchesNumber || matchesName || matchesArabic || matchesTransliteration
  }).slice(0, 10)
})

watch(searchQuery, () => {
  selectedIndex.value = 0
})

watch(selectedIndex, () => {
  nextTick(() => {
    const container = document.querySelector('.mention-list')
    const selectedItem = container?.querySelector('.selected-item')
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
})

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + displayItems.value.length - 1) % Math.max(displayItems.value.length, 1)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % Math.max(displayItems.value.length, 1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (displayItems.value.length > 0) {
      selectItem(selectedIndex.value)
    }
    return
  }

  if (event.key === 'Escape') {
    event.stopPropagation()
    return
  }
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + displayItems.value.length - 1) % Math.max(displayItems.value.length, 1)
    return true
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % Math.max(displayItems.value.length, 1)
    return true
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (displayItems.value.length > 0) {
      selectItem(selectedIndex.value)
    }
    return true
  }

  if (event.key === 'Escape') {
    return false
  }

  return false
}

const selectItem = (index: number) => {
  const item = displayItems.value[index]
  if (item) {
    props.command(item)
  }
}

defineExpose({
  onKeyDown
})
</script>

<style scoped>
.mention-list ::-webkit-scrollbar {
  width: 4px;
}
.mention-list ::-webkit-scrollbar-track {
  background: transparent;
}
.mention-list ::-webkit-scrollbar-thumb {
  @apply bg-stone-200 dark:bg-stone-700 rounded-full;
}
</style>
