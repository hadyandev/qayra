import { hadithEditions, hadithBookInfo } from './hadithData'

interface CachedData {
  data: any
  timestamp: number
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

const cache = new Map<string, CachedData>()

const URL_PRIORITIES = [
  'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{edition}.min.json',
  'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{edition}.json',
  'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/{edition}.min.json',
  'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/{edition}.json',
]

function getCacheKey(edition: string): string {
  return `hadith:${edition}`
}

function getCached(edition: string): any | null {
  const cached = cache.get(getCacheKey(edition))
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[HadithFetch] Cache hit for ${edition}`)
    return cached.data
  }
  cache.delete(getCacheKey(edition))
  return null
}

function setCached(edition: string, data: any): void {
  cache.set(getCacheKey(edition), { data, timestamp: Date.now() })
}

export async function fetchHadithEdition(edition: string): Promise<any> {
  const cached = getCached(edition)
  if (cached) return cached

  for (let i = 0; i < URL_PRIORITIES.length; i++) {
    const url = URL_PRIORITIES[i].replace('{edition}', edition)
    try {
      console.log(`[HadithFetch] Trying ${url}`)
      const response = await $fetch(url, { 
        timeout: 15000,
        headers: { 'Accept': 'application/json' }
      })
      
      console.log(`[HadithFetch] Success from priority ${i + 1}: ${url}`)
      setCached(edition, response)
      return response
    } catch (error: any) {
      console.log(`[HadithFetch] Failed (priority ${i + 1}): ${error?.message || error}`)
    }
  }

  throw new Error(`All fallback URLs failed for edition: ${edition}`)
}

export function clearHadithCache(edition?: string): void {
  if (edition) {
    cache.delete(getCacheKey(edition))
  } else {
    cache.clear()
  }
}

// Pre-indexed data for fast lookup
const indexedHadiths = new Map<string, Map<number, any>>()
const indexedSections = new Map<string, any[]>()

export async function getIndexedHadiths(edition: string): Promise<Map<number, any>> {
  if (indexedHadiths.has(edition)) {
    return indexedHadiths.get(edition)!
  }

  const data = await fetchHadithEdition(edition)
  console.log('[Index] Data keys:', data ? Object.keys(data) : 'null')
  
  const hadithMap = new Map<number, any>()
  const sections: any[] = []

  // Handle different data structures
  let sectionsArray: any[] = []
  
  if (data && typeof data === 'object') {
    // New format: metadata.sections is object, metadata.section_details maps hadith numbers to chapters
    if (data.metadata?.sections && data.hadiths) {
      const sectionObj = data.metadata.sections
      const sectionDetails = data.metadata.section_details || {}
      const hadithList = data.hadiths
      
      // Create sections from metadata.sections
      Object.entries(sectionObj).forEach(([id, title]) => {
        if (title && id !== '0') {
          sections.push({ id: parseInt(id), title })
        }
      })
      
      // Build map from hadith number to chapter ID using section_details
      const hadithToChapter = new Map<number, number>()
      Object.entries(sectionDetails).forEach(([chapterId, details]: [string, any]) => {
        const chapterNum = parseInt(chapterId)
        if (chapterNum > 0 && details.hadithnumber_first && details.hadithnumber_last) {
          for (let n = details.hadithnumber_first; n <= details.hadithnumber_last; n++) {
            hadithToChapter.set(n, chapterNum)
          }
        }
      })
      
      // Map hadiths to their chapter
      for (const h of hadithList) {
        const hadithNum = h.hadithnumber || h.hadithNumber || 1
        const chapterId = hadithToChapter.get(hadithNum) || 1
        const sectionTitle = sectionObj[chapterId] || 'Unknown'
        hadithMap.set(hadithNum, {
          ...h,
          chapterId,
          chapterTitle: sectionTitle
        })
      }
    } else if (Array.isArray(data)) {
      sectionsArray = data
    } else if (data.sections) {
      sectionsArray = data.sections
    } else if (data.chapters) {
      sectionsArray = data.chapters
    } else if (data.books) {
      sectionsArray = data.books
    } else if (data.hadiths) {
      sectionsArray = [{ id: 1, title: 'All Hadiths', hadiths: data.hadiths }]
    }
  }
  
  console.log('[Index] sections found:', sections.length, 'hadiths found:', hadithMap.size)

  indexedHadiths.set(edition, hadithMap)
  indexedSections.set(edition, sections)

  return hadithMap
}

export function getIndexedSections(edition: string): any[] {
  return indexedSections.get(edition) || []
}

export { hadithEditions, hadithBookInfo }