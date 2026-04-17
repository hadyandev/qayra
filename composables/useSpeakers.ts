export const useSpeakers = () => {
  const speakers = ref<Array<{ id: string; name: string; is_global?: boolean }>>([])
  const loading = ref(false)
  const error = ref('')

  const fetchSpeakers = async () => {
    loading.value = true
    error.value = ''
    try {
      const { speakers: data } = await $fetch<{ speakers: Array<{ id: string; name: string; is_global?: boolean }> }>('/api/speakers')
      speakers.value = data || []
    } catch (e: any) {
      error.value = e?.message || 'Failed to load speakers'
    } finally {
      loading.value = false
    }
  }

  const createSpeaker = async (name: string, makeGlobal = false) => {
    try {
      const { speaker } = await $fetch<{ speaker: { id: string; name: string; is_global?: boolean } }>('/api/speakers', {
        method: 'POST',
        body: { name, makeGlobal }
      })
      if (speaker && !speakers.value.find(s => s.id === speaker.id)) {
        speakers.value.push(speaker)
        speakers.value.sort((a, b) => a.name.localeCompare(b.name))
      }
      return speaker
    } catch (e: any) {
      error.value = e?.message || 'Failed to create speaker'
      return null
    }
  }

  return { speakers, loading, error, fetchSpeakers, createSpeaker }
}
