interface Chapter {
  id: number
  name_simple: string
  name_complex: string
  name_arabic: string
  translated_name: string
  verses_count: number
  revelation_place: string
}

interface VerseData {
  id: number
  verse_key: string
  text: string
  text_uthmani: string
  text_imlaei: string
  translations: { text: string; resource_name: string }[]
  surah: {
    id: number
    name_complex: string
    name_simple: string
    name_arabic: string
  } | null
}

export const useQuran = () => {
  const chapters = async (): Promise<Chapter[]> => {
    try {
      console.log('[useQuran] Fetching chapters from /api/quran/chapters...')
      const response = await $fetch<{ chapters?: Chapter[]; error?: string }>('/api/quran/chapters')
      if (response.error) {
        console.error('[useQuran] Chapters error:', response.error)
        return []
      }
      console.log('[useQuran] Got chapters:', response.chapters?.length || 0)
      return response.chapters || []
    } catch (error) {
      console.error('[useQuran] Chapters fetch error:', error)
      return []
    }
  }

  const verse = async (key: string): Promise<VerseData | null> => {
    if (!key) return null
    try {
      const response = await $fetch<{ verse?: VerseData; error?: string }>('/api/quran/verse', {
        query: { key }
      })
      if (response.error) {
        console.error('Verse error:', response.error)
        return null
      }
      return response.verse || null
    } catch (error) {
      console.error('Verse fetch error:', error)
      return null
    }
  }

  const search = async (q: string): Promise<unknown[]> => {
    if (!q?.trim()) return []
    try {
      const response = await $fetch<{ results?: unknown[]; error?: string }>('/api/quran/search', {
        query: { q: q.trim() }
      })
      if (response.error) {
        console.error('Search error:', response.error)
        return []
      }
      return response.results || []
    } catch (error) {
      console.error('Search fetch error:', error)
      return []
    }
  }

  return { chapters, verse, search }
}
