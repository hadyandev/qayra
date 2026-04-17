import { serverSupabaseClient } from '#supabase/server'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ name: string; makeGlobal?: boolean }>(event)
  const name = body.name?.trim()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Speaker name is required' })
  }

  const isGlobal = body.makeGlobal === true

  const { data: speaker, error } = await client
    .from('speakers')
    .upsert(
      { user_id: user.id, name, is_global: isGlobal },
      { onConflict: 'user_id,name' }
    )
    .select('id, name, is_global')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { speaker }
})
