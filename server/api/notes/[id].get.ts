import { serverSupabaseClient } from '#supabase/server'
import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const client = await serverSupabaseClient(event)

  const { data: note, error } = await client
    .from('notes')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!note) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const { data: verses } = await client.from('note_verses').select('verse_key').eq('note_id', id)

  return { note, verse_keys: (verses ?? []).map((v) => v.verse_key) }
})
