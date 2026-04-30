<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50">
    <div class="text-center">
      <div v-if="loading" class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-amber-600" />
        <p class="text-stone-600">Completing sign in...</p>
      </div>

      <div v-else-if="error" class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 text-red-500" />
        <p class="text-red-600 font-medium">{{ error }}</p>
        <UButton color="gray" @click="goHome">Go to Home</UButton>
      </div>

      <div v-else-if="success" class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-green-500" />
        <p class="text-green-600 font-medium">Successfully connected!</p>
        <p class="text-stone-500 text-sm">Redirecting...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref(false)

onMounted(async () => {
  const route = useRoute()
  const code = route.query.code as string
  const state = route.query.state as string
  const errorParam = route.query.error as string
  const errorDescription = route.query.error_description as string

  if (errorParam) {
    loading.value = false
    error.value = decodeURIComponent(errorDescription || errorParam)
    return
  }

  if (!code) {
    loading.value = false
    error.value = 'Missing authorization code'
    return
  }

  try {
    await $fetch('/api/qf/oauth/callback', {
      method: 'GET',
      query: { code, state, redirect: route.query.redirect || '/heatmap' }
    })

    success.value = true
    setTimeout(() => {
      navigateTo('/heatmap')
    }, 1000)
  } catch (err: any) {
    error.value = err.message || 'Failed to complete authentication'
  } finally {
    loading.value = false
  }
})

function goHome() {
  navigateTo('/')
}
</script>
