import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: chapters, error: chaptersError } = await client
    .from('chapters')
    .select('*')
    .order('id', { ascending: true })

  if (chaptersError) {
    throw createError({ statusCode: 500, statusMessage: chaptersError.message })
  }

  const { data: verseLinks, error: linksError } = await client
    .from('note_verses')
    .select('verse_key')

  if (linksError) {
    throw createError({ statusCode: 500, statusMessage: linksError.message })
  }

  const reflectionCount: Record<string, number> = {}
  for (const link of verseLinks ?? []) {
    reflectionCount[link.verse_key] = (reflectionCount[link.verse_key] || 0) + 1
  }

  const heatmapData = (chapters ?? []).map(chapter => {
    const verses: Array<{ key: string; hasReflection: boolean }> = []
    for (let v = 1; v <= chapter.verse_count; v++) {
      const key = `${chapter.id}:${v}`
      verses.push({
        key,
        hasReflection: (reflectionCount[key] ?? 0) > 0
      })
    }
    const reflectionCountTotal = verses.filter(v => v.hasReflection).length
    return {
      id: chapter.id,
      name_simple: chapter.name_simple,
      name_arabic: chapter.name_arabic,
      verse_count: chapter.verse_count,
      chapter_type: chapter.chapter_type,
      verses,
      reflection_count: reflectionCountTotal
    }
  })

  return { chapters: heatmapData }
})
