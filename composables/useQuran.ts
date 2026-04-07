interface SearchResult {
  id: number
  verse_key: string
  text: string
  highlights?: string[]
}

interface VerseResponse {
  verse: {
    id: number
    verse_key: string
    text: string
    translations?: Array<{
      resource_id: number
      text: string
    }>
  }
}

export const useQuran = () => {
  const config = useRuntimeConfig()
  const qfBase = config.public.qfBase || 'https://api.quran.foundation'

  const search = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []
    
    try {
      const response: any = await $fetch(`${qfBase}/api/v1/search`, {
        params: { q: query },
        headers: {
          'Accept': 'application/json'
        }
      })
      
      return response.results || []
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  const verse = async (key: string): Promise<VerseResponse | null> => {
    try {
      const response: any = await $fetch(`${qfBase}/api/v4/verses/by_key/${key}`, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      return response.verse || null
    } catch (error) {
      console.error('Verse fetch error:', error)
      throw error
    }
  }

  return { search, verse }
}
