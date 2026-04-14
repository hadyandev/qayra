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
        <!-- Header -->
        <header class="mb-12">
          <NuxtLink 
            to="/notes" 
            class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 mb-8 group"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to notes
          </NuxtLink>
          
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div class="space-y-4 flex-1">
              <!-- View Mode: Title -->
              <h1 v-if="!isEditing" class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
                {{ note.title || 'Untitled Reflection' }}
              </h1>
              <!-- Edit Mode: Title Input -->
              <input 
                v-else
                v-model="form.title" 
                placeholder="Optional — give your reflection a title"
                class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
              
              <!-- Meta info -->
              <div class="flex flex-wrap items-center gap-3 text-sm text-[#52525B] dark:text-stone-400">
                <time class="font-mono">{{ formatDate(note.note_date, note.created_at) }}</time>
                <span v-if="note.source" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {{ note.source }}
                </span>
                <span v-if="note.speaker" class="text-stone-400">— {{ note.speaker }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <template v-if="!isEditing">
                <UButton 
                  @click="startEditing"
                  class="bg-[#18181B] dark:bg-amber-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all"
                  icon="i-heroicons-pencil"
                >
                  Edit
                </UButton>
              </template>
              <template v-else>
                <UButton 
                  @click="save" 
                  :loading="saving"
                  class="bg-[#18181B] dark:bg-amber-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-all"
                  icon="i-heroicons-check"
                >
                  Save
                </UButton>
                <UButton 
                  variant="ghost"
                  @click="cancelEditing"
                  class="text-[#52525B] dark:text-stone-400 rounded-full px-4 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                >
                  Cancel
                </UButton>
              </template>
              <UButton 
                variant="ghost"
                color="red"
                @click="confirmDelete"
                :loading="deleting"
                class="rounded-full px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                icon="i-heroicons-trash"
              />
            </div>
          </div>
        </header>

        <!-- View Mode: Content -->
        <div v-if="!isEditing" class="space-y-8">
          <!-- Content -->
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] p-8 md:p-10 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <div 
              class="prose dark:prose-invert max-w-none"
              v-html="renderedContent"
            />
          </div>

          <!-- Verse References -->
          <div v-if="verse_keys.length" class="bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-700/60 rounded-[1.5rem] p-6">
            <h3 class="text-sm font-medium text-[#18181B] dark:text-stone-200 mb-4">Referenced Verses</h3>
            <div class="flex flex-wrap gap-3">
              <NuxtLink 
                v-for="vk in verse_keys" 
                :key="vk"
                :to="`/verse/${vk}`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-full hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors group"
              >
                <span class="font-mono text-amber-600 dark:text-amber-500">@{{ vk }}</span>
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NuxtLink>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="note.tags?.length" class="flex flex-wrap gap-2">
            <span 
              v-for="t in note.tags" 
              :key="t" 
              class="px-3 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 rounded-full text-sm text-[#52525B] dark:text-stone-400"
            >
              {{ t }}
            </span>
          </div>
        </div>

        <!-- Edit Mode: Form -->
        <div v-else class="space-y-8">
          <form @submit.prevent="save" class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] p-8 space-y-6 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Source</label>
                <input 
                  v-model="form.source" 
                  placeholder="e.g., kajian, khutbah, podcast"
                  list="sources-list"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                />
                <datalist id="sources-list">
                  <option value="Kajian" />
                  <option value="Khutbah" />
                  <option value="Podcast" />
                  <option value="Book" />
                  <option value="Personal Study" />
                </datalist>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Speaker / Author</label>
                <input 
                  v-model="form.speaker" 
                  placeholder="e.g., Ustadz Hanan Attaki"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Date</label>
                <input 
                  v-model="form.note_date" 
                  type="date"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Tags</label>
                <input 
                  v-model="tagsRaw" 
                  placeholder="tafsir, ramadan, ibadah"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Content</label>
              <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl overflow-hidden">
                <NoteEditor v-model="form.content" />
              </div>
            </div>
          </form>

          <div v-if="verse_keys.length" class="bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-700/60 rounded-xl px-4 py-3">
            <p class="text-sm text-[#52525B] dark:text-stone-400">Referenced verses:</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <NuxtLink 
                v-for="vk in verse_keys" 
                :key="vk"
                :to="`/verse/${vk}`"
                class="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-full text-sm font-mono text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                @{{ vk }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-if="err" class="mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {{ err }}
        </div>
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
const isEditing = ref(false)
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
  created_at: string
} | null>(null)
const verse_keys = ref<string[]>([])
const originalNote = ref<typeof note.value>(null)

const form = reactive({
  title: '',
  content: '',
  source: '',
  speaker: '',
  note_date: ''
})
const tagsRaw = ref('')

const renderedContent = computed(() => {
  if (!note.value?.content) return ''
  let html = note.value.content
  // Convert verse mentions to links
  html = html.replace(/@(\d+:\d+)/g, '<a href="/verse/$1" class="mention text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md font-mono text-sm border-b-2 border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors no-underline">@$1</a>')
  return html
})

function formatDate(noteDate: string | null, created: string) {
  if (noteDate) return noteDate
  return new Date(created).toLocaleDateString()
}

async function load() {
  loading.value = true
  err.value = ''
  try {
    const { note: n, verse_keys: vk } = await $fetch<{
      note: typeof note.value
      verse_keys: string[]
    }>(`/api/notes/${id.value}`)
    note.value = n
    if (n) {
      originalNote.value = { ...n }
    }
    verse_keys.value = vk || []
  } catch (e: any) {
    note.value = null
    err.value = e?.data?.message || e?.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

function startEditing() {
  if (note.value) {
    form.title = note.value.title || ''
    form.content = note.value.content || ''
    form.source = note.value.source || ''
    form.speaker = note.value.speaker || ''
    form.note_date = note.value.note_date || ''
    tagsRaw.value = (note.value.tags || []).join(', ')
  }
  isEditing.value = true
}

function cancelEditing() {
  if (originalNote.value) {
    note.value = { ...originalNote.value }
  }
  isEditing.value = false
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

    const updated = await $fetch<{ note: typeof note.value }>(`/api/notes/${id.value}`, {
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
    note.value = updated.note
    originalNote.value = { ...updated.note }
    isEditing.value = false
    
    // Reload verse keys
    const { verse_keys: vk } = await $fetch<{ verse_keys: string[] }>(`/api/notes/${id.value}`)
    verse_keys.value = vk || []
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

<style>
.prose a.mention {
  text-decoration: none;
}
</style>
