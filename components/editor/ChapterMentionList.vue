<template>
  <div class="chapter-mention-list bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden flex flex-col w-80 origin-top-left transition-all duration-200">
    <div class="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
      <p class="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wide">Select Chapter</p>
    </div>
    <div v-if="items.length" class="flex flex-col py-1 max-h-60 overflow-y-auto overscroll-contain">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        class="w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 ease-out focus:outline-none flex items-center gap-3"
        :class="{
          'bg-amber-50 dark:bg-amber-900/30 text-stone-900 dark:text-white': index === selectedIndex,
          'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50': index !== selectedIndex
        }"
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <span class="font-mono text-amber-600 dark:text-amber-500 font-medium text-xs w-8">{{ item.id }}</span>
        <span class="flex-1 truncate">{{ item.name_simple }}</span>
        <span class="text-arabic text-lg text-stone-400 dark:text-stone-600">{{ item.name_arabic }}</span>
      </button>
    </div>
    <div v-else class="px-4 py-6 text-sm text-stone-500 dark:text-stone-400 text-center">
      No chapters found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Chapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
}

const props = defineProps<{
  items: Chapter[]
  command: (item: Chapter) => void
}>()

const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    selectItem(selectedIndex.value)
    return true
  }

  return false
}

const selectItem = (index: number) => {
  const item = props.items[index]
  if (item) {
    props.command(item)
  }
}

defineExpose({
  onKeyDown
})
</script>

<style scoped>
.chapter-mention-list ::-webkit-scrollbar {
  width: 4px;
}
.chapter-mention-list ::-webkit-scrollbar-track {
  background: transparent;
}
.chapter-mention-list ::-webkit-scrollbar-thumb {
  @apply bg-stone-200 dark:bg-stone-700 rounded-full;
}
</style>
