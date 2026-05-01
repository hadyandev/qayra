<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-3xl mx-auto px-6 py-12">
      <header class="mb-10">
        <h1 class="text-3xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">Your Profile</h1>
        <p class="text-stone-500 dark:text-stone-400 mt-1">Manage your identity, preferences, and connections.</p>
      </header>

      <div v-if="loadingProfile" class="flex justify-center py-12">
        <div class="w-8 h-8 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Identity Section -->
        <section class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 md:p-8">
          <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-6">Identity</h2>
          
          <div class="flex flex-col md:flex-row gap-8">
            <div class="flex-shrink-0">
              <div class="relative w-24 h-24 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center border-4 border-white dark:border-stone-900 shadow-sm ring-1 ring-stone-200 dark:ring-stone-800">
                <img v-if="profile.avatar_url" :src="profile.avatar_url" alt="Avatar" class="w-full h-full object-cover" />
                <span v-else class="text-3xl font-medium text-amber-700 dark:text-amber-400">
                  {{ (profile.display_name || user?.email || 'U').charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            
            <div class="flex-1 space-y-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Display Name</label>
                <input 
                  v-model="profile.display_name"
                  type="text"
                  placeholder="How should we call you?"
                  class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-[#18181B] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
                <input 
                  :value="user?.email"
                  disabled
                  type="email"
                  class="w-full bg-stone-100/50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 rounded-xl px-4 py-2.5 text-stone-500 dark:text-stone-400 cursor-not-allowed"
                />
              </div>

              <div class="pt-2">
                <button 
                  @click="saveProfile"
                  :disabled="saving"
                  class="px-5 py-2.5 bg-[#18181B] dark:bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <UIcon v-if="saving" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Preferences Section -->
        <section class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 md:p-8">
          <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-6">Reading Preferences</h2>
          
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Default Translation</label>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-3">Choose which English translation to show by default when reading verses.</p>
            <select 
              v-model="profile.default_translation_id"
              @change="saveProfile"
              class="w-full md:w-1/2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-[#18181B] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow appearance-none"
            >
              <option :value="85">M.A.S. Abdel Haleem (Recommended)</option>
              <option :value="131">Marmaduke Pickthall</option>
              <option :value="167">Sahih International</option>
              <option :value="20">Saheeh International (Alt)</option>
            </select>
          </div>
        </section>

        <!-- Connections Section -->
        <section class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 md:p-8">
          <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100 mb-6">Connections</h2>
          
          <div class="space-y-4">
            <!-- Google -->
            <div class="flex items-center justify-between p-4 border border-stone-200/60 dark:border-stone-800 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <UIcon name="i-logos-google-icon" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">Google Account</p>
                  <p class="text-xs text-stone-500 dark:text-stone-400">Connect to sync avatar and login easily.</p>
                </div>
              </div>
              <button 
                v-if="!hasGoogleProvider"
                @click="connectGoogle"
                class="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Connect
              </button>
              <span v-else class="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">Connected</span>
            </div>

            <!-- Quran Foundation -->
            <div class="flex items-center justify-between p-4 border border-stone-200/60 dark:border-stone-800 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <p class="text-sm font-medium text-[#18181B] dark:text-stone-100">Quran Foundation</p>
                  <p class="text-xs text-stone-500 dark:text-stone-400" v-if="qfConnection?.connected">
                    Connected as {{ qfConnection.qf_email || 'QF User' }}
                  </p>
                  <p class="text-xs text-stone-500 dark:text-stone-400" v-else>
                    Track reading history and streaks.
                  </p>
                </div>
              </div>
              
              <div v-if="loadingQf" class="w-5 h-5 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
              <button 
                v-else-if="!qfConnection?.connected"
                @click="showQfModal = true"
                class="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Connect
              </button>
              <button 
                v-else
                @click="handleDisconnectQf"
                class="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
    
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

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const user = useSupabaseUser()
const client = useSupabaseClient()
const toast = useToast()

const profile = ref({
  display_name: '',
  avatar_url: '',
  default_translation_id: 85
})
const loadingProfile = ref(true)
const saving = ref(false)

const { connection: qfConnection, loading: loadingQf, fetchConnection, disconnect: disconnectQf } = useQfConnection()
const showQfModal = ref(false)

const hasGoogleProvider = computed(() => {
  return user.value?.app_metadata?.providers?.includes('google')
})

async function fetchProfile() {
  const { data: { user: currentUser } } = await client.auth.getUser()
  if (!currentUser?.id) return
  loadingProfile.value = true
  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()
      
    if (data && !error) {
      profile.value.display_name = data.display_name || ''
      profile.value.avatar_url = data.avatar_url || ''
      profile.value.default_translation_id = data.default_translation_id || 85
    }
  } catch (err) {
    console.error('Error fetching profile:', err)
  } finally {
    loadingProfile.value = false
  }
}

async function saveProfile() {
  const { data: { user: currentUser } } = await client.auth.getUser()
  if (!currentUser?.id) return
  saving.value = true
  try {
    // We use upsert here in case the profile wasn't created by the trigger
    const { error } = await client
      .from('profiles')
      .upsert({
        id: currentUser.id,
        display_name: profile.value.display_name,
        avatar_url: profile.value.avatar_url,
        default_translation_id: profile.value.default_translation_id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      
    if (error) throw error
    
    toast.add({
      title: 'Profile updated',
      description: 'Your changes have been saved successfully.',
      color: 'green'
    })
  } catch (err: any) {
    toast.add({
      title: 'Failed to update profile',
      description: err.message,
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}

async function connectGoogle() {
  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`
      }
    })
    if (error) throw error
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.message, color: 'red' })
  }
}

async function handleDisconnectQf() {
  await disconnectQf()
  await fetchConnection()
  toast.add({
    title: 'Disconnected',
    description: 'Your Quran Foundation account has been disconnected.',
    color: 'stone'
  })
}

function onQfConnected() {
  showQfModal.value = false
  fetchConnection()
  toast.add({
    title: 'Connected',
    description: 'Your Quran Foundation account is now connected.',
    color: 'green'
  })
}

onMounted(() => {
  if (!user.value) {
    navigateTo('/login')
    return
  }
  fetchProfile()
  fetchConnection()
})
</script>
