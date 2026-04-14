import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  const { chapter, limit = 10, offset = 0, exclude } = getQuery(event) as {
    chapter?: string
    limit?: string | number
    offset?: string | number
    exclude?: string
  }

  if (!chapter) {
    return { verses: [], error: 'Chapter is required' }
  }

  const config = useRuntimeConfig()
  const translationIds = (config.qfTranslationIds as string) || '85'
  const numLimit = Math.min(Number(limit) || 10, 50)
  const numOffset = Number(offset) || 0

  try {
    const path = `/content/api/v4/verses/by_chapter/${encodeURIComponent(chapter)}`
    const data = await qfFetchJson<{
      verses?: Record<string, unknown>[]
    }>(
      path,
      {
        translations: translationIds,
        fields: 'verse_key,text_uthmani,translations',
        per_page: numLimit,
        page: Math.floor(numOffset / numLimit) + 1
      },
      'content'
    )

    let verses = (data.verses || []) as Record<string, unknown>[]

    if (exclude) {
      verses = verses.filter((v) => v.verse_key !== exclude)
    }

    const formatted = verses.map((verse) => ({
      verse_key: String(verse.verse_key ?? ''),
      text_uthmani: String(verse.text_uthmani ?? ''),
      translations: ((verse.translations as Record<string, unknown>[]) || []).map((t) => ({
        text: String(t.text ?? ''),
        resource_name: String(t.resource_name ?? '')
      }))
    }))

    return {
      verses: formatted,
      error: null
    }
  } catch (error: any) {
    console.error('Chapter Verses API Error:', error?.message || error)
    return {
      verses: [],
      error: error?.message || 'Failed to fetch chapter verses'
    }
  }
})
