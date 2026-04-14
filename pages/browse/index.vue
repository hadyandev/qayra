<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-2 text-center">Browse Quran</h1>
    <p class="text-center text-stone-500 mb-8">Chapters via Quran Foundation API (prelive)</p>

    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-emerald-600" />
      <p class="text-stone-500 mt-4">Loading Surah list…</p>
    </div>

    <UAlert
      v-else-if="error"
      color="red"
      variant="solid"
      class="mb-4"
      title="Error loading chapters"
      :description="error"
    />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="surah in chapters"
        :key="surah.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/verse/${surah.id}:1`)"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 font-bold"
          >
            {{ surah.id }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-stone-900 dark:text-stone-100 truncate">{{ surah.name_simple }}</h3>
            <p class="text-sm text-stone-500">{{ surah.translated_name }}</p>
            <div class="flex items-center gap-2 mt-1 text-xs text-stone-400">
              <span>{{ surah.verses_count }} verses</span>
              <span>•</span>
              <span class="capitalize">{{ surah.revelation_place }}</span>
            </div>
          </div>
          <div class="text-2xl text-emerald-600 font-arabic">
            {{ surah.name_arabic }}
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const chapters = ref<
  Array<{
    id: number
    name_simple: string
    name_complex: string
    name_arabic: string
    translated_name: string
    verses_count: number
    revelation_place: string
  }>
>([])

const loading = ref(true)
const error = ref('')

const { chapters: getChapters } = useQuran()

onMounted(async () => {
  try {
    chapters.value = await getChapters()
    if (chapters.value.length === 0) {
      error.value = 'No chapters returned. Check QF credentials and API base in .env.'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load chapters'
  } finally {
    loading.value = false
  }
})
</script>
