import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q as string

  if (!q?.trim()) {
    return { error: 'Query parameter "q" is required', results: [] }
  }

  let results: unknown[] = []

  try {
    const data = await qfFetchJson<{
      search?: { results?: unknown[] }
      results?: unknown[]
    }>(`/search/v1/search`, { query: q }, 'search')

    results = data.search?.results ?? data.results ?? []
  } catch (error: any) {
    console.warn('Search API Error:', error?.message || error)
  }

  // Fallback to QuranJs SDK
  if (results.length === 0) {
    try {
      const qjs = await import('@quranjs/api')
      const rawRes = await qjs.quran.search.getSearchResults({ q, language: 'en' })
      if (rawRes?.results) {
         results = (rawRes.results as any[]).map((r: any) => ({
           verseKey: r.verse_key,
           text: r.text || r.translated_text || r.content,
           surahName: r.surahName || ''
         }))
      }
    } catch (e: any) {
      console.error('QuranJS fallback search failed:', e?.message || e)
    }
  }

  return { results, error: results.length === 0 ? 'No results found' : null }
})
