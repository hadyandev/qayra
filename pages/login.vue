<template>
  <div class="max-w-md mx-auto p-8">
    <h1 class="text-2xl font-bold mb-2">Sign in</h1>
    <p class="text-stone-500 mb-6 text-sm">We’ll email you a magic link (Supabase Auth).</p>

    <UForm :state="state" @submit="onSubmit" class="space-y-4">
      <UFormGroup label="Email" name="email">
        <UInput v-model="state.email" type="email" autocomplete="email" required />
      </UFormGroup>
      <UButton type="submit" block :loading="pending" color="emerald">
        Send magic link
      </UButton>
    </UForm>

    <UAlert v-if="message" class="mt-4" color="emerald" variant="soft" :title="message" />
    <UAlert v-if="err" class="mt-4" color="red" variant="soft" :title="err" />

    <p class="mt-6 text-center text-sm text-stone-500">
      <NuxtLink to="/" class="text-emerald-600 hover:underline">← Home</NuxtLink>
    </p>
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
    const { error } = await client.auth.signInWithOtp({
      email: state.email.trim(),
      options: { emailRedirectTo: redirect }
    })
    if (error) throw error
    message.value = 'Check your inbox for the login link.'
  } catch (e: any) {
    err.value = e?.message || 'Sign-in failed'
  } finally {
    pending.value = false
  }
}
</script>
