import { getQfAccessToken } from '../utils/qfHttp'

const QF_USER_API_BASE = 'https://apis-prelive.quran.foundation'

interface LogActivityParams {
  type: 'QURAN' | 'LESSON' | 'QURAN_READING_PROGRAM'
  seconds?: number  // Required for QURAN, not allowed for LESSON
  ranges?: string[]  // Required for QURAN type
  date?: string
}

export async function logQFActivity(params: LogActivityParams): Promise<{ success: boolean; error: string | null }> {
  const config = useRuntimeConfig()
  
  const {
    type = 'QURAN',
    seconds = 60,
    ranges = [],
    date = new Date().toISOString().split('T')[0]
  } = params

  try {
    const id = config.qfClientId as string
    const token = await getQfAccessToken('activity_day')
    
    if (!token) {
      return { success: false, error: 'Failed to get QF token' }
    }

    const isQuran = type === 'QURAN'
    
    const body = isQuran
      ? { type, seconds, ranges, date, mushafId: 4 }
      : { type, date }
    
    const response = await $fetch(`${QF_USER_API_BASE}/auth/v1/activity-days`, {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        'x-client-id': id,
        'Content-Type': 'application/json',
        'x-timezone': 'UTC',
        'Accept': 'application/json'
      },
      body
    }).catch((err: any) => {
      console.error('[QF Activity] Full error:', err)
      console.error('[QF Activity] Response data:', err?.data)
      console.error('[QF Activity] Response status:', err?.status)
      throw err
    })

    if (response && (response as any).success) {
      return { success: true, error: null }
    }
    
    return { success: false, error: 'QF activity not logged' }
  } catch (error: any) {
    console.error('[QF Activity] Error:', error?.message || error)
    console.error('[QF Activity] Data:', error?.data)
    return { success: false, error: error?.message || 'Failed to log activity' }
  }
}

export async function getQFActivity(startDate?: string, endDate?: string): Promise<{
  activities: Array<{ date: string; count: number; type?: string }>
  error: string | null
}> {
  const from = startDate || '2025-01-01'
  const to = endDate || new Date().toISOString().split('T')[0]

  try {
    const { qfFetchJson } = await import('../utils/qfHttp')
    const data = await qfFetchJson<{
      success: boolean
      data: Array<{ date: string; progress: number; type: string; secondsRead?: number }>
    }>('/auth/v1/activity-days', {
      from,
      to,
      first: 20
    }, 'activity_day')

    const activities = (data.data || []).map((d: any) => ({
      date: d.date,
      count: d.secondsRead || 0,
      type: d.type
    }))

    console.log('[QF Activity] GET returned:', JSON.stringify(activities))

    return {
      activities,
      error: null
    }
  } catch (error: any) {
    console.error('[QF Activity] GET Error:', error?.message || error)
    return {
      activities: [],
      error: error?.message || 'Failed to fetch activity'
    }
  }
}