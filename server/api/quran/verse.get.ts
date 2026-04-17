import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const config = useRuntimeConfig()

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

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

    // Translations
    const translationsRaw = (verse.translations as Record<string, unknown>[]) || []
    const translations = translationsRaw.map((t) => ({
      text: String(t.text ?? ''),
      resource_name: String(t.resource_name ?? t.resourceName ?? '')
    }))

    // Tafsir
    const tafsirsRaw = (verse.tafsirs as Record<string, unknown>[]) || []
    let tafsirText = null
    let tafsirName = null
    for (const t of tafsirsRaw) {
      if (t.text) {
        tafsirText = String(t.text)
        tafsirName = String(t.resource_name ?? t.resourceName ?? 'Tafsir')
        break
      }
    }

    // Audio
    const audioRaw = verse.audio as Record<string, unknown> | undefined
    let audioUrl = null
    let reciterName = null
    if (audioRaw?.url) {
      audioUrl = String(audioRaw.url)
      reciterName = String(audioRaw.reciter_name ?? audioRaw.reciterName ?? '')
    }

    const chapterRaw = verse.chapter as Record<string, unknown> | undefined
    const verseNumber = Number(verse.verse_number ?? 0)

    return {
      verse: {
        id: verse.id,
        verse_key: String(verse.verse_key ?? key),
        text: String(verse.text_uthmani ?? verse.text ?? ''),
        text_uthmani: String(verse.text_uthmani ?? ''),
        text_imlaei_simple: String(verse.text_imlaei_simple ?? ''),
        translations,
        tafsir: tafsirText ? { text: tafsirText, resourceName: tafsirName } : null,
        audio: audioUrl ? { url: audioUrl, reciter: reciterName } : null,
        chapter_id: chapterRaw ? Number(chapterRaw.id) : undefined,
        chapter_name: chapterRaw ? String(chapterRaw.name_simple ?? '') : '',
        chapter_name_arabic: chapterRaw ? String(chapterRaw.name_arabic ?? '') : '',
        verse_number: verseNumber,
        total_verses: chapterRaw ? Number(chapterRaw.verses_count ?? 0) : 0,
        revelation_place: chapterRaw ? String(chapterRaw.revelation_place ?? '') : '',
        surah: chapterRaw
          ? {
              id: Number(chapterRaw.id),
              name_complex: String(chapterRaw.name_complex ?? ''),
              name_simple: String(chapterRaw.name_simple ?? ''),
              name_arabic: String(chapterRaw.name_arabic ?? '')
            }
          : null
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