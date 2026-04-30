import crypto from 'crypto'

/**
 * PKCE Helper Functions
 * 
 * Implements PKCE (Proof Key for Code Exchange) as per RFC 7636
 * Used for OAuth2 Authorization Code flow security
 */

const PKCE_METHOD = 'S256'

/**
 * Base64URL encode a buffer
 */
function base64url(buf: Buffer): string {
  return buf.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Generate PKCE code_verifier and code_challenge pair
 */
function generatePkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = base64url(crypto.randomBytes(32))
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  const codeChallenge = base64url(hash)
  return { codeVerifier, codeChallenge }
}

/**
 * Generate random state parameter for CSRF protection
 */
function generateState(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Generate nonce for OIDC security
 */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Default scopes for QF User APIs
 */
export const DEFAULT_SCOPES = 'openid offline_access activity_day streak'

/**
 * Build authorization URL for Quran Foundation OAuth2
 * 
 * @param redirectUri - The callback URI after authorization
 * @param scopes - OAuth scopes (default: DEFAULT_SCOPES)
 * @param authBaseUrl - QF auth base URL from getQfOAuthConfig()
 * @param clientId - QF client ID from getQfOAuthConfig()
 * 
 * @returns { url, state, nonce, codeVerifier, redirectUri }
 */
export function buildAuthorizationUrl(options: {
  redirectUri: string
  scopes?: string
  authBaseUrl: string
  clientId: string
}): {
  url: string
  state: string
  nonce: string
  codeVerifier: string
  redirectUri: string
} {
  const { redirectUri, scopes = DEFAULT_SCOPES, authBaseUrl, clientId } = options
  
  // Generate state and nonce
  const state = generateState()
  const nonce = generateNonce()
  
  const { codeVerifier, codeChallenge } = generatePkcePair()
  
  // Build URL
  const params = new URLSearchParams()
  params.set('response_type', 'code')
  params.set('client_id', clientId)
  params.set('redirect_uri', redirectUri)
  params.set('scope', scopes)
  params.set('state', state)
  params.set('nonce', nonce)
  params.set('code_challenge', codeChallenge)
  params.set('code_challenge_method', PKCE_METHOD)
  params.set('prompt', 'consent') // Required to initialize fresh CSRF session on QF Hydra
  
  const url = `${authBaseUrl}/oauth2/auth?${params.toString()}`
  
  return { url, state, nonce, codeVerifier, redirectUri }
}

/**
 * Validate state parameter on callback (CSRF protection)
 */
export function validateState(providedState: string, storedState: string): boolean {
  if (!providedState || !storedState) return false
  return providedState === storedState
}

/**
 * Validate nonce (for OIDC security)
 */
export function validateNonce(providedNonce: string, storedNonce: string): boolean {
  if (!providedNonce || !storedNonce) return false
  return providedNonce === storedNonce
}
