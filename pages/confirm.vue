<template>
  <div class="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
    <div class="text-center">
      <div class="relative w-16 h-16 mx-auto mb-6">
        <div class="absolute inset-0 rounded-full border-2 border-stone-200 dark:border-stone-700"></div>
        <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin"></div>
      </div>
      
      <h1 class="text-2xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">
        Completing sign-in
      </h1>
      <p class="text-[#52525B] dark:text-stone-400 mb-6">
        Just a moment while we verify your link
      </p>

      <div v-if="err" class="bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 rounded-xl px-4 py-3 max-w-sm mx-auto">
        <p class="text-sm text-red-700 dark:text-red-400">{{ err }}</p>
      </div>

      <div v-if="success" class="mt-4">
        <NuxtLink 
          to="/notes"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-full font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300"
        >
          <span>Go to your notes</span>
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const err = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    const url = new URL(globalThis.location.href)
    const code = url.searchParams.get('code')
    const tokenHash = url.searchParams.get('token_hash')
    const type = url.searchParams.get('type')

    if (code) {
      const { error: authError } = await client.auth.exchangeCodeForSession(code)
      if (authError) throw authError
    } else if (tokenHash && type) {
      const { error: authError } = await client.auth.verifyOtp({
        type: type as any,
        token_hash: tokenHash
      })
      if (authError) throw authError
    } else if (url.hash?.includes('access_token=')) {
      const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')
      if (access_token && refresh_token) {
        const { error: authError } = await client.auth.setSession({ access_token, refresh_token })
        if (authError) throw authError
      }
    } else {
      const { error: authError } = await client.auth.getSession()
      if (authError) throw authError
    }
  } finally {
    const { data } = await client.auth.getUser()
    if (!data.user) {
      err.value = 'Login link opened, but no session was established. Check Supabase Auth settings (Site URL + Redirect URLs) match this origin.'
      return
    }
    success.value = true
    setTimeout(() => navigateTo('/notes'), 1000)
  }
})
</script>
