import { readBody } from 'h3'
import { qfUserFetch } from '../../../utils/qfUserClient'
import { parseApiError, logQfError } from '../../../utils/qfErrors'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const key = parseInt(body.chapterNumber as string) || parseInt(body.key as string)
  const verseNumber = parseInt(body.verseNumber as string)
  
  if (!key || !verseNumber) {
    return {
      success: false,
      error: 'chapterNumber (key) and verseNumber are required'
    }
  }
  
  if (key < 1 || key > 114) {
    return {
      success: false,
      error: 'chapterNumber must be between 1 and 114'
    }
  }
  
  try {
    // Correct format based on QF SDK: key=chapter, mushaf=scriptId, type, verseNumber
    const data = await qfUserFetch<{
      success: boolean
      data: {
        id: string
        verseKey: string
        chapterNumber: number
        verseNumber: number
        createdAt: string
      }
    }>('/auth/v1/bookmarks', {
      method: 'POST',
      body: {
        key,
        mushaf: 4, // Uthmani script
        type: 'ayah',
        verseNumber
      }
    }, event)
    
    return {
      success: true,
      bookmark: data.data ? {
        id: data.data.id,
        verseKey: data.data.verseKey || (data.data.chapterNumber ? `${data.data.chapterNumber}:${data.data.verseNumber}` : data.data.verseKey),
        chapterNumber: data.data.chapterNumber || data.data.key || key,
        verseNumber: data.data.verseNumber || verseNumber,
        createdAt: data.data.createdAt
      } : {
        id: 'temp-' + Date.now(),
        verseKey: `${key}:${verseNumber}`,
        chapterNumber: key,
        verseNumber: verseNumber,
        createdAt: new Date().toISOString()
      },
      error: null
    }
  } catch (err: any) {
    const parsed = parseApiError(err?.data || err, err.status || 0)
    logQfError(parsed, { endpoint: '/auth/v1/bookmarks', action: 'add_bookmark' })
    
    // Handle token expiration
    const isExpired = err.status === 403 || err?.message?.includes('expired') || err?.message?.includes('inactive')
    
    return {
      success: false,
      bookmark: null,
      error: isExpired ? 'SESSION_EXPIRED' : (parsed.hint || 'Failed to add bookmark'),
      needsReauth: isExpired || false
    }
  }
})