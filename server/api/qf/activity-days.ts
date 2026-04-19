import { getQuery, readBody } from 'h3'
import { logQFActivity, getQFActivity } from '../../utils/qfActivity'

export default defineEventHandler(async (event) => {
  const method = event.method
  
  if (method === 'GET') {
    const query = getQuery(event)
    const from = (query.from as string) || '2025-01-01'
    const to = (query.to as string) || new Date().toISOString().split('T')[0]
    
    try {
      const result = await getQFActivity(from, to)
      
      return {
        activities: result.activities || [],
        error: result.error
      }
    } catch (error: any) {
      console.error('QF Activity Days GET Error:', error?.message || error)
      return {
        activities: [],
        error: error?.message || 'Failed to fetch activity days'
      }
    }
  }
  
  if (method === 'POST') {
    const body = await readBody(event)
    const date = body.date as string || new Date().toISOString().split('T')[0]
    const type = (body.type as string) || 'QURAN'
    const ranges = (body.ranges as string[]) || []
    const seconds = body.seconds || 60
    
    const result = await logQFActivity({
      type: type as 'QURAN' | 'LESSON' | 'QURAN_READING_PROGRAM',
      seconds,
      ranges,
      date
    })
    
    return result
  }
  
  return { error: 'Method not allowed' }
})