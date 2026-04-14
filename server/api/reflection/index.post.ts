import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const supabase = await serverSupabaseClient(event)

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Insert reflection
  const { data: reflection, error: dbError } = await supabase
    .from('reflections')
    .insert({
      user_id: user.id,
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