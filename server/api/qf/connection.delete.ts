import { getCookie, deleteCookie, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { getQfOAuthConfig, getQfEnvKey } from '~/server/utils/qfOAuthConfig'
import { $fetch } from 'ofetch'

function getEnvCookiePrefix(): string {
  return `qf_${getQfEnvKey()}_`
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const env = getQfEnvKey()
  
  const { data: connection } = await supabase
    .from('qf_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('env', env)
    .single()
  
  if (!connection) {
    return { success: false, error: 'No QF connection found' }
  }
  
  try {
    const config = getQfOAuthConfig()
    
    await $fetch(`${config.authBaseUrl}/oauth2/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
      },
      body: `token=${connection.refresh_token}`
    })
  } catch (err: any) {
    console.error('[QF OAuth] Token revoke failed:', err.message)
  }
  
  await supabase
    .from('qf_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('env', env)
  
  const envPrefix = getEnvCookiePrefix()
  deleteCookie(event, `${envPrefix}access_token`)
  deleteCookie(event, `${envPrefix}refresh_token`)
  
  return { success: true }
})
