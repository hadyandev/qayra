import { getQfOAuthConfig } from './qfOAuthConfig'

export interface QfError extends Error {
  code: QfErrorCode
  status: number
  hint?: string
}

export type QfErrorCode =
  | 'invalid_client'
  | 'invalid_grant'
  | 'redirect_uri_mismatch'
  | 'invalid_scope'
  | 'unauthorized'
  | 'forbidden'
  | 'token_expired'
  | 'network_error'
  | 'unknown'

/**
 * Parse OAuth2 error from response
 * Maps OAuth error codes to actionable messages
 */
export function parseOAuthError(errorData: any): QfError {
  const error = errorData?.error
  const message = errorData?.error_description || errorData?.message || 'Unknown OAuth error'
  
  let code: QfErrorCode = 'unknown'
  let status = 400
  let hint: string | undefined
  
  switch (error) {
    case 'invalid_client':
      code = 'invalid_client'
      status = 401
      hint = 'Check client credentials or client type (public vs confidential)'
      break
      
    case 'invalid_grant':
      code = 'invalid_grant'
      status = 400
      hint = 'Authorization code may be expired, already used, or invalid'
      break
      
    case 'redirect_uri_mismatch':
      code = 'redirect_uri_mismatch'
      status = 400
      hint = 'Redirect URI must match registered value exactly'
      break
      
    case 'invalid_scope':
      code = 'invalid_scope'
      status = 400
      hint = 'Check requested scopes are allowed for your client'
      break
      
    default:
      // Check for other common patterns
      if (message.includes('access token') || message.includes('expired')) {
        code = 'token_expired'
        status = 401
      } else if (message.includes('network') || message.includes('connection')) {
        code = 'network_error'
        status = 0
      }
  }
  
  return {
    name: 'QfOAuthError',
    message: message.substring(0, 100), // Truncate long messages
    code,
    status,
    hint
  }
}

/**
 * Parse User API error (401, 403, etc.)
 */
export function parseApiError(errorData: any, status: number): QfError {
  const message = errorData?.message || errorData?.error?.message || 'API request failed'
  
  let code: QfErrorCode = 'unknown'
  let hint: string | undefined
  
  switch (status) {
    case 401:
      code = 'unauthorized'
      hint = 'Token may be expired. Try refreshing or re-login.'
      break
      
    case 403:
      const errorType = errorData?.error?.type
      if (errorType === 'forbidden') {
        code = 'forbidden'
        // Check if it's scope/permission or origin
        if (message.includes('scope') || message.includes('permission')) {
          hint = 'Scope not granted. User may need to re-authorize with correct permissions.'
        } else {
          hint = 'Origin not allowed. Make request from backend or allowed origin.'
        }
      } else {
        code = 'forbidden'
        hint = 'Access denied.'
      }
      break
      
    case 429:
      code = 'network_error'
      hint = 'Rate limited. Wait before retrying.'
      break
      
    default:
      if (status >= 500) {
        code = 'network_error'
        hint = 'QF service error. Try again later.'
      }
  }
  
  return {
    name: 'QfApiError',
    message: message.substring(0, 100),
    code,
    status,
    hint
  }
}

/**
 * Create a safe error response (for logging/API responses)
 * Never includes: tokens, codes, secrets
 */
export function createSafeError(error: QfError | Error, context?: {
  endpoint?: string
  action?: string
}): {
  message: string
  code?: string
  status?: number
  hint?: string
  context?: {
    env?: string
    endpoint?: string
    action?: string
  }
} {
  const qfError = 'code' in error ? error : undefined
  
  const config = getQfOAuthConfig()
  
  return {
    message: qfError?.message || error.message || 'Unknown error',
    code: qfError?.code,
    status: qfError?.status,
    hint: qfError?.hint,
    context: {
      env: config.env,
      endpoint: context?.endpoint,
      action: context?.action
    }
  }
}

/**
 * Log error safely (no secrets)
 */
export function logQfError(
  error: QfError | Error,
  context?: {
    endpoint?: string
    action?: 'login' | 'refresh' | 'api_call' | 'exchange'
  }
) {
  const safe = createSafeError(error, context)
  
  // Determine log level based on error type
  const isAuthError = safe.code === 'invalid_client' || safe.code === 'invalid_grant'
  const isRecoverable = safe.code === 'unauthorized' || safe.code === 'token_expired'
  
  const logFn = isRecoverable ? console.warn : console.error
  
  logFn('[QF Error]', JSON.stringify({
    ...safe,
    // Don't include actual error in production logs
    ...(process.env.NODE_ENV === 'development' ? { originalError: error.message } : {})
  }))
}

/**
 * Check if error requires re-authentication
 */
export function requiresReAuth(error: QfError | Error): boolean {
  const code = 'code' in error ? error.code : 'unknown'
  return code === 'invalid_client' || 
         code === 'invalid_grant' || 
         code === 'unauthorized'
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: QfError | Error): boolean {
  const code = 'code' in error ? error.code : 'unknown'
  const status = 'status' in error ? error.status : 0
  
  return code === 'network_error' || 
         (status === 0) ||
         (status >= 500 && status < 600)
}

/**
 * Check if error is due to missing permissions
 */
export function isPermissionError(error: QfError | Error): boolean {
  const code = 'code' in error ? error.code : 'unknown'
  const message = 'message' in error ? error.message : ''
  
  return code === 'forbidden' || 
         code === 'invalid_scope' ||
         message.includes('scope') ||
         message.includes('permission')
}
