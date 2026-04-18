import { hadithEditions, hadithBookInfo } from '../../utils/hadithData'
import { getIndexedHadiths } from '../../utils/hadithFetch'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const collection = query.collection as string
  const bookNumber = query.bookNumber as string
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 50

  if (!collection || !bookNumber) {
    return { hadiths: [], error: 'Collection and bookNumber are required' }
  }

  const editionKey = hadithEditions[collection]
  if (!editionKey) {
    return { hadiths: [], error: 'Invalid collection' }
  }

  try {
    const hadithMap = await getIndexedHadiths(editionKey)
    const allHadiths = Array.from(hadithMap.values())
    
    const bookNum = parseInt(bookNumber)
    const filteredHadiths = allHadiths.filter((h: any) => {
      const chapterId = h.chapterId || h.chapter_number
      return chapterId === bookNum
    })

    const total = filteredHadiths.length
    const paginated = filteredHadiths.slice(0, limit).map((h: any) => ({
      hadithnumber: h.hadithnumber || h.hadithNumber,
      text: h.text?.replace(/<[^>]*>/g, '').slice(0, 200) || h.body?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
      chapterId: h.chapterId || h.chapter_number,
      chapterTitle: h.chapterTitle
    }))

    return {
      hadiths: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      error: null
    }
  } catch (error: any) {
    console.error('Hadith list API error:', error)
    return { hadiths: [], error: error?.message || 'Failed to load hadiths' }
  }
})