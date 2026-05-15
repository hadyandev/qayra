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
                <span class="text-sm text-stone-400 ml-2">
                  {{ reflections.length }} {{ reflections.length === 1 ? 'note' : 'notes' }}
                </span>
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

          <div v-else-if="reflections.length > 0" class="space-y-3">
            <div
              v-for="(reflection, idx) in reflections"
              :key="idx"
              class="relative"
            >
              <div class="flex items-start gap-3">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
                <div class="ml-4 pl-5 py-4 pr-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-xl border border-amber-100 dark:border-amber-800/50 w-full">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-heroicons-chat-bubble-left" class="w-4 h-4 text-amber-500" />
                      <span class="text-xs font-medium text-amber-600 dark:text-amber-400">From:</span>
                      <NuxtLink 
                        :to="`/notes/${reflection.noteId}`"
                        class="text-sm font-medium text-[#18181B] dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                      >
                        {{ reflection.noteTitle || 'Untitled Note' }}
                      </NuxtLink>
                    </div>
                    <span class="text-xs text-stone-400 flex items-center gap-1">
                      <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                      {{ formatDate(reflection.created_at) }}
                    </span>
                  </div>
                  <p class="text-[#18181B] dark:text-stone-200 leading-relaxed">
                    {{ reflection.reflection }}
                  </p>
                  <div class="flex items-center justify-between mt-3 pt-2 border-t border-amber-100 dark:border-amber-800/50">
                    <div class="flex items-center gap-3 text-xs text-stone-400">
                      <span v-if="reflection.source" class="flex items-center gap-1">
                        <UIcon name="i-heroicons-bookmark" class="w-3 h-3" />
                        {{ reflection.source }}
                      </span>
                      <span v-if="reflection.speaker" class="flex items-center gap-1">
                        <UIcon name="i-heroicons-user" class="w-3 h-3" />
                        {{ reflection.speaker }}
                      </span>
                    </div>
                    <div v-if="reflection.tags?.length" class="flex flex-wrap gap-1">
                      <span 
                        v-for="tag in reflection.tags.slice(0, 3)" 
                        :key="tag"
                        class="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs rounded-full"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <div class="w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-6">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-10 h-10 text-stone-400" />
            </div>
            <h3 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-2">No notes yet</h3>
            <p class="text-sm text-[#52525B] dark:text-stone-400 mb-6">Be the first to add a note on this verse!</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <NuxtLink 
                :to="`/notes/new?verse=${encodeURIComponent(verseKey)}`"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-xl font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors"
              >
                <UIcon name="i-heroicons-plus" class="w-5 h-5" />
                Add note
              </NuxtLink>
              <NuxtLink 
                :to="`/quran/verse/${verseKey}`"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100 rounded-xl font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <UIcon name="i-heroicons-book-open" class="w-5 h-5" />
                View verse
              </NuxtLink>
            </div>
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
const reflections = ref<Array<{
  noteId: string
  noteTitle: string | null
  reflection: string
  source: string | null
  speaker: string | null
  tags: string[]
  created_at: string
}>>([])

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

async function loadReflections() {
  if (!props.verseKey) return
  
  loading.value = true
  try {
    const timestamp = Date.now()
    const data = await $fetch<{ reflections: typeof reflections.value }>(`/api/notes/by-verse?verse=${encodeURIComponent(props.verseKey)}&_=${timestamp}`)
    console.log('Panel loaded reflections:', data.reflections?.length)
    reflections.value = data.reflections || []
  } catch (e) {
    console.error('Failed to load reflections:', e)
    reflections.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.verseKey, (newKey) => {
  if (newKey) {
    loadReflections()
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
