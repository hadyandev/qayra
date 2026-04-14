import { serverSupabaseClient } from '#supabase/server'
import { readBody } from 'h3'
import { createError } from 'h3'
import { extractVerseKeysFromContent } from '../../utils/extractVerseKeys'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const {
    data: { user },
  } = await client.auth.getUser()

  const body = await readBody<{
    title?: string
    content?: string
    source?: string
    speaker?: string
    note_date?: string
    tags?: string[]
  }>(event)

  const content = body.content ?? ''
  const { data: note, error } = await client
    .from('notes')
    .insert({
      user_id: user?.id ?? null,
      title: body.title ?? '',
      content,
      source: body.source ?? null,
      speaker: body.speaker ?? null,
      note_date: body.note_date ?? null,
      tags: body.tags ?? []
    })
    .select()
    .single()

  if (error || !note) {
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Insert failed' })
  }

  const keys = extractVerseKeysFromContent(content)
  if (keys.length) {
    const { error: vErr } = await client.from('note_verses').insert(
      keys.map((verse_key) => ({ note_id: note.id, verse_key }))
    )
    if (vErr) {
      console.error('note_verses insert:', vErr)
    }
  }

  return { note }
})
