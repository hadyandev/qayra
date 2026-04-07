<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8 text-center">Qayra — Quran Reflection</h1>
    
    <div class="flex gap-2 mb-8">
      <UInput 
        v-model="q" 
        placeholder="Search Quran (e.g., 'mercy', 'prayer')..." 
        class="flex-1"
        @keyup.enter="run"
      />
      <UButton 
        @click="run" 
        :loading="loading"
        :disabled="loading || !q.trim()"
      >
        {{ loading ? 'Searching...' : 'Search' }}
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="red"
      variant="solid"
      class="mb-4"
      :title="'Search Error'"
      :description="error"
    />

    <div v-if="results.length > 0" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-600">{{ results.length }} Results</h2>
      
      <UCard v-for="r in results" :key="r.id" class="hover:shadow-lg transition-shadow">
        <NuxtLink :to="`/verse/${r.verse_key}`" class="block">
          <div class="flex items-start gap-4">
            <span class="text-2xl font-arabic text-emerald-600">{{ r.verse_key }}</span>
            <div class="flex-1">
              <p class="text-gray-800 line-clamp-2">{{ r.text }}</p>
              <p class="text-sm text-gray-500 mt-1">Click to reflect →</p>
            </div>
          </div>
        </NuxtLink>
      </UCard>
    </div>

    <div v-else-if="searched && !loading" class="text-center text-gray-500 py-8">
      No results found. Try a different search term.
    </div>

    <div v-if="!searched" class="text-center text-gray-400 py-12">
      <p class="mb-2">Enter a word or phrase to search the Quran</p>
      <p class="text-sm">Try: mercy, prayer, guidance, light, patience</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const q = ref('')
const results = ref<Array<{id: number, verse_key: string, text: string}>>([])
const loading = ref(false)
const error = ref('')
const searched = ref(false)

const { search } = useQuran()

const run = async () => {
  if (!q.value.trim()) return
  
  loading.value = true
  error.value = ''
  searched.value = true
  
  try {
    results.value = await search(q.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to search. Please try again.'
    results.value = []
  } finally {
    loading.value = false
  }
}
</script>
