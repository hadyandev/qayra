import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Call Quran.com API (public, no auth needed)
    const response = await $fetch('https://api.quran.com/api/v4/chapters', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    // Transform response to our format
    const chapters = (response.chapters || []).map((chapter: any) => ({
      id: chapter.id,
      name_simple: chapter.name_simple,
      name_complex: chapter.name_complex,
      name_arabic: chapter.name_arabic,
      translated_name: chapter.translated_name?.name || '',
      verses_count: chapter.verses_count,
      revelation_place: chapter.revelation_place
    }))

    return { chapters }
  } catch (error: any) {
    console.error('Chapters API error:', error)
    return {
      error: 'Failed to load surah list',
      details: error.message || 'Unknown error'
    }
  }
})
