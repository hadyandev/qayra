import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

interface StreakData {
  id: string
  startDate: string
  endDate: string
  status: string
  days: number
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = (query.type as string) || 'QURAN'
  const first = Math.min(Number(query.first) || 5, 20)

  try {
    // Get streaks from QF User API
    const data = await qfFetchJson<{
      success: boolean
      data: StreakData[]
      pagination: {
        hasNextPage: boolean
        hasPreviousPage: boolean
      }
    }>('/auth/v1/streaks', {
      type,
      first
    }, 'streak')

    // Get current streak days
    const currentStreakRes = await qfFetchJson<{
      success: boolean
      data: { days: number }
    }>('/auth/v1/streaks/current-streak-days', {
      type
    }, 'streak')

    return {
      streaks: data.data || [],
      currentStreakDays: currentStreakRes.data?.days || 0,
      hasMore: data.pagination?.hasNextPage || false,
      error: null
    }
  } catch (error: any) {
    console.error('QF Streaks API Error:', error?.message || error)
    return {
      streaks: [],
      currentStreakDays: 0,
      hasMore: false,
      error: error?.message || 'Failed to fetch streaks'
    }
  }
})