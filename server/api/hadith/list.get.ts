import { hadithEditions, hadithBookInfo } from '../../utils/hadithData'
import { getIndexedHadiths, getIndexedSections } from '../../utils/hadithFetch'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const collection = query.collection as string
  const bookNumber = query.bookNumber as string
  const limit = Number(query.limit) || 100

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
    const sections = getIndexedSections(editionKey)
    
    const bookNum = parseInt(bookNumber)
    const filteredHadiths = allHadiths.filter((h: any) => {
      const chapterId = h.chapterId || h.chapter_number
      return chapterId === bookNum
    })

    const bookSection = sections.find((s: any) => s.id === bookNum || s.number === bookNum)
    
    const paginated = filteredHadiths.slice(0, limit).map((h: any) => ({
      hadithnumber: h.hadithnumber || h.hadithNumber,
      text: h.text?.replace(/<[^>]*>/g, '').slice(0, 250) || h.body?.replace(/<[^>]*>/g, '').slice(0, 250) || '',
      chapterId: h.chapterId || h.chapter_number,
      chapterTitle: h.chapterTitle,
      grade: h.grade || h.grades?.[0]?.grade || 'Sahih',
      grades: h.grades,
      reference: h.reference,
      arabicNumber: h.arabicnumber
    }))

    return {
      hadiths: paginated,
      bookInfo: {
        number: bookNum,
        title: bookSection?.title || `Book ${bookNum}`,
        introduction: bookSection?.introduction || bookSection?.preface || '',
        book: bookSection?.book || ''
      },
      total: filteredHadiths.length,
      error: null
    }
  } catch (error: any) {
    console.error('Hadith list API error:', error)
    return { hadiths: [], error: error?.message || 'Failed to load hadiths' }
  }
})