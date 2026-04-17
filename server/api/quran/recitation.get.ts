import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'

interface AudioFile {
  verse_key: string
  url: string
}

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const reciterId = getQuery(event).reciter_id as string || '1'

  if (!key) {
    return { error: 'Verse key is required', audio: null }
  }

  try {
    // Try different recitation IDs (ayah-by-ayah recitations)
    const recitationIds = ['1', '2', '3', '4', '5']
    let foundAudio: { url: string; reciter: string | null } | null = null
    
    for (const recId of recitationIds) {
      try {
        const path = `/content/api/v4/recitations/${recId}/ayahs/${encodeURIComponent(key)}`
        const data = await qfFetchJson<{
          audio_files?: AudioFile[]
          pagination?: { total_records?: number }
        }>(path, undefined, 'content')
        
        if (data.audio_files && data.audio_files.length > 0) {
          const audio = data.audio_files[0]
          // URL might be relative, construct full URL if needed
          let audioUrl = audio.url
          if (audioUrl && !audioUrl.startsWith('http')) {
            audioUrl = `https://verses.quran.foundation/${audioUrl}`
          }
          foundAudio = { url: audioUrl, reciter: `Reciter ${recId}` }
          break
        }
      } catch {
        continue
      }
    }

    return {
      audio: foundAudio,
      error: null
    }
  } catch (error: any) {
    return { error: null, audio: null }
  }
})