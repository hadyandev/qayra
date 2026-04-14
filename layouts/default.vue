<template>
  <div class="min-h-screen bg-stone-50 dark:bg-stone-950">
    <header class="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          Qayra
        </NuxtLink>
        <nav class="flex items-center gap-3 text-sm">
          <NuxtLink to="/notes" class="text-stone-600 hover:text-emerald-700 dark:text-stone-300">Notes</NuxtLink>
          <NuxtLink to="/browse" class="text-stone-600 hover:text-emerald-700 dark:text-stone-300">Browse Quran</NuxtLink>
          <UButton
            size="xs"
            variant="ghost"
            :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            @click="toggleTheme"
            aria-label="Toggle theme"
          />
          <NuxtLink v-if="!user" to="/login" class="text-stone-600 hover:text-emerald-700">Sign in</NuxtLink>
          <UButton v-else size="xs" variant="ghost" @click="signOut">Sign out</UButton>
        </nav>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()
const colorMode = useColorMode()

async function signOut() {
  await client.auth.signOut()
  navigateTo('/')
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
