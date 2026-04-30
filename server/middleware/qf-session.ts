import { getCookie, setCookie } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { getQfOAuthConfig, getQfEnvKey } from '~/server/utils/qfOAuthConfig'

function getEnvCookiePrefix(): string {
  return `qf_${getQfEnvKey()}_`
}

export default defineEventHandler(async (event) => {
  const path = event.path
  if (path.startsWith('/api/qf/oauth') || path.startsWith('/_nuxt') || path.startsWith('/__nuxt')) {
    return
  }
  
  const envPrefix = getEnvCookiePrefix()
  const existingToken = getCookie(event, `${envPrefix}access_token`)
  if (existingToken) {
    return
  }
  
  const supabase = await serverSupabaseClient(event)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return
  }
  
  const env = getQfEnvKey()
  
  const { data: connection } = await supabase
    .from('qf_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('env', env)
    .single()
  
  if (!connection || !connection.refresh_token) {
    return
  }
  
  try {
    const config = getQfOAuthConfig()
    
    const params = new URLSearchParams()
    params.set('grant_type', 'refresh_token')
    params.set('refresh_token', connection.refresh_token)
    
    const tokens = await $fetch(`${config.authBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
      },
      body: params.toString()
    })
    
    if (!tokens.access_token) {
      return
    }
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/'
    }
    
    setCookie(event, `${envPrefix}access_token`, tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in
    })
    
    if (tokens.refresh_token) {
      setCookie(event, `${envPrefix}refresh_token`, tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30
      })
      
      await supabase
        .from('qf_connections')
        .update({
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          last_synced_at: new Date().toISOString()
        })
        .eq('id', connection.id)
    }
    
    event.context.qfTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || connection.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000
    }
  } catch (err: any) {
    console.error('[QF Session] Auto-restore failed:', err.message)
  }
})
