import { hadithEditions, hadithBookInfo } from '../../utils/hadithData'
import { getIndexedHadiths } from '../../utils/hadithFetch'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const collection = query.collection as string
  const bookNumber = query.bookNumber as string
  const hadithNumber = Number(query.hadithNumber)

  if (!collection || !bookNumber || !hadithNumber) {
    return { hadith: null, error: 'Collection, bookNumber, and hadithNumber are required' }
  }

  const editionKey = hadithEditions[collection]
  if (!editionKey) {
    return { hadith: null, error: 'Invalid collection' }
  }

  try {
    const hadithMap = await getIndexedHadiths(editionKey)
    const foundHadith = hadithMap.get(hadithNumber)

    if (!foundHadith) {
      return { hadith: null, error: 'Hadith not found' }
    }

    const book = hadithBookInfo[collection]

    return {
      hadith: {
        hadithnumber: foundHadith.hadithnumber || foundHadith.hadithNumber,
        text: foundHadith.text || foundHadith.body,
        grade: foundHadith.grades?.[0]?.grade || foundHadith.grade || 'Sahih',
        arabicNumber: foundHadith.arabicnumber,
        reference: foundHadith.reference,
        chapterId: foundHadith.chapterId,
        chapterTitle: foundHadith.chapterTitle,
        bookName: book?.name || collection,
        bookSlug: collection
      },
      error: null
    }
  } catch (error: any) {
    console.error('Hadith detail API error:', error)
    return { hadith: null, error: error?.message || 'Failed to load hadith' }
  }
})