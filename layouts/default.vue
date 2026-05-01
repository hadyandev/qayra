<template>
  <div class="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-stone-950 font-sans transition-colors duration-500">
    <header class="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav class="max-w-5xl mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/60 dark:border-stone-800/60 rounded-[1.25rem] px-2 py-1.5 shadow-sm ring-1 ring-stone-200/30 dark:ring-stone-800/30 transition-all duration-300">
        <div class="flex items-center justify-between gap-2">
          <NuxtLink to="/" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 group">
            <Logo size="md" />
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
            
            <NuxtLink
              v-if="!user" 
              to="/login"
              class="px-4 py-2 text-sm font-medium text-white bg-[#18181B] dark:bg-amber-600 rounded-full hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Sign in
            </NuxtLink>
            
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
                  
                  <div class="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                    <div v-if="loading" class="flex items-center gap-2">
                      <UIcon name="i-heroicons-arrow-path" class="w-3 h-3 animate-spin text-stone-400" />
                      <span class="text-xs text-stone-400">Checking connection...</span>
                    </div>
                    <div v-else-if="qfConnection?.connected" class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span class="text-xs text-stone-500 dark:text-stone-400">QF Connected</span>
                      </div>
                      <button 
                        @click="handleDisconnectQf"
                        class="text-xs text-red-500 hover:text-red-600 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                    <button 
                      v-else
                      @click="openQfConnect"
                      class="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                    >
                      <UIcon name="i-heroicons-link" class="w-3.5 h-3.5" />
                      Connect QF Account
                    </button>
                  </div>

                  <div class="py-1">
                    <NuxtLink 
                      to="/profile"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-[#18181B] dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <UIcon name="i-heroicons-user" class="w-4 h-4 text-stone-500" />
                      Profile & Settings
                    </NuxtLink>
                    <button 
                      @click="signOut"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
    
<main class="pt-20 pb-16 flex-1">
      <slot />
    </main>
    
    <!-- Footer - same as homepage -->
    <footer class="mt-auto py-8 border-t border-stone-200 dark:border-stone-800">
      <div class="max-w-5xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#52525B] dark:text-stone-400">
          <p>Qayra — A Quran Learning Workspace</p>
          <div class="flex items-center gap-6">
            <NuxtLink to="/browse" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Browse</NuxtLink>
            <NuxtLink to="/stats" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Stats</NuxtLink>
            <a href="https://github.com/hadyandev/qayra" target="_blank" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>

    <CommandPalette ref="commandPalette" />
    <QfConnectModal 
      v-model="showQfModal" 
      :is-connected="qfConnection?.connected"
      :qf-email="qfConnection?.qf_email"
      :qf-sub="qfConnection?.qf_sub"
      :scopes="qfConnection?.scopes"
      :connected-at="qfConnection?.connected_at"
      @connected="onQfConnected"
      @disconnect="handleDisconnectQf"
    />
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
const showQfModal = ref(false)

const { connection: qfConnection, loading, fetchConnection, disconnect: disconnectQf } = useQfConnection()

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  if (user.value) {
    await fetchConnection()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(user, async (newUser) => {
  if (newUser) {
    await fetchConnection()
  } else {
    qfConnection.value = null
  }
})

function openQfConnect() {
  showUserMenu.value = false
  showQfModal.value = true
}

async function handleDisconnectQf() {
  showUserMenu.value = false
  await disconnectQf()
  await fetchConnection()
}

function onQfConnected() {
  showQfModal.value = false
  fetchConnection()
}

const userEmail = computed(() => {
  return user.value?.email || 'User'
})

const navLinks = computed(() => {
  if (user.value) {
    return [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/notes', label: 'Notes' },
      { to: '/browse', label: 'Browse' },
      // { to: '/hadith', label: 'Hadith' },
      { to: '/heatmap', label: 'My Stats' },
    ]
  }
  return [
    { to: '/browse', label: 'Browse' },
    { to: '/stats', label: 'Stats' },
    // { to: '/hadith', label: 'Hadith' },
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
</script>
