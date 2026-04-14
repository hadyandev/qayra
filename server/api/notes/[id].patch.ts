import { serverSupabaseClient } from '#supabase/server'
import { createError, getRouterParam, readBody } from 'h3'
import { extractVerseKeysFromContent } from '../../utils/extractVerseKeys'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const client = await serverSupabaseClient(event)

  const body = await readBody<{
    title?: string
    content?: string
    source?: string
    speaker?: string
    note_date?: string | null
    tags?: string[]
  }>(event)

  const patch: Record<string, unknown> = {}
  if (body.title !== undefined) patch.title = body.title
  if (body.content !== undefined) patch.content = body.content
  if (body.source !== undefined) patch.source = body.source
  if (body.speaker !== undefined) patch.speaker = body.speaker
  if (body.note_date !== undefined) patch.note_date = body.note_date
  if (body.tags !== undefined) patch.tags = body.tags

  const { data: note, error } = await client
    .from('notes')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!note) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const content = body.content !== undefined ? body.content : note.content
  const keys = extractVerseKeysFromContent(String(content))
  await client.from('note_verses').delete().eq('note_id', id)
  if (keys.length) {
    await client.from('note_verses').insert(keys.map((verse_key) => ({ note_id: id, verse_key })))
  }

  return { note }
})
