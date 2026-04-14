<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">New note</h1>

    <UForm :state="form" class="space-y-4" @submit.prevent="save">
      <UFormGroup label="Title">
        <UInput v-model="form.title" placeholder="Optional" />
      </UFormGroup>
      <UFormGroup label="Source">
        <USelect
          v-model="form.source"
          :options="['kajian', 'khutbah', 'personal', '']"
          placeholder="Optional"
        />
      </UFormGroup>
      <UFormGroup label="Speaker">
        <UInput v-model="form.speaker" placeholder="Optional" />
      </UFormGroup>
      <UFormGroup label="Date">
        <UInput v-model="form.note_date" type="date" />
      </UFormGroup>
      <UFormGroup label="Tags (comma-separated)">
        <UInput v-model="tagsRaw" placeholder="tafsir, ramadan" />
      </UFormGroup>
      <UFormGroup label="Content" required>
        <NoteEditor v-model="form.content" />
      </UFormGroup>
      <div class="flex gap-2">
        <UButton type="submit" color="emerald" :loading="saving">Save</UButton>
        <UButton variant="ghost" to="/notes">Cancel</UButton>
      </div>
    </UForm>

    <UAlert v-if="err" color="red" :title="err" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const form = reactive({
  title: '',
  content: '',
  source: '' as string,
  speaker: '',
  note_date: '' as string
})
const tagsRaw = ref('')
const saving = ref(false)
const err = ref('')

onMounted(() => {
  const v = route.query.verse as string | undefined
  if (v) {
    form.content = `<p>@${v} </p>`
  }
})

async function save() {
  err.value = ''
  saving.value = true
  try {
    const tags = tagsRaw.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
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
