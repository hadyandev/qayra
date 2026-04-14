import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const { data: existing } = await supabase
    .from('reflections')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing || existing.user_id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Can only update own reflections'
    })
  }

  const { data, error } = await supabase
    .from('reflections')
    .update({ content: body.content })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update reflection: ${error.message}`
    })
  }

  return { data }
})
