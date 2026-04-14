<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <div v-if="loading" class="text-center py-12 text-stone-500">Loading…</div>
    <template v-else-if="note">
      <div class="flex flex-wrap justify-between gap-4">
        <h1 class="text-2xl font-bold">Edit note</h1>
        <UButton color="red" variant="soft" :loading="deleting" @click="remove">Delete</UButton>
      </div>

      <UForm :state="form" class="space-y-4" @submit.prevent="save">
        <UFormGroup label="Title">
          <UInput v-model="form.title" />
        </UFormGroup>
        <UFormGroup label="Source">
          <USelect v-model="form.source" :options="['kajian', 'khutbah', 'personal', '']" />
        </UFormGroup>
        <UFormGroup label="Speaker">
          <UInput v-model="form.speaker" />
        </UFormGroup>
        <UFormGroup label="Date">
          <UInput v-model="form.note_date" type="date" />
        </UFormGroup>
        <UFormGroup label="Tags (comma-separated)">
          <UInput v-model="tagsRaw" />
        </UFormGroup>
        <UFormGroup label="Content">
          <NoteEditor v-model="form.content" />
        </UFormGroup>
        <div v-if="verse_keys.length" class="text-sm text-stone-500">
          Verses: {{ verse_keys.join(', ') }}
        </div>
        <div class="flex gap-2">
          <UButton type="submit" color="emerald" :loading="saving">Save</UButton>
          <UButton variant="ghost" to="/notes">Back</UButton>
        </div>
      </UForm>
    </template>
    <UAlert v-else color="red" title="Note not found" />

    <UAlert v-if="err" color="red" :title="err" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id = computed(() => route.params.id as string)

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
  source: '' as string,
  speaker: '',
  note_date: '' as string
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

async function remove() {
  if (!confirm('Delete this note?')) return
  deleting.value = true
  try {
    await $fetch(`/api/notes/${id.value}`, { method: 'DELETE' })
    await navigateTo('/notes')
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || 'Delete failed'
  } finally {
    deleting.value = false
  }
}

watch(id, () => load())
onMounted(() => load())
</script>
