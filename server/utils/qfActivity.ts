import { type H3Event } from 'h3'
import { qfUserFetch } from './qfUserClient'

interface LogActivityParams {
  type: 'QURAN' | 'LESSON' | 'QURAN_READING_PROGRAM'
  seconds?: number  // Required for QURAN, not allowed for LESSON
  ranges?: string[]  // Required for QURAN type
  date?: string
}

export async function logQFActivity(
  event: H3Event,
  params: LogActivityParams
): Promise<{ success: boolean; error: string | null }> {
  const {
    type = 'QURAN',
    seconds = 60,
    ranges = [],
    date = new Date().toISOString().split('T')[0]
  } = params

  try {
    const isQuran = type === 'QURAN'
    
    const body = isQuran
      ? { type, seconds, ranges, date, mushafId: 4 }
      : { type, date }
    
    const response = await qfUserFetch<{ success?: boolean }>('/auth/v1/activity-days', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-timezone': 'UTC',
        'Accept': 'application/json'
      },
      body
    }, event)

    if (response && (response as any).success) {
      return { success: true, error: null }
    }
    
    return { success: false, error: 'QF activity not logged' }
  } catch (error: any) {
    if (error?.message?.includes('No QF access token')) {
      return { success: false, error: 'QF account not connected' }
    }

    console.error('[QF Activity] Error:', error?.message || error)
    return { success: false, error: error?.message || 'Failed to log activity' }
  }
}

export async function getQFActivity(event: H3Event, startDate?: string, endDate?: string): Promise<{
  activities: Array<{ date: string; count: number; type?: string }>
  error: string | null
}> {
  const from = startDate || '2025-01-01'
  const to = endDate || new Date().toISOString().split('T')[0]

  try {
    const data = await qfUserFetch<{
      success: boolean
      data: Array<{ date: string; progress: number; type: string; secondsRead?: number }>
    }>('/auth/v1/activity-days', {
      query: {
        from,
        to,
        first: 20
      }
    }, event)

    const activities = (data.data || []).map((d: any) => ({
      date: d.date,
      count: d.secondsRead || d.manuallyAddedSeconds || 0,
      type: d.type
    }))

    console.log('[QF Activity] GET returned:', JSON.stringify(activities))

    return {
      activities,
      error: null
    }
  } catch (error: any) {
    if (error?.message?.includes('No QF access token')) {
      return {
        activities: [],
        error: 'QF account not connected'
      }
    }

    console.error('[QF Activity] GET Error:', error?.message || error)
    return {
      activities: [],
      error: error?.message || 'Failed to fetch activity'
    }
  }
}
