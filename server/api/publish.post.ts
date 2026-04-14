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

  const { note_id, snippet, verses } = body

  if (!note_id || !snippet) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'note_id and snippet are required' 
    })
  }

  const qfToken = getCookie(event, 'qf_token')

  if (!qfToken) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Quran Foundation authentication required. Please connect your QF account.' 
    })
  }

  const publishedVerses: string[] = []
  const failedVerses: string[] = []

  for (const verse_key of (verses || [])) {
    try {
      await $fetch(`${config.public.qfBase}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${qfToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          content: snippet,
          verse_key
        }
      })
      publishedVerses.push(verse_key)
    } catch (err) {
      console.error(`Failed to publish verse ${verse_key}:`, err)
      failedVerses.push(verse_key)
    }
  }

  if (publishedVerses.length === 0 && failedVerses.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to publish snippet to any verses'
    })
  }

  return {
    success: true,
    published_verses: publishedVerses,
    failed_verses: failedVerses,
    message: publishedVerses.length > 0 
      ? `Successfully published to ${publishedVerses.length} verse(s)`
      : 'No verses were published'
  }
})
