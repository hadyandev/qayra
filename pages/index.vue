
<template>
  <div class="p-4">
    <UInput v-model="q" placeholder="Search Quran..." />
    <UButton @click="run">Search</UButton>

    <div v-for="r in results" :key="r.id">
      <NuxtLink :to="`/verse/${r.id}`">{{ r.text }}</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const q = ref('')
const results = ref([])

const run = async () => {
  results.value = [{ id: '2:153', text: 'Sample verse' }]
}
</script>
