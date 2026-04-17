import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const tafsirId = getQuery(event).tafsir_id as string || '167'

  if (!key) {
    return { error: 'Verse key is required', tafsir: null }
  }

  try {
    const path = `/content/api/v4/verses/by_key/${encodeURIComponent(key)}/tafsirs/${tafsirId}`
    const data = await qfFetchJson<{
      verse?: Record<string, unknown>
    }>(path, undefined, 'content')

    const verse = data.verse
    if (!verse) {
      return { error: 'Tafsir not found', tafsir: null }
    }

    return {
      tafsir: {
        text: verse.text || null,
        language: verse.language || 'en',
        resourceName: verse.resource_name || verse.resourceName || 'Tafsir'
      },
      error: null
    }
  } catch (error: any) {
    console.error('Tafsir API Error:', error?.message || error)
    return {
      error: null,
      tafsir: null
    }
  }
})