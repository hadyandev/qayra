import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const key = query.key as string

  if (!key) {
    return {
      error: 'Verse key is required (e.g., 2:255)',
      verse: null
    }
  }

  const config = useRuntimeConfig()
  const apiKey = config.qfApiKey

  try {
    // Fetch verse with translation
    const response = await $fetch(`https://api.quran.foundation/verses/by_key/${key}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
        'Accept': 'application/json',
      } as Record<string, string>,
      query: {
        translations: '131' // Default to English (Saheeh International)
      }
    })

    return response
  } catch (error: any) {
    console.error('QF Verse Error:', error)
    return {
      error: 'Failed to fetch verse from Quran Foundation',
      details: error.message || 'Unknown error',
      verse: null
    }
  }
})
