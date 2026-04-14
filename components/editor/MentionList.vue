<template>
  <div class="mention-list bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden flex flex-col w-72 origin-top-left transition-all duration-200">
    <div v-if="items.length" class="flex flex-col py-1 max-h-60 overflow-y-auto overscroll-contain">
      <button
        v-for="(item, index) in items"
        :key="index"
        class="w-full text-left px-4 py-2 text-sm transition-colors duration-100 ease-out focus:outline-none"
        :class="{
          'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white': index === selectedIndex,
          'text-stone-600 dark:text-stone-400': index !== selectedIndex
        }"
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <div class="flex items-center gap-2">
          <span class="font-mono text-amber-600 dark:text-amber-500 font-medium text-xs">{{ item.verse_key }}</span>
          <span class="truncate block w-full">{{ item.text_imlaei_simple || 'Loading...' }}</span>
        </div>
      </button>
    </div>
    <div v-else class="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">
      No verses found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  items: any[]
  command: (item: any) => void
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
    props.command({ id: item.verse_key, label: item.verse_key })
  }
}

// Expose the keydown handler so tiptap can forward events to it
defineExpose({
  onKeyDown
})
</script>

<style scoped>
/* Scrollbar styling for premium feel */
.mention-list ::-webkit-scrollbar {
  width: 4px;
}
.mention-list ::-webkit-scrollbar-track {
  background: transparent;
}
.mention-list ::-webkit-scrollbar-thumb {
  @apply bg-stone-200 dark:bg-stone-800 rounded-full;
}
</style>
