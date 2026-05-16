import { getQuery } from 'h3'
import { qfUserFetch } from '../../../utils/qfUserClient'
import { parseApiError, logQfError } from '../../../utils/qfErrors'

interface QfBookmark {
  id: string
  verseKey: string
  chapterNumber: number
  verseNumber: number
  createdAt: string
  isReading?: boolean
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const first = Math.min(Number(query.first) || 20, 50)
  
  try {
    // QF API requires mushafId and type for bookmark list
    const data = await qfUserFetch<{
      success: boolean
      data: Array<{
        id: string
        verseKey: string
        chapterNumber: number
        verseNumber: number
        createdAt: string
        isReading?: boolean
      }>
      pagination?: {
        hasNextPage: boolean
        hasPreviousPage: boolean
      }
    }>('/auth/v1/bookmarks', {
      query: { 
        first,
        mushafId: 4, // Uthmani script
        type: 'ayah'
      }
    }, event)
    
    const bookmarks: QfBookmark[] = (data.data || []).map((b: any) => ({
      id: b.id,
      verseKey: b.verseKey || (b.chapterNumber ? `${b.chapterNumber}:${b.verseNumber}` : b.key ? `${b.key}:${b.verseNumber}` : 'unknown'),
      chapterNumber: b.chapterNumber || b.key || 0,
      verseNumber: b.verseNumber || 0,
      createdAt: b.createdAt,
      isReading: b.isReading
    }))
    
    return {
      bookmarks,
      hasMore: data.pagination?.hasNextPage || false,
      error: null
    }
  } catch (err: any) {
    // Handle token expiration - clear connection and signal need to reconnect
    if (err.status === 403 || err?.message?.includes('expired') || err?.message?.includes('inactive')) {
      // Clear the invalid connection from DB
      try {
        const { serverSupabaseClient } = await import('#supabase/server')
        const supabase = await serverSupabaseClient(event)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { getQfEnvKey } = await import('~/server/utils/qfOAuthConfig')
          const env = getQfEnvKey()
          await supabase
            .from('qf_connections')
            .delete()
            .eq('user_id', user.id)
            .eq('env', env)
        }
      } catch (e) {}
      
      return {
        bookmarks: [],
        hasMore: false,
        error: 'SESSION_EXPIRED',
        needsReauth: true
      }
    }
    
    if (err?.message?.includes('No QF access token')) {
      return {
        bookmarks: [],
        hasMore: false,
        error: 'Connect your Quran Foundation account to see bookmarks.'
      }
    }
    
    const parsed = parseApiError(err?.data || err, err.status || 0)
    logQfError(parsed, { endpoint: '/auth/v1/bookmarks', action: 'list_bookmarks' })
    
    return {
      bookmarks: [],
      hasMore: false,
      error: parsed.hint || 'Failed to fetch bookmarks'
    }
  }
})