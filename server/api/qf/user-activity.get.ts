import { getQuery } from 'h3'
import { qfUserFetch } from '../../utils/qfUserClient'
import { parseApiError, logQfError } from '../../utils/qfErrors'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const from = (query.from as string) || '2025-01-01'
  const to = (query.to as string) || new Date().toISOString().split('T')[0]
  
  try {
    const response: any = await qfUserFetch('/auth/v1/activity-days', {
      method: 'GET',
      query: {
        from,
        to,
        first: 20
      }
    }, event)
    
    const activities = (response.data || []).map((d: any) => ({
      date: d.date,
      count: d.secondsRead || d.manuallyAddedSeconds || 0,
      type: d.type,
      ranges: d.ranges || []
    }))
    
    return {
      authenticated: true,
      activities,
      error: null
    }
  } catch (err: any) {
    if (err?.message?.includes('No QF access token')) {
      return {
        authenticated: false,
        activities: [],
        error: 'Connect your Quran Foundation account to see reading activity.'
      }
    }

    const parsed = parseApiError(err?.data || err, err.status || 0)
    logQfError(parsed, { endpoint: '/auth/v1/activity-days', action: 'api_call' })
    
    return {
      authenticated: false,
      activities: [],
      error: parsed.hint || 'Failed to fetch activity'
    }
  }
})
