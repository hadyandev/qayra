import { serverSupabaseClient } from '#supabase/server'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data: notes, error } = await client
    .from('notes')
    .select('id, title, content, created_at, note_verses(verse_key)')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const activityByDate: Record<string, number> = {}
  const noteDetails: Array<{
    id: string
    date: string
    title?: string
    verseKeys: string[]
    created_at: string
  }> = []

  for (const note of notes ?? []) {
    const dateStr = note.created_at.split('T')[0]
    activityByDate[dateStr] = (activityByDate[dateStr] || 0) + 1

    const verseKeys = (note.note_verses || []).map((v: any) => v.verse_key)
    noteDetails.push({
      id: note.id,
      date: dateStr,
      title: note.title || undefined,
      verseKeys,
      created_at: note.created_at
    })
  }

  const today = new Date()
  const todayStr = formatLocalDate(today)
  
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
  
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)
  
  const weeks: Array<Array<{ date: string; count: number; level: number; dayName: string }>> = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  let currentDate = new Date(startDate)
  
  while (formatLocalDate(currentDate) <= todayStr) {
    const week: Array<{ date: string; count: number; level: number; dayName: string }> = []
    
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(currentDate)
      const dateStr = formatLocalDate(dateObj)
      const dayName = dayNames[i]
      
      let count = 0
      let level = 0
      
      if (dateStr <= todayStr && activityByDate[dateStr]) {
        count = activityByDate[dateStr]
        if (count > 0) level = 1
        if (count >= 2) level = 2
        if (count >= 4) level = 3
        if (count >= 6) level = 4
      }
      
      if (dateStr <= todayStr) {
        week.push({ date: dateStr, count, level, dayName })
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    if (week.length > 0) {
      weeks.push(week)
    }
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthLabels: Array<{ month: string; weekIndex: number }> = []
  
  let lastMonth = -1
  let lastWeekIndex = -1
  
  for (let i = 0; i < weeks.length; i++) {
    const firstDay = weeks[i][0]
    if (firstDay && firstDay.date) {
      const weekDate = new Date(firstDay.date + 'T00:00:00')
      const month = weekDate.getMonth()
      
      if (month !== lastMonth) {
        if (i > 0 && month === lastMonth + 1) {
          monthLabels.push({ month: months[month], weekIndex: i })
        } else if (i === 0) {
          monthLabels.push({ month: months[month], weekIndex: i })
        } else if (month !== lastMonth) {
          monthLabels.push({ month: months[month], weekIndex: i })
        }
        lastMonth = month
      }
    }
  }

  const totalContributions = Object.values(activityByDate).reduce((sum, c) => sum + c, 0)
  const activeDays = Object.keys(activityByDate).length

  return {
    weeks,
    monthLabels,
    totalContributions,
    totalDays: activeDays,
    noteDetails,
    generatedAt: todayStr
  }
})
