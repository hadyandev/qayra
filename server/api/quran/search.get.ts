import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q as string

  if (!q?.trim()) {
    return { error: 'Query parameter "q" is required', results: [] }
  }

  try {
    const data = await qfFetchJson<{
      search?: {
        results?: unknown[]
        query?: string
        totalResults?: number
      }
    }>(`/search/v1/search`, { query: q }, 'search')

    const results = data.search?.results ?? (data as any).results ?? []
    return { results, error: null }
  } catch (error: any) {
    console.error('Search API Error:', error?.message || error)
    return {
      error: error?.message || 'Search failed',
      results: []
    }
  }
})
