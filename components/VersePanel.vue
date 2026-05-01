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
        <div class="sticky top-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800 px-6 py-4 z-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span class="font-mono text-lg text-amber-600 dark:text-amber-500 font-semibold">@{{ verseKey }}</span>
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

        <div class="p-6">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-8 h-8 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          </div>

          <div v-else-if="verse && !verse.error" class="space-y-6">
            <div class="text-center mb-8">
              <h2 class="text-xl font-semibold text-[#18181B] dark:text-stone-100">{{ verse.verse.chapter_name }}</h2>
              <p class="text-sm text-stone-500 dark:text-stone-400">Verse {{ verse.verse.verse_number }}</p>
            </div>

            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 ring-1 ring-stone-200/30 dark:ring-stone-800/30 shadow-sm">
              <p class="text-right text-3xl font-arabic text-[#18181B] dark:text-stone-100 leading-loose mb-6" dir="rtl">
                {{ verse.verse.text_uthmani }}
              </p>
              <p class="text-lg text-[#52525B] dark:text-stone-300 leading-relaxed font-serif">
                {{ verse.verse.translations?.[0]?.text || '' }}
              </p>
            </div>

            <div v-if="verse.verse.tafsir" class="bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-2xl p-6 shadow-sm">
              <h3 class="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-3">Tafsir ({{ verse.verse.tafsir.resourceName }})</h3>
              <div class="prose dark:prose-invert prose-sm max-w-none text-stone-600 dark:text-stone-400" v-html="verse.verse.tafsir.text"></div>
            </div>

            <div class="flex justify-center mt-8">
              <NuxtLink 
                :to="`/verse/${verseKey}`"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-xl font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors"
                @click="$emit('close')"
              >
                Go to full verse page
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-stone-500 dark:text-stone-400">Verse not found.</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  verseKey: string
}>()

defineEmits<{
  close: []
}>()

const loading = ref(true)
const verse = ref<any>(null)

async function loadVerse() {
  if (!props.verseKey) return
  
  loading.value = true
  try {
    const data = await $fetch<any>(`/api/quran/verse?key=${encodeURIComponent(props.verseKey)}`)
    verse.value = data
  } catch (e) {
    console.error('Failed to load verse:', e)
    verse.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.verseKey, (newKey) => {
  if (newKey) {
    loadVerse()
  }
}, { immediate: true })
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
