import { hadithBookInfo } from '../../utils/hadithData'
import { getIndexedSections } from '../../utils/hadithFetch'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const collection = query.collection as string
    
    if (collection) {
      const info = hadithBookInfo[collection]
      if (!info) {
        return { books: [], error: `Collection '${collection}' not found` }
      }
      
      let sections = []
      try {
        sections = getIndexedSections(collection) || []
      } catch (e) {
        console.log('[Books] No sections found, using defaults')
      }
      
      const books = []
      for (let i = 1; i <= info.chapters; i++) {
        const section = sections.find((s: any) => s.id === i || s.number === i)
        books.push({
          slug: i.toString(),
          name: section?.title || `Book ${i}`,
          hadithCount: section?.hadiths?.length || info.hadithCount,
          chapterNumber: i,
          grade: info.grade,
          introduction: section?.introduction || section?.preface || '',
          book: section?.book || ''
        })
      }
      return { books, error: null }
    }
    
    const books = Object.entries(hadithBookInfo).map(([slug, info]) => ({
      slug,
      name: info.name,
      hadithCount: info.hadithCount,
      chapters: info.chapters,
      grade: info.grade,
      description: `${info.hadithCount.toLocaleString()} ahadith in ${info.chapters} books`
    }))
    
    return { books, error: null }
  } catch (error: any) {
    console.error('Hadith books API error:', error)
    return { books: [], error: error?.message || 'Failed to load hadith books' }
  }
})