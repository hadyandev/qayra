<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path
  
  if (path.startsWith('/notes/')) return 'Note'
  if (path.startsWith('/verse/')) return 'Verse'
  if (path.startsWith('/hadith')) return 'Hadith'
  if (path.startsWith('/heatmap')) return 'My Progress'
  
  const titles: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/notes': 'Notes',
    '/notes/new': 'New Note',
    '/browse': 'Browse Quran',
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
  useHead({ title: fullTitle })
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