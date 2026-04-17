import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    const { data: verseLinks } = await client
      .from('note_verses')
      .select('verse_key')

    const count: Record<string, number> = {}
    for (const link of verseLinks ?? []) {
      count[link.verse_key] = (count[link.verse_key] || 0) + 1
    }

    const sorted = Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }))

    return { verses: sorted }
  } catch (e) {
    console.error('Top verses API error:', e)
    return { verses: [] }
  }
})