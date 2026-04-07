
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseKey
  )

  const { data } = await supabase.from('reflections').insert({
    verse_key: body.verse_key,
    content: body.content
  }).select().single()

  const token = getCookie(event, 'qf_token')

  if (body.publish && token) {
    await $fetch(`${config.public.qfBase}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        content: body.content,
        verse_key: body.verse_key
      }
    })
  }

  return { data }
})
