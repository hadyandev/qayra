import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

interface AudioResult {
  url: string | null
  reciter: string | null
}

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const reciterId = getQuery(event).reciter_id as string || '1'

  if (!key) {
    return { error: 'Verse key is required', audio: null as AudioResult | null }
  }

  try {
    const path = `/content/api/v4/verses/by_key/${encodeURIComponent(key)}/recitations`
    const data = await qfFetchJson<{
      audio_files?: Record<string, unknown>[]
    }>(path, undefined, 'content')

    const audioFiles = data.audio_files as Record<string, unknown>[] | undefined
    
    let audioUrl: string | null = null
    let reciterName: string | null = null

    if (audioFiles && audioFiles.length > 0) {
      const selected = reciterId 
        ? audioFiles.find((a: any) => String(a.reciter_id) === reciterId)
        : audioFiles[0]
      
      if (selected) {
        audioUrl = selected.audio_url || selected.url || null
        reciterName = selected.reciter_name || selected.reciterName || null
      }
    }

    return {
      audio: audioUrl ? { url: audioUrl, reciter: reciterName } : null,
      error: null
    }
  } catch (error: any) {
    console.error('Recitation API Error:', error?.message || error)
    return {
      error: null,
      audio: null
    }
  }
})