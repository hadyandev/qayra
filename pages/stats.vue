<template>
  <div class="min-h-[calc(100vh-5rem)]">
    <div class="max-w-6xl mx-auto px-6 py-16">
      <header class="mb-12">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 mb-6 group"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to home
        </NuxtLink>
        
        <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-4">
          Statistics
        </h1>
        <p class="text-xl text-[#52525B] dark:text-stone-400">
          Community progress at a glance
        </p>
      </header>

      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-32 bg-stone-200/50 dark:bg-stone-800/50 rounded-2xl animate-pulse"></div>
      </div>

      <div v-else class="space-y-12">
        <!-- Community Stats -->
        <section>
          <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-6">Community Progress</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
              <p class="text-4xl font-semibold text-amber-600 dark:text-amber-400 mb-2">{{ stats.totalNotes || 0 }}</p>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Total Notes</p>
            </div>
            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
              <p class="text-4xl font-semibold text-amber-600 dark:text-amber-400 mb-2">{{ stats.totalVerses || 0 }}</p>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Verses Cited</p>
            </div>
            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
              <p class="text-4xl font-semibold text-amber-600 dark:text-amber-400 mb-2">{{ stats.totalUsers || 0 }}</p>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Members</p>
            </div>
            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 text-center">
              <p class="text-4xl font-semibold text-amber-600 dark:text-amber-400 mb-2">{{ stats.totalChapters || 0 }}</p>
              <p class="text-sm text-[#52525B] dark:text-stone-400">Chapters</p>
            </div>
          </div>
        </section>

        <!-- Top Cited Verses -->
        <section>
          <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-6">Most Cited Verses</h2>
          <div class="space-y-3">
            <div 
              v-for="verse in topVerses" 
              :key="verse.key"
              class="flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl"
            >
              <NuxtLink 
                :to="`/quran/verse/${verse.key}`"
                class="font-mono text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              >
                @{{ verse.key }}
              </NuxtLink>
              <span class="text-sm text-[#52525B] dark:text-stone-400">
                {{ verse.count }} {{ verse.count === 1 ? 'note' : 'notes' }}
              </span>
            </div>
            <div v-if="topVerses.length === 0" class="text-center py-8 px-4 bg-stone-50 dark:bg-stone-800/30 rounded-xl text-[#52525B] dark:text-stone-400">
              No verses cited yet. Be the first!
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="text-center py-8">
          <NuxtLink 
            to="/login"
            class="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-medium transition-all duration-300 hover:scale-105"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            Join and start adding notes
          </NuxtLink>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const stats = ref({
  totalNotes: 0,
  totalVerses: 0,
  totalUsers: 0,
  totalChapters: 0
})
const topVerses = ref<Array<{ key: string; count: number }>>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch('/api/stats') as any
    stats.value = {
      totalNotes: data.totalNotes || 0,
      totalVerses: data.totalVerses || 0,
      totalUsers: 1,
      totalChapters: data.totalChapters || 0
    }

    const topData = await $fetch('/api/stats/top-verses') as any
    topVerses.value = topData.verses || []
  } catch (e) {
    console.error('Failed to load stats:', e)
  } finally {
    loading.value = false
  }
})
</script>