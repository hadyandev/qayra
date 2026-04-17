import { qfFetchJson } from '../../utils/qfHttp'

export default defineEventHandler(async () => {
  try {
    const data = await qfFetchJson<{
      tafsirs?: Array<{
        id: number
        name: string
        slug: string
      }>
    }>('/content/api/v4/resources/tafsirs', { language: 'en' }, 'content')
    
    console.log('[Tafsir Resources] Response:', JSON.stringify(data).slice(0, 500))
    
    return { tafsirs: data.tafsirs || [] }
  } catch (err) {
    console.error('[Tafsir Resources] Error:', err)
    return { tafsirs: [] }
  }
})