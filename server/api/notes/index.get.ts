import { serverSupabaseClient } from '#supabase/server'
import { createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  const { data: { user } } = await client.auth.getUser()
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized - please sign in' })
  }

  const query = getQuery(event)
  const source = (query.source as string) || undefined
  const tag = (query.tag as string) || undefined
  const from = (query.from as string) || undefined
  const to = (query.to as string) || undefined

  let q = client
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('note_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (source) q = q.eq('source', source)
  if (tag) q = q.contains('tags', [tag])
  if (from) q = q.gte('note_date', from)
  if (to) q = q.lte('note_date', to)

  const { data, error } = await q

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { notes: data ?? [] }
})
