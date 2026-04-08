<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-2 text-center">Qayra</h1>
    <p class="text-center text-gray-500 mb-8">Quran Reflection System</p>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-emerald-600" />
      <p class="text-gray-500 mt-4">Loading Surah list...</p>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="red"
      variant="solid"
      class="mb-4"
      :title="'Error Loading Surah'"
      :description="error"
    />

    <!-- Surah Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard 
        v-for="surah in chapters" 
        :key="surah.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/verse/${surah.id}:1`)"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
            {{ surah.id }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">{{ surah.name_simple }}</h3>
            <p class="text-sm text-gray-500">{{ surah.translated_name }}</p>
            <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span>{{ surah.verses_count }} verses</span>
              <span>•</span>
              <span class="capitalize">{{ surah.revelation_place }}</span>
            </div>
          </div>
          <div class="text-2xl font-arabic text-emerald-600">
            {{ surah.name_arabic }}
          </div>
        </div>
      </UCard>
    </div>

    <!-- Note about Search -->
    <div class="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-information-circle" class="text-amber-600 text-xl mt-0.5" />
        <div>
          <p class="text-sm text-amber-800">
            <strong>Note:</strong> Direct search requires special API access approval from Quran Foundation. 
            For now, browse Surah by clicking above. Search feature will be added once approved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const chapters = ref<Array<{
  id: number
  name_simple: string
  name_complex: string
  name_arabic: string
  translated_name: string
  verses_count: number
  revelation_place: string
}>>([])

const loading = ref(true)
const error = ref('')

const { chapters: getChapters } = useQuran()

onMounted(async () => {
  try {
    chapters.value = await getChapters()
    if (chapters.value.length === 0) {
      error.value = 'Failed to load Surah list. Please refresh the page.'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load Surah list'
  } finally {
    loading.value = false
  }
})
</script>
