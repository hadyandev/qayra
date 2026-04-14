import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
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
      statusMessage: 'Forbidden: Can only delete own reflections'
    })
  }

  const { error } = await supabase.from('reflections').delete().eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete reflection: ${error.message}`
    })
  }

  return { success: true }
})
