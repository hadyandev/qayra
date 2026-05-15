<template>
  <Teleport to="body">
    <div 
      class="fixed inset-0 z-50 flex justify-end"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('close')"></div>
      
      <div 
        class="relative w-full max-w-lg bg-[#FAF9F6] dark:bg-stone-950 h-full overflow-y-auto shadow-2xl animate-slide-in"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800 px-6 py-4 z-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div class="min-w-0">
                <template v-if="!isEditing">
                  <span class="font-medium text-[#18181B] dark:text-stone-100 truncate block">
                    {{ note?.title || 'Untitled Note' }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-sm text-amber-600 dark:text-amber-500">Editing note</span>
                </template>
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0 ml-3">
              <template v-if="!isEditing">
                <button 
                  @click="startEditing"
                  class="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                  title="Edit note"
                >
                  <UIcon name="i-heroicons-pencil" class="w-4 h-4 text-stone-500" />
                </button>
              </template>
              <template v-else>
                <button 
                  @click="save"
                  :disabled="saving"
                  class="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition-colors disabled:opacity-50"
                  title="Save"
                >
                  <UIcon name="i-heroicons-check" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </button>
                <button 
                  @click="cancelEditing"
                  class="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                  title="Cancel"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-stone-500" />
                </button>
              </template>
              <button 
                @click="$emit('close')"
                class="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                title="Close"
              >
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-stone-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-8 h-8 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 animate-spin"></div>
          </div>

          <div v-else-if="note && !error" class="space-y-6">
            <!-- View Mode -->
            <template v-if="!isEditing">
              <!-- Meta -->
              <div class="flex flex-wrap items-center gap-2 text-sm text-[#52525B] dark:text-stone-400">
                <time v-if="note.note_date" class="font-mono">{{ note.note_date }}</time>
                <span v-if="note.source" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-300 text-xs">
                  <span class="w-1 h-1 rounded-full bg-amber-500"></span>
                  {{ note.source }}
                </span>
                <span v-if="note.speaker" class="text-stone-400 text-xs">— {{ note.speaker }}</span>
                <span class="text-stone-400 text-xs flex items-center gap-1">
                  <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                  {{ formatDate(note.created_at) }}
                </span>
              </div>

              <!-- Content -->
              <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-6 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
                <div 
                  class="prose dark:prose-invert max-w-none prose-stone [&_a.mention]:no-underline"
                  v-html="renderedContent"
                  @click="handleContentClick"
                />
              </div>

              <!-- Verse References -->
              <div v-if="verseKeys.length" class="bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-700/60 rounded-xl p-4">
                <h3 class="text-xs font-medium text-[#52525B] dark:text-stone-400 uppercase tracking-wide mb-3">Referenced Verses</h3>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="vk in verseKeys" 
                    :key="vk"
                    @click="openVersePanel(vk)"
                    class="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-full hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors group"
                  >
                    <span class="font-mono text-xs text-amber-600 dark:text-amber-500">@{{ vk }}</span>
                    <UIcon name="i-heroicons-arrows-pointing-out" class="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="note.tags?.length" class="flex flex-wrap gap-2">
                <span 
                  v-for="t in note.tags" 
                  :key="t" 
                  class="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 rounded-full text-xs text-[#52525B] dark:text-stone-400"
                >
                  {{ t }}
                </span>
              </div>

              <!-- Delete -->
              <div class="pt-4 border-t border-stone-200/60 dark:border-stone-700/60">
                <button 
                  @click="confirmDelete"
                  :disabled="deleting"
                  class="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
                  {{ deleting ? 'Deleting...' : 'Delete note' }}
                </button>
              </div>
            </template>

            <!-- Edit Mode -->
            <template v-else>
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-[#52525B] dark:text-stone-400">Title</label>
                  <input 
                    v-model="form.title" 
                    placeholder="Optional"
                    class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-lg text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-[#52525B] dark:text-stone-400">Source</label>
                    <input 
                      v-model="form.source" 
                      placeholder="e.g., Kajian"
                      list="edit-sources"
                      class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-lg text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
                    />
                    <datalist id="edit-sources">
                      <option value="Kajian" />
                      <option value="Khutbah" />
                      <option value="Podcast" />
                      <option value="Book" />
                      <option value="Personal Study" />
                      <option value="Lecture" />
                    </datalist>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-[#52525B] dark:text-stone-400">Speaker</label>
                    <input 
                      v-model="form.speaker" 
                      placeholder="e.g., Ustadz Hanan"
                      list="edit-speakers"
                      class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-lg text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
                    />
                    <datalist id="edit-speakers">
                      <option value="Ustadz Hanan Attaki" />
                      <option value="Ustadz Adi Hidayat" />
                    </datalist>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-[#52525B] dark:text-stone-400">Date</label>
                    <input 
                      v-model="form.note_date" 
                      type="date"
                      class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-lg text-[#18181B] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-[#52525B] dark:text-stone-400">Tags</label>
                    <input 
                      v-model="tagsRaw" 
                      placeholder="tafsir, faith"
                      class="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 rounded-lg text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
                    />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-[#52525B] dark:text-stone-400">Content</label>
                  <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl overflow-hidden">
                    <NoteEditor v-model="form.content" />
                  </div>
                </div>

                <div v-if="saveError" class="bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
                  {{ saveError }}
                </div>
              </div>
            </template>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-stone-500 dark:text-stone-400">{{ error || 'Note not found.' }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <VersePanel 
    v-if="selectedVerseKey"
    :verse-key="selectedVerseKey"
    @close="selectedVerseKey = null"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  noteId: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const saveError = ref('')

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

const verseKeys = ref<string[]>([])
const originalNote = ref<typeof note.value>(null)

const form = reactive({
  title: '',
  content: '',
  source: '',
  speaker: '',
  note_date: ''
})
const tagsRaw = ref('')
const selectedVerseKey = ref<string | null>(null)

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return date.toLocaleDateString()
}

const renderedContent = computed(() => {
  if (!note.value?.content) return ''
  let html = note.value.content
  html = html.replace(
    /@(\d+:\d+)/g,
    '<button data-verse-key="$1" class="mention text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md font-mono text-sm border-b-2 border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors no-underline inline-block">@$1</button>'
  )
  return html
})

function handleContentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const btn = target.closest('button.mention') as HTMLButtonElement
  if (btn && btn.dataset.verseKey) {
    e.preventDefault()
    openVersePanel(btn.dataset.verseKey)
  }
}

function openVersePanel(vk: string) {
  selectedVerseKey.value = vk
}

function startEditing() {
  if (note.value) {
    form.title = note.value.title || ''
    form.content = note.value.content
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
  saveError.value = ''
}

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    const tags = tagsRaw.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const updated = await $fetch<{ note: typeof note.value }>(`/api/notes/${props.noteId}`, {
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
    emit('saved')
  } catch (e: any) {
    saveError.value = e?.data?.message || e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

function confirmDelete() {
  if (confirm('Delete this note? This cannot be undone.')) {
    remove()
  }
}

async function remove() {
  deleting.value = true
  try {
    await $fetch(`/api/notes/${props.noteId}`, { method: 'DELETE' })
    emit('close')
  } catch (e: any) {
    saveError.value = e?.data?.message || e?.message || 'Delete failed'
    deleting.value = false
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ note: typeof note.value; verse_keys: string[] }>(
      `/api/notes/${props.noteId}`
    )
    note.value = data.note
    verseKeys.value = data.verse_keys || []
    if (data.note) {
      originalNote.value = { ...data.note }
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to load note'
    note.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.noteId, () => load(), { immediate: true })
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
