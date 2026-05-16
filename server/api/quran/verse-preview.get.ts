import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const verseKey = query.verse as string
  
  if (!verseKey || !verseKey.includes(':')) {
    return { error: 'Invalid verse key. Use format: chapter:verse (e.g., 24:1)' }
  }
  
  const [chapter, verse] = verseKey.split(':').map(Number)
  
  if (!chapter || !verse || chapter < 1 || chapter > 114) {
    return { error: 'Invalid verse number' }
  }
  
  try {
    const data = await qfFetchJson<{
      verse: {
        verse_key: string
        text_uthmani: string
        translations?: Array<{ text: string; resource_name: string }>
        tafsirs?: Array<{ text: string; resource_name: string }>
      }
    }>(
      `/content/api/v4/verses/by_key/${verseKey}`,
      {
        translations: '85',
        tafsirs: 'all',
        fields: 'verse_key,text_uthmani,translations,tafsirs'
      },
      'content'
    )
    
    const verseData = data.verse
    
    // Get first translation
    const translation = verseData.translations?.[0]?.text || ''
    
    // Get first tafsir (default)
    const tafsir = verseData.tafsirs?.[0]?.text || ''
    const tafsirSource = verseData.tafsirs?.[0]?.resource_name || ''
    
    return {
      verseKey: verseData.verse_key,
      arabic: verseData.text_uthmani,
      translation: translation,
      tafsir: tafsir,
      tafsirSource: tafsirSource,
      chapter,
      verse
    }
  } catch (err: any) {
    console.error('[Verse Preview] Error:', err.message)
    return { error: 'Failed to load verse preview' }
  }
})