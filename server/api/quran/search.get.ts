import { defineEventHandler, getQuery } from 'h3'
import { QuranClient, SearchMode, Language } from '@quranjs/api'

// Global client instance (cached across requests)
let client: QuranClient | null = null

function getQuranClient(): QuranClient {
  if (!client) {
    const config = useRuntimeConfig()
    client = new QuranClient({
      clientId: config.qfClientId as string,
      clientSecret: config.qfClientSecret as string,
      defaults: {
        language: Language.ENGLISH
      }
    })
  }
  return client
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event).q as string

  if (!q || q.trim().length < 2) {
    return {
      results: [],
      error: 'Query too short (minimum 2 characters)'
    }
  }

  try {
    const quranClient = getQuranClient()
    
    const results = await quranClient.search.search(q.trim(), {
      mode: SearchMode.Quick,
      language: Language.ENGLISH
    })

    return {
      results: results.results || [],
      total: results.total,
      query: q.trim()
    }
  } catch (error: any) {
    console.error('QF Search Error:', error)
    return {
      error: error.message || 'Failed to search Quran',
      results: [],
      query: q.trim()
    }
  }
})
