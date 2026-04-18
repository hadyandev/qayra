<template>
  <UModal v-model="isOpen">
    <div class="p-6 sm:p-8 bg-white dark:bg-stone-900 rounded-[2rem]">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">Connect QF Account</h3>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="isOpen = false" />
      </div>

      <div class="space-y-6">
        <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-400">
          <UIcon name="i-heroicons-information-circle" class="w-5 h-5 shrink-0 mt-0.5" />
          <p class="text-sm leading-relaxed">
            Publishing your reflections requires linking your Quran.com account. Because your reflections contain religious data, we need your explicit consent before proceeding.
          </p>
        </div>

        <div class="space-y-3 px-1">
          <h4 class="font-medium text-[#18181B] dark:text-stone-200 text-sm">Privacy & Data Usage</h4>
          <ul class="text-sm text-[#52525B] dark:text-stone-400 space-y-2 list-disc list-outside ml-4">
            <li>Your reflections will be sent to Quran.com and may be visible publicly if selected.</li>
            <li>We do not use your religious data to construct advertising profiles or sell it to third parties.</li>
            <li>Your data will <strong class="font-medium">not</strong> be used for training AI models without additional written consent.</li>
            <li>You can revoke access and delete your mapped data at any time.</li>
          </ul>
        </div>

        <label class="flex gap-3 items-start p-3 border border-stone-200/60 dark:border-stone-700 rounded-xl cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
          <input 
            type="checkbox" 
            v-model="hasConsented" 
            class="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
          />
          <span class="text-sm leading-snug text-[#18181B] dark:text-stone-300">
            I explicitly consent to the collection and syncing of my notes & religious data under these terms.
          </span>
        </label>

        <UButton
          block
          :disabled="!hasConsented"
          @click="connectAccount"
          class="bg-[#18181B] dark:bg-amber-600 text-white rounded-full py-3 mx-0 disabled:opacity-50 transition-all hover:bg-[#3f3f46] dark:hover:bg-amber-500"
        >
          Agree and Connect Account
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>()
const hasConsented = ref(false)

function connectAccount() {
  if (hasConsented.value) {
    window.location.href = '/api/auth/login'
  }
}

watch(isOpen, (val) => {
  if (!val) hasConsented.value = false
})
</script>
