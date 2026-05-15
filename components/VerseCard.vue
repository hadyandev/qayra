<template>
  <component 
    :is="interactive ? NuxtLink : 'div'"
    :to="interactive ? `/quran/verse/${verseKey}` : undefined"
    class="group p-4 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-xl transition-colors"
    :class="[
      interactive ? 'hover:border-amber-200/60 dark:hover:border-amber-700/50 cursor-pointer' : '',
      highlight ? 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200/40 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700/50' : ''
    ]"
  >
    <div class="flex items-start gap-3">
      <span class="font-mono text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded shrink-0">@{{ verseKey }}</span>
      <div class="flex-1 min-w-0">
        <p v-if="topic" class="text-xs text-amber-500 dark:text-amber-400 mb-1">{{ topic }}</p>
        <p v-if="chapterName" class="text-sm font-medium text-[#18181B] dark:text-stone-100 line-clamp-1 mb-1">{{ chapterName }}</p>
        <p class="text-sm text-[#52525B] dark:text-stone-400 line-clamp-2 transition-colors" :class="{ 'group-hover:text-[#18181B] dark:group-hover:text-stone-200': interactive }">
          {{ translation || text || 'Tap to view details' }}
        </p>
        <p v-if="text && translation" class="text-lg font-arabic text-[#18181B] dark:text-stone-100 text-right mt-2 line-clamp-2" dir="rtl">
          {{ text }}
        </p>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'

const NuxtLink = resolveComponent('NuxtLink')

defineProps<{
  verseKey: string
  text?: string
  translation?: string
  chapterName?: string
  topic?: string
  interactive?: boolean
  highlight?: boolean
}>()
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
