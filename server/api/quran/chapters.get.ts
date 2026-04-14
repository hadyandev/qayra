import { qfFetchJson } from '../../utils/qfHttp'

function mapChapter(raw: Record<string, unknown>) {
  const translatedName = raw.translatedName as Record<string, string> | undefined
  return {
    id: Number(raw.id),
    name_simple: String(raw.nameSimple ?? raw.name_simple ?? ''),
    name_complex: String(raw.nameComplex ?? raw.name_complex ?? ''),
    name_arabic: String(raw.nameArabic ?? raw.name_arabic ?? ''),
    translated_name: translatedName?.name ?? '',
    verses_count: Number(raw.versesCount ?? raw.verses_count ?? 0),
    revelation_place: String(raw.revelationPlace ?? raw.revelation_place ?? '')
  }
}

export default defineEventHandler(async () => {
  try {
    const data = await qfFetchJson<{
      chapters?: Record<string, unknown>[]
      result?: Record<string, unknown>[]
    }>(
      '/content/api/v4/chapters',
      undefined,
      'content'
    )

    const list = data.chapters || data.result || []

    if (!Array.isArray(list)) {
      console.error('QF chapters unexpected shape', JSON.stringify(data).slice(0, 200))
      return { chapters: [], error: 'Unexpected chapters response' }
    }

    return { chapters: list.map(mapChapter) }
  } catch (error: any) {
    console.error('Chapters API error:', error)
    return {
      chapters: [],
      error: error?.message || 'Failed to load surah list'
    }
  }
})
