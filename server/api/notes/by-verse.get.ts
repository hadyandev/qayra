import { serverSupabaseClient } from '#supabase/server'
import { getQuery } from 'h3'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractVerseReflectionsFromNote(content: string, verseKey: string): string[] {
  const plainText = stripHtml(content)
  const results: string[] = []
  
  const versePattern = `@${verseKey}`
  let searchStart = 0
  
  while (true) {
    const idx = plainText.indexOf(versePattern, searchStart)
    if (idx === -1) break
    
    const afterPattern = plainText.substring(idx)
    const matchResult = afterPattern.match(/^@[\d:]+\s*=>\s*"([^"]*)"/)
    if (matchResult && matchResult[1]) {
      const reflection = matchResult[1].trim()
      if (reflection.length > 0) {
        results.push(reflection)
      }
    }
    
    searchStart = idx + 1
  }
  
  return results
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
    return { reflections: [], error: null, verseKey }
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

  const allReflections: Array<{
    noteId: string
    noteTitle: string | null
    reflection: string
    source: string | null
    speaker: string | null
    tags: string[]
    created_at: string
  }> = []

  for (const note of notes ?? []) {
    const reflections = extractVerseReflectionsFromNote(note.content, verseKey)
    
    if (reflections.length > 0) {
      for (const reflection of reflections) {
        allReflections.push({
          noteId: note.id,
          noteTitle: note.title,
          reflection,
          source: note.source,
          speaker: note.speaker,
          tags: note.tags || [],
          created_at: note.created_at
        })
      }
    }
  }

  return { 
    reflections: allReflections, 
    error: null,
    verseKey,
    debug: { 
      notesFound: notes?.length || 0,
      reflectionsPerNote: notes?.map(n => ({
        noteId: n.id,
        contentLength: n.content.length,
        extracted: extractVerseReflectionsFromNote(n.content, verseKey).length
      })) || []
    }
  }
})
