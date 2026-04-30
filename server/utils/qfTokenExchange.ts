import { $fetch } from 'ofetch'
import { getQfOAuthConfig } from './qfOAuthConfig'
import { parseOAuthError, logQfError } from './qfErrors'

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope: string
}

export interface ExchangeOptions {
  code: string
  redirectUri: string
  codeVerifier: string
}

/**
 * Exchange authorization code for access token
 * 
 * @param options.code - Authorization code from OAuth callback
 * @param options.redirectUri - Must match the one used in Step 2
 * @param options.codeVerifier - PKCE verifier (from server session)
 * @param options.isConfidential - Force confidential client mode (auto-detected if not provided)
 * 
 * @returns { access_token, refresh_token?, id_token?, expires_in, scope, token_type }
 * 
 * @throws "Failed to exchange authorization code for tokens" on error
 */
export async function exchangeAuthorizationCode(options: ExchangeOptions): Promise<TokenResponse> {
  const { code, redirectUri, codeVerifier, isConfidential: forceConfidential } = options
  
  // Get OAuth config
  const config = getQfOAuthConfig()
  const { authBaseUrl, clientId, clientSecret } = config
  
  // Determine client type
  const isConfidential = forceConfidential ?? (!config.isPublicClient && !!clientSecret)
  
  // Build token request body
  const params = new URLSearchParams()
  params.set('grant_type', 'authorization_code')
  params.set('code', code)
  params.set('redirect_uri', redirectUri)
  params.set('code_verifier', codeVerifier)
  
  // Auth method based on client type
  const authHeader = isConfidential && clientSecret
    ? { username: clientId, password: clientSecret }
    : undefined
  
  // For public clients, include client_id in body
  if (!isConfidential) {
    params.set('client_id', clientId)
  }
  
  try {
    const response = await $fetch<TokenResponse>(`${authBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(authHeader ? {
          'Authorization': `Basic ${Buffer.from(`${authHeader.username}:${authHeader.password}`).toString('base64')}`
        } : {})
      },
      body: params.toString()
    }) as TokenResponse
    
    if (!response.access_token) {
      throw new Error('No access token in response')
    }
    
    return response
  } catch (error: any) {
    const parsed = parseOAuthError(error?.data || error)
    logQfError(parsed, { action: 'exchange' })
    throw new Error(parsed.hint || 'Failed to exchange authorization code for tokens')
  }
}

/**
 * Exchange refresh token for new access token (legacy - kept for compatibility)
 * Prefer refreshQfToken from qfTokenRefresh.ts
 */
export async function exchangeRefreshToken(refreshToken: string): Promise<TokenResponse> {
  const config = getQfOAuthConfig()
  const { authBaseUrl, clientId, clientSecret } = config
  const isConfidential = !config.isPublicClient && !!clientSecret
  const params = new URLSearchParams()
  params.set('grant_type', 'refresh_token')
  params.set('refresh_token', refreshToken)
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  if (isConfidential && clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
  } else {
    params.set('client_id', clientId)
  }

  const result = await $fetch<TokenResponse>(`${authBaseUrl}/oauth2/token`, {
    method: 'POST',
    headers,
    body: params.toString()
  })
  
  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_in: result.expires_in,
    scope: result.scope,
    token_type: result.token_type
  }
}

/**
 * Decode and validate ID token (basic validation)
 * Returns payload if valid, throws if invalid
 */
export interface IdTokenPayload {
  sub: string
  email?: string
  first_name?: string
  last_name?: string
  iat: number
  exp: number
}

export function decodeIdToken(idToken: string): IdTokenPayload | null {
  try {
    // ID token is JWT - decode without verification for now
    const parts = idToken.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload as IdTokenPayload
  } catch {
    return null
  }
}
