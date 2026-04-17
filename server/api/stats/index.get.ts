import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    // Get chapters
    const { data: chapters } = await client
      .from('chapters')
      .select('*')
      .order('id')

    // Get all note_verses (global - no user filter)
    const { data: verseLinks } = await client
      .from('note_verses')
      .select('verse_key')

    const { data: notes } = await client
      .from('notes')
      .select('id')

    // Calculate verse stats
    const reflectedVerses = new Set(verseLinks?.map(v => v.verse_key) || [])
    const chaptersWithReflections = new Set<string>()

    for (const vk of reflectedVerses) {
      const chapter = vk.split(':')[0]
      chaptersWithReflections.add(chapter)
    }

    return {
      chapters: (chapters || []).map(ch => ({
        id: ch.id,
        name_simple: ch.name_simple,
        name_arabic: ch.name_arabic,
        verse_count: ch.verse_count,
        verses: Array.from({ length: ch.verse_count }, (_, i) => {
          const key = `${ch.id}:${i + 1}`
          return { key, hasReflection: reflectedVerses.has(key) }
        })
      })),
      totalNotes: notes?.length || 0,
      totalVerses: reflectedVerses.size,
      totalChapters: chaptersWithReflections.size
    }
  } catch (e) {
    console.error('Stats API error:', e)
    return { chapters: [], error: 'Failed to load stats' }
  }
})