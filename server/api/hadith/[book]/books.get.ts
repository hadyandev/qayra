import { hadithEditions } from '../../../utils/hadithData'
import { getIndexedHadiths, getIndexedSections } from '../../../utils/hadithFetch'

export default defineEventHandler(async (event) => {
  const bookSlug = event.context.params?.book as string

  if (!bookSlug) {
    return { books: [], error: 'Book slug is required' }
  }

  const editionKey = hadithEditions[bookSlug]
  if (!editionKey) {
    return { books: [], error: 'Invalid book slug' }
  }

  try {
    await getIndexedHadiths(editionKey)
    const sections = getIndexedSections(editionKey)
    
    const books = sections.map((section, index) => ({
      id: section.id || index + 1,
      title: section.title || `Book ${index + 1}`,
      chapterNumber: index + 1
    }))

    return {
      books,
      pagination: {
        page: 1,
        limit: books.length,
        total: books.length,
        totalPages: 1
      },
      error: null
    }
  } catch (error: any) {
    console.error('Hadith books API error:', error)
    return { books: [], error: error?.message || 'Failed to load books' }
  }
})