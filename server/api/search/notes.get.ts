import { serverSupabaseClient } from '#supabase/server'
import { createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)
  const q = (query.q as string) || null
  const tag_filter = (query.tag as string) || null
  const source_filter = (query.source as string) || null
  const date_from = (query.from as string) || null
  const date_to = (query.to as string) || null

  const { data, error } = await client.rpc('search_user_notes', {
    q,
    tag_filter,
    source_filter,
    date_from: date_from || null,
    date_to: date_to || null
  })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { notes: data ?? [] }
})
