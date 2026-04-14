import { qfFetchJson } from '../../utils/qfHttp'

function mapChapter(raw: Record<string, unknown>) {
  const translated = raw.translatedName as Record<string, string> | undefined
  return {
    id: Number(raw.id),
    name_simple: (raw.nameSimple ?? raw.name_simple ?? '') as string,
    name_complex: (raw.nameComplex ?? raw.name_complex ?? '') as string,
    name_arabic: (raw.nameArabic ?? raw.name_arabic ?? '') as string,
    translated_name: translated?.name ?? (raw.translated_name as string) ?? '',
    verses_count: Number(raw.versesCount ?? raw.verses_count ?? 0),
    revelation_place: String(raw.revelationPlace ?? raw.revelation_place ?? '')
  }
}

export default defineEventHandler(async () => {
  try {
    const data = await qfFetchJson<Record<string, unknown>>(
      '/content/api/v4/chapters',
      undefined,
      'content'
    )
    const list =
      (data.chapters as Record<string, unknown>[]) ||
      (data.result as Record<string, unknown>[]) ||
      (Array.isArray(data) ? (data as Record<string, unknown>[]) : null)

    if (!list || !Array.isArray(list)) {
      console.error('QF chapters unexpected shape', Object.keys(data || {}))
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
