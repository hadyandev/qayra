<template>
  <div class="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
    <div class="w-full max-w-md">
      <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] p-8 md:p-10 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
        <header class="text-center mb-10">
          <Logo size="xl" :icon-only="true" class="justify-center mb-6" />
          <h1 class="text-3xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">
            Welcome to Qayra
          </h1>
          <p class="text-[#52525B] dark:text-stone-400">
            Sign in to access your notes
          </p>
        </header>

        <!-- Magic Link Form -->
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div class="space-y-1.5">
            <label for="email" class="text-sm font-medium text-[#18181B] dark:text-stone-200">Email</label>
            <input
              id="email"
              v-model="state.email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
            />
          </div>

          <button 
            type="submit" 
            :disabled="pending"
            class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <UIcon v-if="pending" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span>{{ pending ? 'Sending link...' : 'Send magic link' }}</span>
          </button>
        </form>

        <div v-if="message" class="mt-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl px-4 py-3">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p class="text-sm text-emerald-700 dark:text-emerald-400">{{ message }}</p>
          </div>
        </div>

        <div v-if="err" class="mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 rounded-xl px-4 py-3">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p class="text-sm text-red-700 dark:text-red-400">{{ err }}</p>
          </div>
        </div>

        <p class="mt-8 text-center text-sm text-[#52525B] dark:text-stone-500">
          No password needed. We'll send a link to your inbox.
        </p>
      </div>

      <p class="mt-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 group">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to home
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const state = reactive({ email: '' })
const pending = ref(false)
const message = ref('')
const err = ref('')

async function onSubmit() {
  message.value = ''
  err.value = ''
  pending.value = true
  try {
    const redirect = `${globalThis.location.origin}/confirm`
    const { error: authError } = await client.auth.signInWithOtp({
      email: state.email.trim(),
      options: { emailRedirectTo: redirect }
    })
    if (authError) throw authError
    message.value = 'Check your inbox for the login link.'
    state.email = ''
  } catch (e: any) {
    err.value = e?.message || 'Sign-in failed'
  } finally {
    pending.value = false
  }
}
</script>