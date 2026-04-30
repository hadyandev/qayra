import { readBody, getQuery, getCookie, setCookie, deleteCookie, createError, sendRedirect } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { exchangeAuthorizationCode, decodeIdToken } from '~/server/utils/qfTokenExchange'
import { getQfOAuthConfig, getQfEnvKey } from '~/server/utils/qfOAuthConfig'

function getEnvCookiePrefix(): string {
  return `qf_${getQfEnvKey()}_`
}

export default defineEventHandler(async (event) => {
  const method = event.method
  
  if (method === 'GET') {
    const query = getQuery(event)
    const code = query.code as string | undefined
    const state = query.state as string | undefined
    const error = query.error as string | undefined
    const errorDescription = query.error_description as string | undefined
    const envPrefix = getEnvCookiePrefix()
    const redirectParam = getCookie(event, `${envPrefix}oauth_custom_redirect`) || '/heatmap'
    
    if (error) {
      console.error('[QF OAuth] Callback error:', error, errorDescription)
      return sendRedirect(event, `/oauth/callback?error=${encodeURIComponent(errorDescription || error)}`)
    }
    
    if (!code) {
      return sendRedirect(event, '/oauth/callback?error=Missing+authorization+code')
    }
    
    const storedState = getCookie(event, `${envPrefix}oauth_state`)
    if (!storedState || storedState !== state) {
      return sendRedirect(event, '/oauth/callback?error=Invalid+state+parameter')
    }
    
    const codeVerifier = getCookie(event, `${envPrefix}oauth_code_verifier`)
    if (!codeVerifier) {
      return sendRedirect(event, '/oauth/callback?error=Missing+PKCE+code+verifier')
    }
    
    const redirectUri = getCookie(event, `${envPrefix}oauth_redirect_uri`)
    if (!redirectUri) {
      return sendRedirect(event, '/oauth/callback?error=Missing+redirect+URI')
    }
    
    try {
      const tokens = await exchangeAuthorizationCode({
        code,
        redirectUri,
        codeVerifier
      })
      
      let qfUserId = null
      let qfEmail = null
      let qfFirstName = null
      let qfLastName = null
      if (tokens.id_token) {
        const payload = decodeIdToken(tokens.id_token)
        if (payload) {
          qfUserId = payload.sub
          qfEmail = payload.email
          qfFirstName = payload.first_name
          qfLastName = payload.last_name
        }
      }
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: tokens.expires_in
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
      }
      
      deleteCookie(event, `${envPrefix}oauth_state`)
      deleteCookie(event, `${envPrefix}oauth_code_verifier`)
      deleteCookie(event, `${envPrefix}oauth_redirect_uri`)
      deleteCookie(event, `${envPrefix}oauth_custom_redirect`)
      
      const supabase = await serverSupabaseClient(event)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const scopes = tokens.scope ? tokens.scope.split(' ') : []
        const env = getQfEnvKey()
        
        await supabase
          .from('qf_connections')
          .upsert({
            user_id: user.id,
            qf_sub: qfUserId,
            qf_email: qfEmail,
            qf_first_name: qfFirstName,
            qf_last_name: qfLastName,
            scopes,
            env,
            refresh_token: tokens.refresh_token || '',
            access_token: tokens.access_token,
            connected_at: new Date().toISOString(),
            last_synced_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,env'
          })
      }
      
      return sendRedirect(event, redirectParam)
    } catch (err: any) {
      console.error('[QF OAuth] Token exchange failed:', err.message)
      return sendRedirect(event, `/oauth/callback?error=${encodeURIComponent('Failed+to+complete+OAuth+login')}`)
    }
  }
  
  if (method === 'POST') {
    const body = await readBody(event)
    const redirectUri = body.redirectUri as string | undefined
    
    if (!redirectUri) {
      throw createError({
        statusCode: 400,
        message: 'Missing redirectUri'
      })
    }
    
    const { buildAuthorizationUrl } = await import('~/server/utils/qfPkce')
    const config = getQfOAuthConfig()
    const envPrefix = getEnvCookiePrefix()
    
    const { url, state, codeVerifier } = buildAuthorizationUrl({
      redirectUri,
      authBaseUrl: config.authBaseUrl,
      clientId: config.clientId,
      scopes: config.scopes
    })
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 10
    }
    
    setCookie(event, `${envPrefix}oauth_state`, state, cookieOptions)
    setCookie(event, `${envPrefix}oauth_code_verifier`, codeVerifier, cookieOptions)
    setCookie(event, `${envPrefix}oauth_redirect_uri`, redirectUri, cookieOptions)
    
    return { url }
  }
  
  throw createError({
    statusCode: 405,
    message: 'Method not allowed'
  })
})
