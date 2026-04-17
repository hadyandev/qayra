import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const keys = getQuery(event).keys as string

  if (!keys) {
    return { verses: [], error: 'Verse keys required' }
  }

  const verseKeys = keys.split(',').filter(k => k.includes(':'))
  
  try {
    const verses: Array<{
      verse_key: string
      text_uthmani: string
      translations: Array<{ text: string; resource_name: string }>
    }> = []
    
    // Fetch each verse individually (QF doesn't support bulk by keys)
    const translationIds = '85'
    
    for (const key of verseKeys.slice(0, 20)) { // Limit to 20
      try {
        const data = await qfFetchJson<{
          verse?: Record<string, unknown>
        }>(
          `/content/api/v4/verses/by_key/${encodeURIComponent(key)}`,
          { translations: translationIds, fields: 'verse_key,text_uthmani,translations' },
          'content'
        )
        
        if (data.verse) {
          const v = data.verse
          const translationsRaw = (v.translations as Record<string, unknown>[]) || []
          verses.push({
            verse_key: String(v.verse_key || key),
            text_uthmani: String(v.text_uthmani || ''),
            translations: translationsRaw.map(t => ({
              text: String(t.text ?? ''),
              resource_name: String(t.resource_name ?? '')
            }))
          })
        }
      } catch {
        // Skip failed verses
      }
    }

    return { verses, error: null }
  } catch (err: unknown) {
    const error = err as { message?: string }
    return { verses: [], error: error?.message || 'Failed to fetch verses' }
  }
})