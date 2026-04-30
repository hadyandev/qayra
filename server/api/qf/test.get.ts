import { qfUserFetch } from '../../utils/qfUserClient'

export default defineEventHandler(async (event) => {
  console.log('[QF] Testing User API (notes scope)...')
  
  try {
    // Test QF User API with the signed-in user's OAuth token.
    const data = await qfUserFetch<{
      success?: boolean
      data?: unknown[]
      message?: string
    }>('/auth/v1/notes', { query: { limit: '5' } }, event)
    
    console.log('[QF User API] Response:', JSON.stringify(data).slice(0, 500))
    
    return {
      success: true,
      message: 'QF User API connected!',
      data
    }
  } catch (err: unknown) {
    const error = err as { message?: string; data?: unknown }
    console.error('[QF User API] Error:', error?.message || error)
    return {
      error: true,
      message: error?.message || 'Failed to connect to QF User API',
      details: error?.data
    }
  }
})
