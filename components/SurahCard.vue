<template>
  <NuxtLink
    :to="`/verse/${surah.id}:1`"
    class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-amber-200/60 dark:hover:border-amber-700/50 transition-all duration-300"
  >
    <div class="flex items-start gap-4">
      <div class="relative">
        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 transition-transform duration-300 group-hover:scale-105"
          :class="isFeatured 
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' 
            : 'bg-stone-100 dark:bg-stone-800 text-[#52525B] dark:text-stone-400'"
        >
          {{ surah.id }}
        </div>
        <div 
          v-if="surah.hasReflection"
          class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
          title="You've cited verses in this surah"
        >
          <UIcon name="i-heroicons-check" class="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-[#18181B] dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              {{ surah.name_simple }}
            </h3>
            <p class="text-xs text-[#52525B] dark:text-stone-400">{{ surah.translated_name }}</p>
          </div>
          <div class="text-2xl font-arabic text-[#18181B] dark:text-stone-200 opacity-60 group-hover:opacity-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all">
            {{ surah.name_arabic }}
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2 text-xs text-[#52525B] dark:text-stone-500">
          <span class="px-2 py-0.5 bg-stone-50 dark:bg-stone-800 rounded-full">
            {{ surah.verses_count }} verses
          </span>
          <span v-if="surah.revelation_place" class="px-2 py-0.5 bg-stone-50 dark:bg-stone-800 rounded-full capitalize">
            {{ surah.revelation_place }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  surah: {
    id: number
    name_simple: string
    name_arabic: string
    translated_name: string
    verses_count: number
    revelation_place: string
    hasReflection?: boolean
  }
}>()

const featuredSurahs = new Set([1, 2, 36, 55, 56, 67])

const isFeatured = computed(() => featuredSurahs.has(props.surah.id))
</script>
