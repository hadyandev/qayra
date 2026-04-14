<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-3xl mx-auto px-6 py-12">
      <header class="mb-12">
        <NuxtLink 
          to="/notes" 
          class="inline-flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 hover:text-[#18181B] dark:hover:text-stone-100 transition-colors duration-300 mb-8 group"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to notes
        </NuxtLink>
        <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
          New reflection
        </h1>
        <p class="text-[#52525B] dark:text-stone-400 mt-3 text-lg">
          Capture your thought. Cite verses with @surah:ayah
        </p>
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
          <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Content <span class="text-red-500">*</span></label>
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] overflow-hidden ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <NoteEditor v-model="form.content" />
          </div>
        </div>

        <div v-if="err" class="bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {{ err }}
        </div>

        <div class="flex items-center gap-4 pt-4">
          <button 
            type="submit" 
            :disabled="saving || !form.content.trim()"
            class="inline-flex items-center gap-2 px-6 py-3 bg-[#18181B] dark:bg-amber-600 text-white rounded-full font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
          >
            <UIcon v-if="saving" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span>{{ saving ? 'Saving...' : 'Save reflection' }}</span>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const { sources, fetchSources, createSource } = useSources()
const { speakers, fetchSpeakers, createSpeaker } = useSpeakers()

const form = reactive({
  title: '',
  content: '',
  source: '',
  speaker: '',
  note_date: ''
})
const tagsRaw = ref('')
const saving = ref(false)
const err = ref('')

onMounted(async () => {
  await Promise.all([fetchSources(), fetchSpeakers()])
  
  const v = route.query.verse as string | undefined
  if (v) {
    form.content = `<p>@${v} </p>`
  }
})

async function save() {
  err.value = ''
  if (!form.content.trim()) {
    err.value = 'Content is required'
    return
  }
  saving.value = true
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

    const { note } = await $fetch<{ note: { id: string } }>('/api/notes', {
      method: 'POST',
      body: {
        title: form.title || null,
        content: form.content,
        source: form.source || null,
        speaker: form.speaker || null,
        note_date: form.note_date || null,
        tags
      }
    })
    await navigateTo(`/notes/${note.id}`)
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>
