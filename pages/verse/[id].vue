
<template>
  <div class="p-4">
    <h2>{{ id }}</h2>
    <p>{{ verse }}</p>

    <UTextarea v-model="text" placeholder="Reflect..." />
    <UCheckbox v-model="publish">Publish</UCheckbox>

    <UButton @click="save">Save</UButton>

    <div v-for="r in list" :key="r.id">
      - {{ r.content }}
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id

const verse = ref("Loading...")
const text = ref("")
const publish = ref(false)
const list = ref([])

const load = async () => {
  const supabase = useSupabase()
  const { data } = await supabase.from('reflections').select('*').eq('verse_key', id)
  list.value = data || []
}

onMounted(() => {
  verse.value = "TODO fetch QF"
  load()
})

const save = async () => {
  await $fetch('/api/reflection', {
    method: 'POST',
    body: {
      verse_key: id,
      content: text.value,
      publish: publish.value
    }
  })
  text.value = ''
  load()
}
</script>
