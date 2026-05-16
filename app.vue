<template>
  <div>
    <div v-if="isUserPrelive" class="fixed top-0 left-0 z-50 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-br">
      QF USER PRELIVE
    </div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()

const isUserPrelive = computed(() => config.public.qfUserEnv === 'prelive')

const pageTitle = computed(() => {
  const path = route.path
  
  if (path.startsWith('/notes/')) return 'Note'
  if (path.startsWith('/quran/verse/')) return 'Verse'
  if (path.startsWith('/hadith')) return 'Hadith'
  if (path.startsWith('/heatmap')) return 'My Progress'
  
  const titles: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/notes': 'Notes',
    '/notes/new': 'New Note',
    '/quran': 'Browse Quran',
    '/stats': 'Statistics',
  }
  
  for (const [key, value] of Object.entries(titles)) {
    if (path === key || path.startsWith(key + '/')) {
      return value
    }
  }
  return 'Qayra'
})

watch(() => route.path, (currentPath) => {
  const title = pageTitle.value
  let fullTitle
  if (currentPath === '/' || title === 'Home') {
    fullTitle = 'Qayra - A Quran Learning Workspace'
  } else {
    fullTitle = `${title} | Qayra`
  }
  useHead({ 
    title: fullTitle,
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap' }
    ]
  })
}, { immediate: true })
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
