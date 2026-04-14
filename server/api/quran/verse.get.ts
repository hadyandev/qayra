import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const config = useRuntimeConfig()

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

  try {
    const translationIds = (config.qfTranslationIds as string) || '20'
    const path = `/content/api/v4/verses/by_key/${encodeURIComponent(key)}`
    const data = await qfFetchJson<{
      verse?: Record<string, unknown>
    }>(
      path,
      {
        translations: translationIds,
        fields: 'verse_key,text_uthmani,text_imlaei_simple,translations,chapter'
      },
      'content'
    )

    const verse = data.verse
    if (!verse) {
      return { error: 'Verse not found', verse: null }
    }

    const translationsRaw = (verse.translations as Record<string, unknown>[]) || []
    const translations = translationsRaw.map((t) => ({
      text: String(t.text ?? ''),
      resource_name: String(t.resource_name ?? t.resourceName ?? '')
    }))

    const chapterRaw = verse.chapter as Record<string, unknown> | undefined

    return {
      verse: {
        id: verse.id,
        verse_key: String(verse.verse_key ?? key),
        text: String(verse.text_uthmani ?? verse.text ?? ''),
        text_uthmani: String(verse.text_uthmani ?? ''),
        text_imlaei_simple: String(verse.text_imlaei_simple ?? ''),
        translations,
        chapter_id: chapterRaw ? Number(chapterRaw.id) : undefined,
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
