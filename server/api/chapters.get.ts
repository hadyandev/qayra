import { qfFetchJson } from '../utils/qfHttp'

export default defineEventHandler(async () => {
  try {
    const data = await qfFetchJson<{
      chapters?: Record<string, unknown>[]
      result?: Record<string, unknown>[]
    }>('/content/api/v4/chapters', undefined, 'content')

    const list = data.chapters || data.result || []

    if (!Array.isArray(list)) {
      return { chapters: [], error: 'Unexpected chapters response' }
    }

    const chapters = list.map((raw) => ({
      id: Number(raw.id),
      name_simple: String(raw.nameSimple ?? raw.name_simple ?? ''),
      name_arabic: String(raw.nameArabic ?? raw.name_arabic ?? ''),
      verse_count: Number(raw.versesCount ?? raw.verses_count ?? 0),
      transliteration: String(raw.transliteration ?? '') || undefined
    }))

    return { chapters }
  } catch (error: any) {
    console.error('Chapters API error:', error)
    return {
      chapters: [],
      error: error?.message || 'Failed to load surah list'
    }
  }
})
