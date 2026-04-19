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
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">
              New note
            </h1>
            <p class="text-[#52525B] dark:text-stone-400 mt-3 text-lg">
              Capture your thought. Cite verses with @surah:ayah
            </p>
          </div>
          <button 
            v-if="isPrelive"
            type="button"
            @click="generateDemo"
            class="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-colors duration-300"
          >
            ✨ Autofill
          </button>
        </div>
      </header>

      <form @submit.prevent="save" class="space-y-8">
        <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[1.5rem] p-8 space-y-6 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Title</label>
            <input 
              v-model="form.title" 
              placeholder="Optional — give your note a title"
              class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Source</label>
              <div class="relative">
                <input 
                  v-model="form.source" 
                  placeholder="e.g., kajian, khutbah, podcast"
                  list="sources-suggestions"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
                />
                <datalist id="sources-suggestions">
                  <option value="Kajian" />
                  <option value="Khutbah" />
                  <option value="Podcast" />
                  <option value="Book" />
                  <option value="Personal Study" />
                  <option value="Lecture" />
                  <option value="Seminar" />
                  <option v-for="s in sources" :key="s.id" :value="s.name" />
                </datalist>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-[#18181B] dark:text-stone-200">Speaker / Author</label>
              <div class="relative">
                <input 
                  v-model="form.speaker" 
                  placeholder="e.g., Ustadz Hanan Attaki"
                  list="speakers-suggestions"
                  class="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl text-[#18181B] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 transition-all duration-300"
                />
                <datalist id="speakers-suggestions">
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
                placeholder="e.g., tafsir, ramadan, ibadah"
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
          <p class="text-xs text-[#52525B] dark:text-stone-500 mt-1">
            Tip: Type @ to search for verses (e.g., @2:153)
          </p>
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
            <span>{{ saving ? 'Saving...' : 'Save note' }}</span>
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

const config = useRuntimeConfig()
const user = useSupabaseUser()
const isPrelive = computed(() => config.public.qfEnv === 'prelive')

if (!user.value) {
  navigateTo('/login')
}

const route = useRoute()

const { sources, fetchSources, createSource } = useSources()
const { speakers, fetchSpeakers, createSpeaker } = useSpeakers()

// Demo templates for autofill (chapters 1-2 only in prelive)
const demoTemplates = [
  { title: 'Reflection on Al-Fatihah', verse: '1:1', content: '@1:1 => "Bismillahir Rahmanir Rahim. In the name of Allah, the Most Gracious, the Most Merciful. This verse reminds me to start every action with Allah\'s name."', source: 'Kajian', speaker: 'Ustadz Hanan Attaki', tags: 'demo,tafsir,alfatihah' },
  { title: 'Ayat about Patience', verse: '2:153', content: '@2:153 => "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient. This reminds me that patience is the key to every blessing."', source: 'Tafsir Class', speaker: 'Ustadz Yazid', tags: 'demo,patience,ibadah' },
  { title: 'Morning Reminder', verse: '1:2', content: '@1:2 => "Al hamdu lillahi rabbil alamin. All praise is for Allah, Lord of the worlds. Starting my day with gratitude."', source: 'Personal Study', speaker: '', tags: 'demo,morning,gratitude' },
  { title: 'Notes from Kajian', verse: '2:255', content: '@2:255 => "Allah - there is no deity except Him, the Living, the Eternal. Neither drowsiness nor sleep overtakes Him. What an amazing attribute of Allah!"', source: 'Kajian', speaker: 'Sheikh Mishari', tags: 'demo,kajian,attributes' },
  { title: 'Tafsir Study - Al-Baqarah', verse: '1:5', content: '@1:5 => "You alone do we worship and You alone do we ask for help. Guide us to the straight path." - Seeking guidance in this journey of life.', source: 'Lecture', speaker: 'Ustadz Hanan Attaki', tags: 'demo,tafsir,guidance' },
  { title: 'Reflection: Trust in Allah', verse: '2:286', content: '@2:286 => "Never will Allah burden a soul beyond what it can bear." This gives me comfort in every trial.', source: 'Podcast', speaker: '', tags: 'demo,trust,faith' }
]
let demoIndex = -1

function generateDemo() {
  demoIndex = (demoIndex + 1) % demoTemplates.length
  const t = demoTemplates[demoIndex]
  form.title = t.title
  form.content = `<p>${t.content}</p>`
  form.source = t.source
  form.speaker = t.speaker
  tagsRaw.value = t.tags
}

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
    form.content = `<p>@${v} => "</p><p></p><p></p>`
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
