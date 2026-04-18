import { hadithBookInfo } from '../../utils/hadithData'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const collection = query.collection as string
    
    if (collection) {
      const info = hadithBookInfo[collection]
      if (!info) {
        return { books: [], error: `Collection '${collection}' not found` }
      }
      
      const books = []
      for (let i = 1; i <= info.chapters; i++) {
        books.push({
          slug: i.toString(),
          name: `Book ${i}`,
          hadithCount: info.hadithCount || 0,
          chapterNumber: i,
          grade: info.grade,
          description: info.description || ''
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