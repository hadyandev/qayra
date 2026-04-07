import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
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

  // Get auth header for user identification
  const authHeader = getHeader(event, 'authorization')
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    supabase.auth.setSession({ access_token: token, refresh_token: '' })
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Insert reflection
  const { data: reflection, error: dbError } = await supabase
    .from('reflections')
    .insert({
      user_id: user?.id || null,
      verse_key: body.verse_key,
      content: body.content,
      is_published: false
    })
    .select()
    .single()

  if (dbError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to save reflection: ${dbError.message}`
    })
  }

  // Handle publishing to Quran Foundation if requested
  if (body.publish && user) {
    const token = getCookie(event, 'qf_token')
    
    if (token) {
      try {
        await $fetch(`${config.public.qfBase}/posts`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: {
            content: body.content,
            verse_key: body.verse_key
          }
        })

        // Update reflection as published
        await supabase
          .from('reflections')
          .update({ 
            is_published: true, 
            published_at: new Date().toISOString() 
          })
          .eq('id', reflection.id)

      } catch (publishError: any) {
        console.error('Failed to publish to QF:', publishError)
        // Don't fail the whole request if publishing fails
      }
    }
  }

  return { data: reflection }
})