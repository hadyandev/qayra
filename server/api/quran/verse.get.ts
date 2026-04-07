import { defineEventHandler, getQuery } from 'h3'
import { QuranClient, Language } from '@quranjs/api'

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
  const key = getQuery(event).key as string

  if (!key) {
    return {
      error: 'Verse key is required',
      verse: null
    }
  }

  try {
    const quranClient = getQuranClient()
    
    // Fetch verse by key using SDK
    const verse = await quranClient.verses.findByKey(key, {
      language: Language.ENGLISH,
      includeTranslation: true
    })

    return {
      verse,
      key
    }
  } catch (error: any) {
    console.error('QF Verse Error:', error)
    return {
      error: error.message || 'Failed to fetch verse',
      verse: null,
      key
    }
  }
})
