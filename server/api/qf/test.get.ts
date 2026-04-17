import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async (event) => {
  console.log('[QF] Testing User API (notes scope)...')
  
  try {
    // Test QF User API - Get notes with 'note' scope
    const data = await qfFetchJson<{
      success?: boolean
      data?: unknown[]
      message?: string
    }>('/v1/notes', { limit: '5' }, 'user')
    
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