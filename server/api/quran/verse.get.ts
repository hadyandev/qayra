import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

  try {
    // Use Quran.com API (public, no auth needed)
    // Note: This API returns verses from the requested key onwards
    const response: any = await $fetch(`https://api.quran.com/api/v4/quran/verses/${key}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.verses || response.verses.length === 0) {
      return { error: 'Verse not found', verse: null }
    }

    // Filter to find the exact verse requested (API returns from key onwards)
    const verseData = response.verses.find((v: any) => v.verse_key === key)
    
    if (!verseData) {
      return { error: 'Verse not found', verse: null }
    }

    // Transform response
    const verse = {
      id: verseData.id,
      verse_key: verseData.verse_key,
      text_uthmani: verseData.text_uthmani,
      text_imlaei: verseData.text_imlaei,
      text_indopak: verseData.text_indopak
    }

    return { verse, error: null }

  } catch (error: any) {
    console.error('Verse API Error:', error.message || error)
    return { 
      error: error.message || 'Failed to fetch verse',
      verse: null 
    }
  }
})
