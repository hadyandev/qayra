import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

function parseTranslationIds(config: ReturnType<typeof useRuntimeConfig>): number[] {
  const raw = (config.qfTranslationIds as string) || '20'
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n))
}

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const config = useRuntimeConfig()

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

  try {
    const translationIds = parseTranslationIds(config)
    const path = `/content/api/v4/verses/by_key/${encodeURIComponent(key)}`
    const data = await qfFetchJson<Record<string, unknown>>(
      path,
      {
        translations: translationIds.join(',')
      },
      'content'
    )

    const verse = (data.verse ?? data) as Record<string, unknown>
    if (!verse || verse.verseKey == null) {
      return { error: 'Verse not found', verse: null }
    }

    const translationsRaw = (verse.translations as Record<string, unknown>[]) || []
    const translations = translationsRaw.map((t) => ({
      text: String(t.text ?? ''),
      resource_name: String(t.resourceName ?? t.resource_name ?? '')
    }))

    const surahRaw = (verse.chapter ?? verse.surah) as Record<string, unknown> | undefined

    const arabic = String(
      verse.textUthmani ?? verse.text_uthmani ?? verse.text ?? ''
    )
    return {
      verse: {
        id: verse.id,
        verse_key: String(verse.verseKey ?? verse.verse_key ?? key),
        text: arabic,
        text_uthmani: arabic,
        text_imlaei: String(verse.textImlaei ?? verse.text_imlaei ?? ''),
        translations,
        surah: surahRaw
          ? {
              id: Number(surahRaw.id),
              name_complex: String(surahRaw.nameComplex ?? surahRaw.name_complex ?? ''),
              name_simple: String(surahRaw.nameSimple ?? surahRaw.name_simple ?? ''),
              name_arabic: String(surahRaw.nameArabic ?? surahRaw.name_arabic ?? '')
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
