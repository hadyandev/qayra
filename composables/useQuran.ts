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

// Simple composable that calls server-side API endpoints
// The server handles all Quran Foundation SDK authentication
export const useQuran = () => {
  // Get list of all Surah/Chapters - uses Content API (no special scope needed)
  const chapters = async (): Promise<Chapter[]> => {
    try {
      const response: any = await $fetch('/api/quran/chapters')

      if (response.error) {
        console.error('Chapters error:', response.error)
        return []
      }

      return response.chapters || []
    } catch (error) {
      console.error('Chapters fetch error:', error)
      return []
    }
  }

  // Get verse data - uses Content API (no special scope needed)
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

      return response.verse || null
    } catch (error) {
      console.error('Verse fetch error:', error)
      return null
    }
  }

  // NOTE: Search API requires special OAuth2 scope that needs approval
  // Keeping this commented out until scope is approved
  // const search = async (q: string): Promise<any[]> => { ... }

  return { chapters, verse }
}
