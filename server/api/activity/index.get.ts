import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: notes, error } = await client
    .from('notes')
    .select('id, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const activityByDate: Record<string, number> = {}
  for (const note of notes ?? []) {
    const date = note.created_at.split('T')[0]
    activityByDate[date] = (activityByDate[date] || 0) + 1
  }

  const today = new Date()
  const weeks: Array<Array<{ date: string; count: number; level: number }>> = []
  
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
  
  const startDayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - startDayOfWeek)
  
  let currentDate = new Date(startDate)
  
  while (currentDate <= today) {
    const week: Array<{ date: string; count: number; level: number }> = []
    for (let i = 0; i < 7 && currentDate <= today; i++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const count = activityByDate[dateStr] || 0
      let level = 0
      if (count > 0) level = 1
      if (count >= 2) level = 2
      if (count >= 4) level = 3
      if (count >= 6) level = 4
      
      week.push({ date: dateStr, count, level })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthLabels: Array<{ month: string; weekIndex: number }> = []
  
  let lastMonth = -1
  for (let i = 0; i < weeks.length; i++) {
    const firstDayOfWeek = weeks[i][0]
    if (firstDayOfWeek) {
      const month = new Date(firstDayOfWeek.date).getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ month: months[month], weekIndex: i })
        lastMonth = month
      }
    }
  }

  return {
    weeks,
    monthLabels,
    totalContributions: Object.values(activityByDate).reduce((sum, c) => sum + c, 0),
    totalDays: Object.keys(activityByDate).length
  }
})
