<template>
  <div class="max-w-4xl mx-auto p-6">
    <NuxtLink to="/" class="text-emerald-600 hover:text-emerald-800 mb-4 inline-block">
      ← Back to search
    </NuxtLink>
    
    <h1 class="text-4xl font-bold text-center mb-2">{{ id }}</h1>
    <p class="text-center text-gray-500 mb-8">Chapter:Verse</p>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading verse...</p>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="red"
      variant="solid"
      class="mb-6"
      :title="'Error loading verse'"
      :description="error"
    />

    <!-- Verse Content -->
    <div v-else-if="verseData" class="space-y-6">
      <!-- Arabic Text -->
      <UCard class="bg-emerald-50">
        <p class="text-3xl font-arabic text-emerald-800 text-center leading-relaxed">
          {{ verseData.text }}
        </p>
      </UCard>

      <!-- Translation -->
      <UCard v-if="translation" class="bg-white">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Translation
        </h3>
        <p class="text-lg text-gray-800 leading-relaxed">
          {{ translation }}
        </p>
      </UCard>

      <!-- Reflection Input -->
      <div class="space-y-4 pt-6 border-t">
        <h3 class="text-xl font-semibold">Your Reflection</h3>
        
        <UTextarea 
          v-model="text" 
          placeholder="What does this verse mean to you? Write your reflection..."
          class="w-full"
          :rows="4"
        />
        
        <div class="flex items-center gap-4">
          <UCheckbox v-model="publish" label="Publish to Quran Foundation" />
        </div>
        
        <UButton 
          @click="save" 
          :loading="saving"
          :disabled="!text.trim() || saving"
          color="emerald"
        >
          {{ saving ? 'Saving...' : 'Save Reflection' }}
        </UButton>
      </div>

      <!-- Previous Reflections -->
      <div v-if="list.length > 0" class="space-y-4 pt-6">
        <h3 class="text-xl font-semibold">Previous Reflections</h3>
        
        <UCard v-for="r in list" :key="r.id" class="bg-gray-50">
          <div v-if="editingId === r.id" class="space-y-3">
            <UTextarea 
              v-model="editContent" 
              :rows="3"
              class="w-full"
            />
            <div class="flex gap-2">
              <UButton 
                @click="saveEdit(r.id)" 
                :loading="savingEdit"
                size="sm"
                color="emerald"
              >
                {{ savingEdit ? 'Saving...' : 'Save' }}
              </UButton>
              <UButton 
                @click="cancelEdit" 
                size="sm"
                variant="ghost"
              >
                Cancel
              </UButton>
            </div>
          </div>
          
          <div v-else>
            <p class="text-gray-800 whitespace-pre-wrap">{{ r.content }}</p>
            <div class="flex items-center justify-between mt-3">
              <p class="text-sm text-gray-500">
                {{ new Date(r.created_at).toLocaleDateString() }}
                <span v-if="r.is_published" class="text-emerald-600 ml-2">✓ Published</span>
              </p>
              <div class="flex gap-2">
                <UButton 
                  @click="startEdit(r)" 
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-pencil-square"
                />
                <UButton 
                  @click="confirmDelete(r.id)" 
                  size="xs"
                  variant="ghost"
                  color="red"
                  icon="i-heroicons-trash"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12 text-gray-500">
      Verse not found.
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const verseData = ref<any>(null)
const translation = ref('')
const loading = ref(true)
const error = ref('')

const text = ref('')
const publish = ref(false)
const saving = ref(false)
const list = ref<Array<{id: string, content: string, created_at: string}>>([])

const editingId = ref<string | null>(null)
const editContent = ref('')
const savingEdit = ref(false)

const { verse } = useQuran()
const supabase = useSupabase()

// Load verse on mount
onMounted(async () => {
  try {
    const result = await verse(id)
    if (result) {
      verseData.value = result
      // Get first translation if available
      if (result.translations?.length > 0) {
        translation.value = result.translations[0].text
      }
    } else {
      error.value = 'Verse not found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load verse'
  } finally {
    loading.value = false
  }
  
  // Load existing reflections
  await loadReflections()
})

const loadReflections = async () => {
  const { data } = await supabase
    .from('reflections')
    .select('*')
    .eq('verse_key', id)
    .order('created_at', { ascending: false })
  
  list.value = data || []
}

const save = async () => {
  if (!text.value.trim()) return
  
  saving.value = true
  try {
    await $fetch('/api/reflection', {
      method: 'POST',
      body: {
        verse_key: id,
        content: text.value,
        publish: publish.value
      }
    })
    
    text.value = ''
    publish.value = false
    await loadReflections()
  } catch (err: any) {
    error.value = err.message || 'Failed to save reflection'
  } finally {
    saving.value = false
  }
}

const startEdit = (reflection: any) => {
  editingId.value = reflection.id
  editContent.value = reflection.content
}

const cancelEdit = () => {
  editingId.value = null
  editContent.value = ''
}

const saveEdit = async (id: string) => {
  if (!editContent.value.trim()) return
  
  savingEdit.value = true
  try {
    await $fetch(`/api/reflection/${id}`, {
      method: 'PUT',
      body: { content: editContent.value }
    })
    
    editingId.value = null
    editContent.value = ''
    await loadReflections()
  } catch (err: any) {
    error.value = err.message || 'Failed to update reflection'
  } finally {
    savingEdit.value = false
  }
}

const confirmDelete = async (id: string) => {
  if (!confirm('Delete this reflection?')) return
  
  try {
    await $fetch(`/api/reflection/${id}`, {
      method: 'DELETE'
    })
    
    await loadReflections()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete reflection'
  }
}
</script>
