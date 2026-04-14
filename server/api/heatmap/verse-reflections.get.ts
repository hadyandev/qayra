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
  const query = getQuery(event)
  const verseKey = (query.verse as string) || ''

  if (!verseKey) {
    return { reflections: [], error: 'Verse key is required' }
  }

  const { data: noteIds, error: linkError } = await client
    .from('note_verses')
    .select('note_id')
    .eq('verse_key', verseKey)

  if (linkError) {
    throw createError({ statusCode: 500, statusMessage: linkError.message })
  }

  if (!noteIds || noteIds.length === 0) {
    return { reflections: [], error: null }
  }

  const noteIdList = noteIds.map(n => n.note_id)

  const { data: notes, error: notesError } = await client
    .from('notes')
    .select('id, title, content, source, speaker, tags, created_at, updated_at')
    .in('id', noteIdList)
    .order('created_at', { ascending: false })

  if (notesError) {
    throw createError({ statusCode: 500, statusMessage: notesError.message })
  }

  const reflections = (notes ?? []).map(note => ({
    id: note.id,
    title: note.title,
    preview: truncate(stripHtml(note.content)),
    source: note.source,
    speaker: note.speaker,
    tags: note.tags,
    created_at: note.created_at,
    updated_at: note.updated_at
  }))

  return { reflections, error: null }
})
