<template>
  <div class="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 font-sans transition-colors duration-500">
    <header class="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav class="max-w-5xl mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/60 dark:border-stone-800/60 rounded-[1.25rem] px-2 py-1.5 shadow-sm ring-1 ring-stone-200/30 dark:ring-stone-800/30 transition-all duration-300">
        <div class="flex items-center justify-between gap-2">
          <NuxtLink to="/" class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 group">
            <span class="text-lg font-semibold text-[#18181B] dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Qayra</span>
          </NuxtLink>
          
          <div class="flex items-center gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="relative px-4 py-2 text-sm font-medium text-[#52525B] dark:text-stone-400 rounded-full transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#18181B] dark:hover:text-stone-100"
              :class="{ 'bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100': isActive(link.to) }"
            >
              {{ link.label }}
              <span v-if="isActive(link.to)" class="absolute inset-0 rounded-full ring-2 ring-amber-500/30 dark:ring-amber-400/30" />
            </NuxtLink>
          </div>

          <div class="flex items-center gap-1">
            <button
              @click="toggleTheme"
              class="p-2 rounded-full text-[#52525B] dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              <UIcon 
                :name="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'" 
                class="w-5 h-5 transition-transform duration-300" 
              />
            </button>
            
            <NuxtLink 
              v-if="!user" 
              to="/login" 
              class="px-4 py-2 text-sm font-medium text-white bg-[#18181B] dark:bg-amber-600 rounded-full hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Sign in
            </NuxtLink>
            <button 
              v-else 
              @click="signOut" 
              class="px-4 py-2 text-sm font-medium text-[#52525B] dark:text-stone-400 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#18181B] dark:hover:text-stone-100 transition-all duration-300 active:scale-95"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
    </header>
    
    <main class="pt-20">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const client = useSupabaseClient()
const colorMode = useColorMode()

const navLinks = [
  { to: '/notes', label: 'Notes' },
  { to: '/browse', label: 'Browse Quran' },
]

function isActive(path: string) {
  if (path === '/notes') {
    return route.path.startsWith('/notes')
  }
  return route.path.startsWith(path)
}

async function signOut() {
  await client.auth.signOut()
  navigateTo('/')
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
