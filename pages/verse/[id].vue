<template>
  <div class="max-w-4xl mx-auto p-6">
    <NuxtLink to="/browse" class="text-emerald-600 hover:text-emerald-800 mb-4 inline-block">
      ← Back to chapters
    </NuxtLink>

    <h1 class="text-4xl font-bold text-center mb-2">{{ id }}</h1>
    <p class="text-center text-stone-500 mb-8">Chapter:Verse</p>

    <div v-if="loading" class="text-center py-12">
      <p class="text-stone-600">Loading verse…</p>
    </div>

    <UAlert
      v-else-if="error"
      color="red"
      variant="solid"
      class="mb-6"
      title="Error loading verse"
      :description="error"
    />

    <div v-else-if="verseData" class="space-y-6">
      <UCard class="bg-emerald-50 dark:bg-emerald-950/30">
        <p class="text-3xl font-arabic text-emerald-800 dark:text-emerald-200 text-center leading-relaxed">
          {{ verseData.text }}
        </p>
      </UCard>

      <UCard v-if="translation" class="bg-white dark:bg-stone-900">
        <h3 class="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2">Translation</h3>
        <p class="text-lg text-stone-800 dark:text-stone-200 leading-relaxed">
          {{ translation }}
        </p>
      </UCard>

      <div class="flex flex-wrap gap-3">
        <UButton v-if="user" :to="`/notes/new?verse=${encodeURIComponent(id)}`" color="emerald">
          New note citing this verse
        </UButton>
        <UButton v-else to="/login" variant="soft">Sign in to add notes</UButton>
      </div>
    </div>

    <div v-else class="text-center py-12 text-stone-500">Verse not found.</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id = route.params.id as string

const verseData = ref<{
  text: string
  translations?: { text: string }[]
} | null>(null)
const translation = ref('')
const loading = ref(true)
const error = ref('')

const { verse } = useQuran()
const user = useSupabaseUser()

onMounted(async () => {
  try {
    const result = await verse(id)
    if (result) {
      verseData.value = result
      if (result.translations?.length) {
        translation.value = result.translations[0].text
      }
    } else {
      error.value = 'Verse not found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load verse'
  } finally {
    loading.value = false
  }
})
</script>
