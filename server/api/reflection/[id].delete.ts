import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Get auth header
  const authHeader = getHeader(event, 'authorization')
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    supabase.auth.setSession({ access_token: token, refresh_token: '' })
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Verify ownership
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

  // Delete reflection
  const { error } = await supabase
    .from('reflections')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete reflection: ${error.message}`
    })
  }

  return { success: true }
})