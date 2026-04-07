interface SearchResult {
  id: number
  text: string
  verse_key: string
  surah_name: string
  translation?: string
}

interface VerseData {
  id: number
  verse_key: string
  text_uthmani: string
  text_imlaei: string
  translations: { text: string; resource_name: string }[]
  surah: {
    id: number
    name_complex: string
    name_simple: string
    name_arabic: string
  }
}

export const useQuran = () => {
  const search = async (q: string): Promise<SearchResult[]> => {
    if (!q || q.trim().length < 2) {
      return []
    }

    try {
      const response: any = await $fetch('/api/quran/search', {
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

  const verse = async (key: string): Promise<VerseData | null> => {
    if (!key) {
      return null
    }

    try {
      const response: any = await $fetch('/api/quran/verse', {
        query: { key: key }
      })

      if (response.error) {
        console.error('Verse error:', response.error)
        return null
      }

      return response.verse || response
    } catch (error) {
      console.error('Verse fetch error:', error)
      return null
    }
  }

  return { search, verse }
}
