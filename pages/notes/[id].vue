<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
        <p class="text-[#52525B] dark:text-stone-400">Loading reflection...</p>
      </div>
    </div>

    <template v-else-if="note">
      <div class="max-w-3xl mx-auto px-6 py-12">
        <header class="mb-12">
          <NuxtLink 
            to="/notes" 
            class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 mb-8 group"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to notes
          </NuxtLink>
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
              Edit reflection
            </h1>
            <button 
              @click="confirmDelete"
              :disabled="deleting"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all duration-300 active:scale-95"
            >
              <UIcon v-if="deleting" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
              <UIcon v-else name="i-heroicons-trash" class="w-4 h-4" />
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </header>

        <form @submit.prevent="save" class="space-y-8">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] p-8 space-y-6 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Title</label>
              <input 
                v-model="form.title" 
                placeholder="Optional — give your reflection a title"
                class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Source</label>
                <div class="relative">
                  <input 
                    v-model="form.source" 
                    placeholder="Type to add new..."
                    list="sources-list"
                    class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
                  />
                  <datalist id="sources-list">
                    <option v-for="s in sources" :key="s.id" :value="s.name" />
                  </datalist>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Speaker</label>
                <div class="relative">
                  <input 
                    v-model="form.speaker" 
                    placeholder="Type to add new..."
                    list="speakers-list"
                    class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
                  />
                  <datalist id="speakers-list">
                    <option v-for="s in speakers" :key="s.id" :value="s.name" />
                  </datalist>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Date</label>
                <input 
                  v-model="form.note_date" 
                  type="date"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Tags</label>
                <input 
                  v-model="tagsRaw" 
                  placeholder="tafsir, ramadan"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Content</label>
            <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] overflow-hidden ring-1 ring-stone-200/30 dark:ring-stone-800/30">
              <NoteEditor v-model="form.content" />
            </div>
          </div>

          <div v-if="verse_keys.length" class="bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl px-4 py-3">
            <p class="text-sm text-[#52525B] dark:text-stone-400 mb-2">Referenced verses:</p>
            <div class="flex flex-wrap gap-2">
              <NuxtLink 
                v-for="vk in verse_keys" 
                :key="vk"
                :to="`/verse/${vk}`"
                class="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-full text-sm font-mono text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                @{{ vk }}
              </NuxtLink>
            </div>
          </div>

          <div v-if="err" class="bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {{ err }}
          </div>

          <div class="flex items-center gap-4 pt-4">
            <button 
              type="submit" 
              :disabled="saving"
              class="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-full font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
            >
              <UIcon v-if="saving" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
            <NuxtLink 
              to="/notes" 
              class="px-6 py-3 text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300"
            >
              Cancel
            </NuxtLink>
          </div>
        </form>
      </div>
    </template>

    <div v-else class="max-w-3xl mx-auto px-6 py-24 text-center">
      <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center mx-auto mb-6">
        <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-stone-300 dark:text-stone-600" />
      </div>
      <h2 class="text-2xl font-medium text-[#18181B] dark:text-stone-100 mb-2">Reflection not found</h2>
      <p class="text-[#52525B] dark:text-stone-400 mb-6">This reflection may have been deleted or doesn't exist.</p>
      <NuxtLink to="/notes" class="text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 transition-colors">Back to notes &rarr;</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { sources, fetchSources, createSource } = useSources()
const { speakers, fetchSpeakers, createSpeaker } = useSpeakers()

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const err = ref('')
const note = ref<{
  id: string
  title: string | null
  content: string
  source: string | null
  speaker: string | null
  note_date: string | null
  tags: string[] | null
} | null>(null)
const verse_keys = ref<string[]>([])

const form = reactive({
  title: '',
  content: '',
  source: '',
  speaker: '',
  note_date: ''
})
const tagsRaw = ref('')

async function load() {
  loading.value = true
  err.value = ''
  try {
    const { note: n, verse_keys: vk } = await $fetch<{
      note: {
        id: string
        title: string | null
        content: string
        source: string | null
        speaker: string | null
        note_date: string | null
        tags: string[] | null
      } | null
      verse_keys: string[]
    }>(`/api/notes/${id.value}`)
    note.value = n
    if (n) {
      form.title = n.title || ''
      form.content = n.content || ''
      form.source = n.source || ''
      form.speaker = n.speaker || ''
      form.note_date = n.note_date || ''
      tagsRaw.value = (n.tags || []).join(', ')
    }
    verse_keys.value = vk || []
  } catch (e: any) {
    note.value = null
    err.value = e?.data?.message || e?.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  err.value = ''
  try {
    const tags = tagsRaw.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (form.source.trim()) {
      await createSource(form.source.trim())
    }
    if (form.speaker.trim()) {
      await createSpeaker(form.speaker.trim())
    }

    await $fetch(`/api/notes/${id.value}`, {
      method: 'PATCH',
      body: {
        title: form.title || null,
        content: form.content,
        source: form.source || null,
        speaker: form.speaker || null,
        note_date: form.note_date || null,
        tags
      }
    })
    await load()
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

function confirmDelete() {
  if (confirm('Delete this reflection? This cannot be undone.')) {
    remove()
  }
}

async function remove() {
  deleting.value = true
  try {
    await $fetch(`/api/notes/${id.value}`, { method: 'DELETE' })
    await navigateTo('/notes')
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || 'Delete failed'
    deleting.value = false
  }
}

watch(id, () => load())
onMounted(async () => {
  await Promise.all([load(), fetchSources(), fetchSpeakers()])
})
</script>
