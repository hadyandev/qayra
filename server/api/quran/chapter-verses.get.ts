import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

interface VersePreview {
  key: string
  text: string
  translation: string
}

const cache = new Map<string, { data: VersePreview[]; time: number }>()
const CACHE_DURATION = 60000 * 5 // 5 minutes

export default defineEventHandler(async (event) => {
  const chapterId = parseInt(getQuery(event).chapterId as string)

  if (!chapterId || chapterId < 1 || chapterId > 114) {
    return { verses: [], error: 'Invalid chapter' }
  }

  const cacheKey = `chapter-${chapterId}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return { verses: cached.data, error: null }
  }

  try {
    const data = await qfFetchJson<{
      verses?: Record<string, unknown>[]
    }>(
      `/content/api/v4/verses/by_chapter/${chapterId}`,
      {
        translations: '85',
        fields: 'verse_key,text_uthmani,translations'
      },
      'content'
    )

    const list = data.verses || []
    const verses: VersePreview[] = list.map((v: Record<string, unknown>) => {
      const translationsRaw = (v.translations as Record<string, unknown>[]) || []
      const translation = translationsRaw.length > 0
        ? String(translationsRaw[0].text ?? '').replace(/<[^>]*>/g, '')
        : ''

      return {
        key: String(v.verse_key || ''),
        text: String(v.text_uthmani || ''),
        translation
      }
    })

    cache.set(cacheKey, { data: verses, time: Date.now() })

    return { verses, error: null }
  } catch (error: any) {
    console.error(`[QF Chapter Verses] Error for chapter ${chapterId}:`, error?.message)
    return { verses: [], error: error?.message || 'Failed to fetch verses' }
  }
})
