<template>
  <UModal v-model="isOpen">
    <div class="p-6 sm:p-8 bg-white dark:bg-stone-900 rounded-[2rem]">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
          {{ isConnected ? 'QF Account Connected' : 'Connect QF Account' }}
        </h3>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="isOpen = false" />
      </div>

      <div v-if="isConnected" class="space-y-6">
        <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200/60 dark:border-green-800/60 rounded-xl">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <p class="font-medium text-green-800 dark:text-green-300">Connected as</p>
            <p class="text-sm text-green-700 dark:text-green-400">{{ qfEmail || qfSub }}</p>
          </div>
        </div>

        <div class="space-y-3 px-1">
          <h4 class="font-medium text-[#18181B] dark:text-stone-200 text-sm">Connection Details</h4>
          <div class="space-y-2 text-sm text-[#52525B] dark:text-stone-400">
            <div class="flex justify-between">
              <span>Scopes</span>
              <span class="font-mono text-xs">{{ scopes?.join(', ') || 'none' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Connected</span>
              <span>{{ formatDate(connectedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <UButton
            block
            color="gray"
            @click="handleReconnect"
            class="rounded-full"
          >
            Reconnect
          </UButton>
          <UButton
            block
            color="red"
            variant="outline"
            @click="handleDisconnect"
            class="rounded-full"
          >
            Disconnect
          </UButton>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-400">
          <UIcon name="i-heroicons-information-circle" class="w-5 h-5 shrink-0 mt-0.5" />
          <p class="text-sm leading-relaxed">
            Connect your Quran.com account to sync activity, track streaks, and view your reading progress across apps.
          </p>
        </div>

        <div class="space-y-3 px-1">
          <h4 class="font-medium text-[#18181B] dark:text-stone-200 text-sm">What You Get</h4>
          <ul class="text-sm text-[#52525B] dark:text-stone-400 space-y-2 list-disc list-outside ml-4">
            <li>Sync reading activity across all Quran.com apps</li>
            <li>Track reading streaks and progress</li>
            <li>Unified activity calendar (like GitHub contributions)</li>
            <li>Access bookmarks and notes from Quran.com</li>
          </ul>
        </div>

        <label class="flex gap-3 items-start p-3 border border-stone-200/60 dark:border-stone-700 rounded-xl cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
          <input 
            type="checkbox" 
            v-model="hasConsented" 
            class="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
          />
          <span class="text-sm leading-snug text-[#18181B] dark:text-stone-300">
            I consent to sharing my activity data with Quran Foundation.
          </span>
        </label>

        <UButton
          block
          :disabled="!hasConsented"
          @click="connectAccount"
          class="bg-[#18181B] dark:bg-amber-600 text-white rounded-full py-3 mx-0 disabled:opacity-50 transition-all hover:bg-[#3f3f46] dark:hover:bg-amber-500"
        >
          Connect Account
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  isConnected?: boolean
  qfEmail?: string
  qfSub?: string
  scopes?: string[]
  connectedAt?: string
}>()

const emit = defineEmits<{
  connected: []
  reconnect: []
  disconnect: []
}>()

const isOpen = defineModel<boolean>()
const hasConsented = ref(false)

function connectAccount() {
  if (hasConsented.value) {
    const currentPath = window.location.pathname + window.location.search
    const redirectParam = encodeURIComponent(currentPath)
    window.location.href = `/api/qf/oauth/login?redirect=${redirectParam}`
  }
}

function handleReconnect() {
  emit('reconnect')
  connectAccount()
}

function handleDisconnect() {
  emit('disconnect')
  isOpen.value = false
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

watch(isOpen, (val) => {
  if (!val) hasConsented.value = false
})
</script>
