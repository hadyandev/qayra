import { getRouterParam } from 'h3'
import { qfUserFetch } from '../../../utils/qfUserClient'
import { parseApiError, logQfError } from '../../../utils/qfErrors'

export default defineEventHandler(async (event) => {
  const bookmarkId = getRouterParam(event, 'id')
  
  if (!bookmarkId) {
    return {
      success: false,
      error: 'Bookmark ID is required'
    }
  }
  
  try {
    await qfUserFetch<{ success: boolean }>(`/auth/v1/bookmarks/${bookmarkId}`, {
      method: 'DELETE'
    }, event)
    
    return {
      success: true,
      error: null
    }
  } catch (err: any) {
    const parsed = parseApiError(err?.data || err, err.status || 0)
    logQfError(parsed, { endpoint: `/auth/v1/bookmarks/${bookmarkId}`, action: 'delete_bookmark' })
    
    return {
      success: false,
      error: parsed.hint || 'Failed to delete bookmark'
    }
  }
})