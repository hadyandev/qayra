<template>
  <div class="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 font-sans transition-colors duration-500">
    <header class="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav class="max-w-5xl mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/60 dark:border-stone-800/60 rounded-[1.25rem] px-2 py-1.5 shadow-sm ring-1 ring-stone-200/30 dark:ring-stone-800/30 transition-all duration-300">
        <div class="flex items-center justify-between gap-2">
          <NuxtLink to="/" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 group">
            <span class="text-lg font-semibold text-[#18181B] dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Qayra</span>
          </NuxtLink>
          
          <!-- Right side: Nav Links + Search + Theme + User -->
          <div class="flex items-center gap-1">
            <!-- Nav Links -->
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-2 text-sm font-medium text-[#52525B] dark:text-stone-400 rounded-full transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              :class="{ 'bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100': isActive(link.to) }"
            >
              {{ link.label }}
            </NuxtLink>
            
            <!-- Search (Icon only) -->
            <button
              @click="commandPalette?.open()"
              class="p-2 rounded-full text-[#52525B] dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300"
              aria-label="Search (Cmd+K)"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
            </button>
            
            <!-- Theme Toggle -->
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
            
            <button
              v-if="!user" 
              to="/login"
              class="px-4 py-2 text-sm font-medium text-white bg-[#18181B] dark:bg-amber-600 rounded-full hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Sign in
            </button>
            
            <div v-else class="relative" ref="userMenuRef">
              <button 
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <span class="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {{ userEmail.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-stone-400" />
              </button>
              
              <Transition name="dropdown">
                <div 
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div class="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                    <p class="text-sm font-medium text-[#18181B] dark:text-stone-100 truncate">{{ userEmail }}</p>
                  </div>
                  <div class="py-1">
                    <button 
                      @click="signOut"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </nav>
    </header>
    
    <main class="pt-20">
      <slot />
    </main>

    <CommandPalette ref="commandPalette" />
  </div>
</template>

<style>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const client = useSupabaseClient()
const colorMode = useColorMode()
const commandPalette = ref<{ open: () => void } | null>(null)
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const userEmail = computed(() => {
  return user.value?.email || 'User'
})

const navLinks = computed(() => {
  if (user.value) {
    return [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/notes', label: 'Notes' },
      { to: '/browse', label: 'Browse' },
      { to: '/hadith', label: 'Hadith' },
      { to: '/heatmap', label: 'My Stats' },
    ]
  }
  return [
    { to: '/browse', label: 'Browse' },
    { to: '/hadith', label: 'Hadith' },
    { to: '/stats', label: 'Stats' },
  ]
})

function isActive(path: string) {
  if (path === '/notes') {
    return route.path.startsWith('/notes')
  }
  if (path === '/heatmap') {
    return route.path.startsWith('/heatmap')
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

function handleClickOutside(event: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
