<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold">Notes</h1>
      <UButton to="/notes/new" color="emerald" icon="i-heroicons-plus">New note</UButton>
    </div>

    <div class="flex flex-wrap gap-3 items-end">
      <UInput v-model="filters.q" placeholder="Search notes…" class="max-w-xs" @keyup.enter="runSearch" />
      <UInput v-model="filters.tag" placeholder="Tag" class="w-32" />
      <UInput v-model="filters.source" placeholder="Source" class="w-36" />
      <UInput v-model="filters.from" type="date" />
      <UInput v-model="filters.to" type="date" />
      <UButton variant="soft" @click="runSearch">Search</UButton>
      <UButton variant="ghost" @click="clearFilters">Clear</UButton>
    </div>

    <UAlert v-if="error" color="red" :title="error" />

    <div v-if="pending" class="text-center py-12 text-stone-500">Loading…</div>
    <div v-else-if="notes.length === 0" class="text-center py-12 text-stone-500">
      No notes yet.
      <NuxtLink to="/notes/new" class="text-emerald-600 hover:underline ml-1">Create one</NuxtLink>
    </div>
    <ul v-else class="space-y-3">
      <li v-for="n in notes" :key="n.id">
        <UCard class="cursor-pointer hover:shadow-md" @click="navigateTo(`/notes/${n.id}`)">
          <div class="flex justify-between gap-2">
            <div>
              <h2 class="font-semibold">{{ n.title || 'Untitled' }}</h2>
              <p class="text-sm text-stone-500">
                {{ formatDate(n.note_date, n.created_at) }}
                <span v-if="n.source"> · {{ n.source }}</span>
              </p>
            </div>
            <div v-if="n.tags?.length" class="flex flex-wrap gap-1 justify-end">
              <UBadge v-for="t in n.tags" :key="t" size="xs" color="emerald" variant="subtle">{{ t }}</UBadge>
            </div>
          </div>
        </UCard>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

type NoteRow = {
  id: string
  title: string | null
  note_date: string | null
  created_at: string
  source: string | null
  tags: string[] | null
}

const notes = ref<NoteRow[]>([])
const pending = ref(true)
const error = ref('')
const filters = reactive({
  q: '',
  tag: '',
  source: '',
  from: '',
  to: ''
})

function formatDate(noteDate: string | null, created: string) {
  if (noteDate) return noteDate
  return new Date(created).toLocaleDateString()
}

async function load() {
  pending.value = true
  error.value = ''
  try {
    const hasSearch =
      filters.q.trim() ||
      filters.tag.trim() ||
      filters.source.trim() ||
      filters.from ||
      filters.to

    if (hasSearch) {
      const { notes: rows } = await $fetch<{ notes: NoteRow[] }>('/api/search/notes', {
        query: {
          q: filters.q.trim() || undefined,
          tag: filters.tag.trim() || undefined,
          source: filters.source.trim() || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined
        }
      })
      notes.value = rows ?? []
    } else {
      const { notes: rows } = await $fetch<{ notes: NoteRow[] }>('/api/notes')
      notes.value = rows ?? []
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to load notes'
    notes.value = []
  } finally {
    pending.value = false
  }
}

function runSearch() {
  load()
}

function clearFilters() {
  filters.q = ''
  filters.tag = ''
  filters.source = ''
  filters.from = ''
  filters.to = ''
  load()
}

onMounted(() => load())
</script>
