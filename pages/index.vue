<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <header class="text-center mb-20">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-sm text-[#52525B] dark:text-stone-400 mb-8">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
          <span>Note-first Quran workspace</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-6 leading-tight">
          Your second brain,<br />
          <span class="text-amber-600 dark:text-amber-500">grounded in the Quran</span>
        </h1>
        
        <p class="text-xl text-[#52525B] dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Capture reflections, khutbahs, and personal studies. Link them to verses. Build your Islamic knowledge base.
        </p>

        <div v-if="user" class="mt-10 flex items-center justify-center gap-4">
          <NuxtLink 
            to="/notes"
            class="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-full font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
          >
            <span>Go to notes</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </NuxtLink>
          <NuxtLink 
            to="/notes/new"
            class="inline-flex items-center gap-2 px-6 py-3 text-[#18181B] dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full font-medium transition-all duration-300"
          >
            New reflection
          </NuxtLink>
        </div>

        <div v-else class="mt-10">
          <NuxtLink 
            to="/login"
            class="inline-flex items-center gap-2 px-8 py-4 bg-[#18181B] dark:bg-amber-600 text-white rounded-full font-medium text-lg hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
          >
            <span>Start your workspace</span>
            <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        <NuxtLink
          to="/notes"
          class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.75rem] p-8 md:p-10 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200/60 dark:hover:border-amber-700/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors duration-300">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-[#52525B] dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-semibold text-[#18181B] dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Notes & timeline
              </h2>
              <p class="text-[#52525B] dark:text-stone-400">
                Create reflections, cite verses with @surah:ayah, and search your knowledge base.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium">
            <span>Explore your notes</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/browse"
          class="group bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.75rem] p-8 md:p-10 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200/60 dark:hover:border-amber-700/50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors duration-300">
              <UIcon name="i-heroicons-book-open" class="w-6 h-6 text-[#52525B] dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-semibold text-[#18181B] dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Browse Quran
              </h2>
              <p class="text-[#52525B] dark:text-stone-400">
                Read 114 chapters with translations. Powered by Quran Foundation API.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium">
            <span>Open the Quran</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </NuxtLink>
      </section>

      <section class="text-center">
        <p class="text-[#52525B] dark:text-stone-400">
          <span v-if="user">Signed in as {{ user.email }}</span>
          <NuxtLink v-else to="/login" class="text-amber-600 dark:text-amber-500 hover:text-amber-700 transition-colors">
            Sign in
          </NuxtLink>
          <span v-if="!user"> to sync notes to your account.</span>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const user = useSupabaseUser()
</script>
