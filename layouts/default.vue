<template>
  <div class="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 font-sans transition-colors duration-500">
    <header class="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav class="max-w-5xl mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/60 dark:border-stone-800/60 rounded-[1.25rem] px-2 py-1.5 shadow-sm ring-1 ring-stone-200/30 dark:ring-stone-800/30 transition-all duration-300">
        <div class="flex items-center justify-between gap-2">
          <NuxtLink to="/" class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 group">
            <span class="text-lg font-semibold text-[#18181B] dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Qayra</span>
          </NuxtLink>
          
          <div class="flex items-center gap-1">
            <button
              @click="commandPalette?.open()"
              class="flex items-center gap-2 px-3 py-2 text-sm text-[#52525B] dark:text-stone-400 rounded-full transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#18181B] dark:hover:text-stone-100"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
              <span class="hidden md:inline text-xs text-stone-400">Search</span>
              <kbd class="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
                <span>⌘</span><span>K</span>
              </kbd>
            </button>
            
            <NuxtLink
              v-for="link in visibleLinks"
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
                    <NuxtLink 
                      to="/dashboard"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-[#52525B] dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                      @click="showUserMenu = false"
                    >
                      <UIcon name="i-heroicons-home" class="w-4 h-4" />
                      Dashboard
                    </NuxtLink>
                    <NuxtLink 
                      to="/notes"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-[#52525B] dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                      @click="showUserMenu = false"
                    >
                      <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                      My Notes
                    </NuxtLink>
                    <NuxtLink 
                      to="/heatmap"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-[#52525B] dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                      @click="showUserMenu = false"
                    >
                      <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
                      My Stats
                    </NuxtLink>
                    <div class="border-t border-stone-100 dark:border-stone-800 my-1"></div>
                    <NuxtLink 
                      to="/stats"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-[#52525B] dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                      @click="showUserMenu = false"
                    >
                      <UIcon name="i-heroicons-users" class="w-4 h-4" />
                      Community Stats
                    </NuxtLink>
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
  const links = [
    { to: '/browse', label: 'Browse Quran', requiresAuth: false },
  ]
  
  if (user.value) {
    links.push(
      { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
      { to: '/notes', label: 'Notes', requiresAuth: true },
      { to: '/heatmap', label: 'My Stats', requiresAuth: true },
    )
  } else {
    links.push({ to: '/stats', label: 'Statistics', requiresAuth: false })
  }
  
  return links
})

const visibleLinks = computed(() => {
  return navLinks.value.filter(link => {
    if (link.requiresAuth && !user.value) return false
    return true
  })
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
