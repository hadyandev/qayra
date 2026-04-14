import { serverSupabaseClient } from '#supabase/server'
import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const client = await serverSupabaseClient(event)

  const { error } = await client.from('notes').delete().eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
