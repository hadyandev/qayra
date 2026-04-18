import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

const surahInfo: Record<number, { name_simple: string; name_complex: string; name_arabic: string; verses_count: number; revelation_place: string }> = {
  1: { name_simple: 'Al-Fatihah', name_complex: 'Al-Fātihah', name_arabic: 'ٱلْفَاتِحَة', verses_count: 7, revelation_place: 'Mecca' },
  2: { name_simple: 'Al-Baqarah', name_complex: 'Al-Baqarah', name_arabic: 'ٱلْبَقَرَة', verses_count: 286, revelation_place: 'Medina' }
}

function getSurahInfo(chapterId: number) {
  return surahInfo[chapterId] || null
}

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const config = useRuntimeConfig()

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

  const keyParts = key.split(':')
  const chapterNum = parseInt(keyParts[0], 10) || 1
  const verseNum = keyParts[1] ? parseInt(keyParts[1], 10) : 1

  try {
    const translationIds = (config.qfTranslationIds as string) || '85'
    const path = `/content/api/v4/verses/by_key/${encodeURIComponent(key)}`
    const data = await qfFetchJson<{
      verse?: Record<string, unknown>
    }>(
      path,
      {
        translations: translationIds,
        fields: 'verse_key,text_uthmani,text_imlaei_simple,chapter,verse_number',
        tafsirs: '168,169',
        reciter: '1'
      },
      'content'
    )

    const verse = data.verse
    if (!verse) {
      return { error: 'Verse not found', verse: null }
    }

    // Get chapter info from static map
    const surah = getSurahInfo(chapterNum)
    const chapterNameSimple = surah?.name_simple || 'Chapter ' + chapterNum
    const chapterNameComplex = surah?.name_complex || chapterNameSimple
    const chapterNameArabic = surah?.name_arabic || ''
    const chapterVersesCount = surah?.verses_count || 0
    const revelationPlace = surah?.revelation_place || ''

    // Verse data from API
    const verseNumber = verse.verse_number ? Number(verse.verse_number) : verseNum

    // Translations
    const translationsRaw = (verse.translations as Record<string, unknown>[]) || []
    const translations = translationsRaw.map((t) => ({
      text: String(t.text ?? ''),
      resource_name: String(t.resource_name ?? t.resourceName ?? '')
    }))

    // Tafsir - collect all available
    const tafsirsRaw = (verse.tafsirs as Record<string, unknown>[]) || []
    const tafsirs = tafsirsRaw
      .filter(t => t.text)
      .map(t => ({
        text: String(t.text),
        resourceName: String(t.resource_name ?? t.resourceName ?? 'Tafsir')
      }))

    // Audio
    const audioRaw = verse.audio as Record<string, unknown> | undefined
    let audioUrl: string | null = null
    let reciterName: string | null = null
    if (audioRaw?.url) {
      audioUrl = String(audioRaw.url)
      reciterName = String(audioRaw.reciter_name ?? audioRaw.reciterName ?? '')
    }

    return {
      verse: {
        id: verse.id,
        verse_key: String(verse.verse_key ?? key),
        text: String(verse.text_uthmani ?? verse.text ?? ''),
        text_uthmani: String(verse.text_uthmani ?? ''),
        text_imlaei_simple: String(verse.text_imlaei_simple ?? ''),
        translations,
        tafsirs,
        tafsir: tafsirs.length > 0 ? tafsirs[0] : null,
        audio: audioUrl ? { url: audioUrl, reciter: reciterName } : null,
        chapter_id: chapterNum,
        chapter_name: chapterNameSimple,
        chapter_name_arabic: chapterNameArabic,
        verse_number: verseNumber,
        total_verses: chapterVersesCount,
        revelation_place: revelationPlace,
        surah: surah ? {
          id: chapterNum,
          name_complex: surah.name_complex,
          name_simple: surah.name_simple,
          name_arabic: surah.name_arabic
        } : null
      },
      error: null
    }
  } catch (error: any) {
    console.error('Verse API Error:', error?.message || error)
    return {
      error: error?.message || 'Failed to fetch verse',
      verse: null
    }
  }
})