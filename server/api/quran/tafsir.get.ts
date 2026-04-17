import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  if (!key) {
    return { tafsir: null }
  }

  try {
    const path = `/content/api/v4/tafsirs/1/by_ayah/${encodeURIComponent(key)}`
    const data: Record<string, unknown> = await qfFetchJson(path, undefined, 'content')
    
    console.log('[Tafsir] Raw response:', JSON.stringify(data).slice(0, 500))
    
    // Response format: { tafsir: { verses: { "1:1": { text: "..." } }, ... } }
    const tafsirData = data.tafsir as Record<string, unknown> | undefined
    const versesData = tafsirData?.verses as Record<string, { text: string }> | undefined
    const verseData = versesData?.[key]
    
    if (verseData?.text) {
      console.log('[Tafsir] Found:', verseData.text.slice(0, 100))
      return {
        tafsir: {
          text: verseData.text,
          resourceName: String(tafsirData?.resource_name || 'Tafsir')
        }
      }
    }
    
    console.log('[Tafsir] No tafsir found for key:', key)
    return { tafsir: null }
  } catch (err: unknown) {
    console.error('[Tafsir] Error:', err)
    return { tafsir: null }
  }
})