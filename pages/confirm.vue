<template>
  <div class="max-w-md mx-auto p-8 text-center">
    <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl text-emerald-600 mx-auto mb-4" />
    <p class="text-stone-600">Completing sign-in…</p>
    <p v-if="err" class="text-sm text-red-600 mt-4">{{ err }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const err = ref('')

onMounted(async () => {
  try {
    // Supabase magic link may arrive as:
    // - PKCE code in query (?code=...)
    // - token_hash + type (?token_hash=...&type=magiclink)
    // - access_token in hash (#access_token=...&refresh_token=...)
    const url = new URL(globalThis.location.href)
    const code = url.searchParams.get('code')
    const tokenHash = url.searchParams.get('token_hash')
    const type = url.searchParams.get('type')

    if (code) {
      const { error } = await client.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else if (tokenHash && type) {
      const { error } = await client.auth.verifyOtp({
        type: type as any,
        token_hash: tokenHash
      })
      if (error) throw error
    } else if (url.hash?.includes('access_token=')) {
      const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')
      if (access_token && refresh_token) {
        const { error } = await client.auth.setSession({ access_token, refresh_token })
        if (error) throw error
      }
    } else {
      // Fallback: initialize from URL/session detection
      const { error } = await client.auth.getSession()
      if (error) throw error
    }
  } finally {
    const { data } = await client.auth.getUser()
    if (!data.user) {
      err.value =
        'Login link opened, but no session was established. Check Supabase Auth settings (Site URL + Redirect URLs) match this origin.'
      return
    }
    await navigateTo('/notes')
  }
})
</script>
