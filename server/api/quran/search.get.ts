import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string

  if (!q || q.trim().length < 2) {
    return {
      error: 'Query must be at least 2 characters',
      results: []
    }
  }

  const config = useRuntimeConfig()
  const apiKey = config.qfApiKey

  try {
    const response = await $fetch('https://api.quran.foundation/search', {
      method: 'GET',
      headers: {
        'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
        'Accept': 'application/json',
      } as Record<string, string>,
      query: {
        q: q.trim(),
        limit: '10'
      }
    })

    return response
  } catch (error: any) {
    console.error('QF Search Error:', error)
    return {
      error: 'Failed to fetch from Quran Foundation',
      details: error.message || 'Unknown error',
      results: []
    }
  }
})
