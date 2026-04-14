<template>
  <div class="max-w-3xl mx-auto p-8 text-center space-y-8">
    <div>
      <h1 class="text-4xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">Qayra</h1>
      <p class="text-stone-600 dark:text-stone-400">
        A Quran-powered knowledge workspace — notes first, verses as references.
      </p>
    </div>

    <div class="grid sm:grid-cols-2 gap-4 text-left">
      <UCard class="hover:shadow-md transition-shadow cursor-pointer" @click="navigateTo('/notes')">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-document-text" class="text-2xl text-emerald-600 shrink-0" />
          <div>
            <h2 class="font-semibold text-lg">Notes & timeline</h2>
            <p class="text-sm text-stone-500 mt-1">Create notes, cite @verses, search your library.</p>
          </div>
        </div>
      </UCard>
      <UCard class="hover:shadow-md transition-shadow cursor-pointer" @click="navigateTo('/browse')">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-book-open" class="text-2xl text-emerald-600 shrink-0" />
          <div>
            <h2 class="font-semibold text-lg">Browse Quran</h2>
            <p class="text-sm text-stone-500 mt-1">Read ayat with translation (Quran Foundation).</p>
          </div>
        </div>
      </UCard>
    </div>

    <p class="text-sm text-stone-500">
      <span v-if="user">Signed in as {{ user.email }}</span>
      <NuxtLink v-else to="/login" class="text-emerald-600 hover:underline">Sign in</NuxtLink>
      <span v-if="!user"> to sync notes to your account.</span>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const user = useSupabaseUser()
</script>
