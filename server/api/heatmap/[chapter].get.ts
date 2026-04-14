import { serverSupabaseClient } from '#supabase/server'
import { getQuery } from 'h3'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function truncate(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const chapterId = parseInt(event.context.params?.chapter || '1')

  const { data: chapter, error: chapterError } = await client
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single()

  if (chapterError) {
    throw createError({ statusCode: 404, statusMessage: 'Chapter not found' })
  }

  const { data: verseLinks, error: linksError } = await client
    .from('note_verses')
    .select('verse_key, note_id')

  if (linksError) {
    throw createError({ statusCode: 500, statusMessage: linksError.message })
  }

  const verseNoteMap: Record<string, string[]> = {}
  for (const link of verseLinks ?? []) {
    if (!verseNoteMap[link.verse_key]) {
      verseNoteMap[link.verse_key] = []
    }
    verseNoteMap[link.verse_key].push(link.note_id)
  }

  const verses: Array<{
    number: number
    key: string
    hasReflection: boolean
    reflectionCount: number
  }> = []

  for (let v = 1; v <= chapter.verse_count; v++) {
    const key = `${chapterId}:${v}`
    const noteIds = verseNoteMap[key] || []
    verses.push({
      number: v,
      key,
      hasReflection: noteIds.length > 0,
      reflectionCount: noteIds.length
    })
  }

  return {
    chapter: {
      id: chapter.id,
      name_simple: chapter.name_simple,
      name_complex: chapter.name_complex,
      name_arabic: chapter.name_arabic,
      transliteration: chapter.transliteration,
      verse_count: chapter.verse_count,
      chapter_type: chapter.chapter_type
    },
    verses
  }
})
