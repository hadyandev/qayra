import { ref, computed } from 'vue'

interface QfBookmark {
  id: string
  verseKey: string
  chapterNumber: number
  verseNumber: number
  createdAt?: string
}

const bookmarks = ref<QfBookmark[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const isConnected = ref(false)

export function useQfBookmarks() {
  async function fetchBookmarks() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await $fetch<{ 
        bookmarks: QfBookmark[]; 
        error: string | null;
        needsReauth?: boolean;
      }>('/api/qf/bookmarks', {
        credentials: 'include'
      })
      
      if (data.needsReauth || data.error === 'SESSION_EXPIRED') {
        isConnected.value = false
        bookmarks.value = []
        error.value = 'Session expired. Please reconnect your QF account.'
        return
      }
      
      if (data.error && data.error.includes('Connect your Quran Foundation')) {
        isConnected.value = false
        bookmarks.value = []
      } else {
        isConnected.value = true
        bookmarks.value = data.bookmarks || []
      }
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch bookmarks'
      bookmarks.value = []
    } finally {
      isLoading.value = false
    }
  }
  
  async function addBookmark(chapterNumber: number, verseNumber: number) {
    error.value = null
    
    try {
      const data = await $fetch<{ 
        success: boolean; 
        bookmark: QfBookmark | null; 
        error: string | null; 
        needsReauth?: boolean 
      }>(
        '/api/qf/bookmarks',
        {
          method: 'POST',
          body: { chapterNumber, verseNumber }
        }
      )
      
      if (data.needsReauth || data.error === 'SESSION_EXPIRED') {
        error.value = 'Session expired. Please reconnect your QF account.'
        isConnected.value = false
        return { success: false, error: error.value, needsReauth: true }
      }
      
      if (data.success && data.bookmark) {
        bookmarks.value.unshift(data.bookmark)
        return { success: true }
      }
      
      return { success: false, error: data.error || 'Failed to add bookmark' }
    } catch (e: any) {
      error.value = e?.message || 'Failed to add bookmark'
      return { success: false, error: error.value }
    }
  }
  
  async function removeBookmark(bookmarkId: string) {
    error.value = null
    
    try {
      const data = await $fetch<{ success: boolean; error: string | null }>(
        `/api/qf/bookmarks/${bookmarkId}`,
        { method: 'DELETE' }
      )
      
      if (data.success) {
        bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId)
        return { success: true }
      }
      
      return { success: false, error: data.error || 'Failed to remove bookmark' }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to remove bookmark' }
    }
  }
  
  function isVerseBookmarked(chapterNumber: number, verseNumber: number): QfBookmark | undefined {
    return bookmarks.value.find(
      b => b.chapterNumber === chapterNumber && b.verseNumber === verseNumber
    )
  }
  
  const bookmarkCount = computed(() => bookmarks.value.length)
  
  return {
    bookmarks,
    isLoading,
    error,
    isConnected,
    bookmarkCount,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    isVerseBookmarked
  }
}