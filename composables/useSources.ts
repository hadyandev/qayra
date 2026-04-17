export const useSources = () => {
  const sources = ref<Array<{ id: string; name: string; is_global?: boolean }>>([])
  const loading = ref(false)
  const error = ref('')

  const fetchSources = async () => {
    loading.value = true
    error.value = ''
    try {
      const { sources: data } = await $fetch<{ sources: Array<{ id: string; name: string; is_global?: boolean }> }>('/api/sources')
      sources.value = data || []
    } catch (e: any) {
      error.value = e?.message || 'Failed to load sources'
    } finally {
      loading.value = false
    }
  }

  const createSource = async (name: string, makeGlobal = false) => {
    try {
      const { source } = await $fetch<{ source: { id: string; name: string; is_global?: boolean } }>('/api/sources', {
        method: 'POST',
        body: { name, makeGlobal }
      })
      if (source && !sources.value.find(s => s.id === source.id)) {
        sources.value.push(source)
        sources.value.sort((a, b) => a.name.localeCompare(b.name))
      }
      return source
    } catch (e: any) {
      error.value = e?.message || 'Failed to create source'
      return null
    }
  }

  return { sources, loading, error, fetchSources, createSource }
}
