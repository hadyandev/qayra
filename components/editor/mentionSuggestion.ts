import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import MentionList from './MentionList.vue'
import { $fetch } from 'ofetch'

interface Chapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
  transliteration?: string
}

interface VersePreview {
  key: string
  text: string
  translation: string
}

const versePreviewCache = new Map<string, VersePreview[]>()
let chaptersCache: Chapter[] = []
let cacheTime = 0
const CACHE_DURATION = 60000

async function loadChapters(): Promise<Chapter[]> {
  const now = Date.now()
  if (chaptersCache.length > 0 && now - cacheTime < CACHE_DURATION) {
    return chaptersCache
  }

  try {
    const data = await $fetch<{ chapters: Chapter[] }>('/api/quran/chapters')
    chaptersCache = data.chapters || []
    cacheTime = now
    return chaptersCache
  } catch (e) {
    console.error('Failed to load chapters:', e)
    return chaptersCache.length > 0 ? chaptersCache : []
  }
}

async function loadVersePreviews(chapterId: number): Promise<VersePreview[]> {
  const cacheKey = `ch-${chapterId}`
  if (versePreviewCache.has(cacheKey)) {
    return versePreviewCache.get(cacheKey)!
  }
  
  try {
    const data = await $fetch<{ verses: VersePreview[]; error?: string }>(
      `/api/quran/chapter-verses?chapterId=${chapterId}`
    )
    if (data.verses && data.verses.length > 0) {
      versePreviewCache.set(cacheKey, data.verses)
      return data.verses
    }
  } catch (e) {
    console.error(`Failed to load verse previews for chapter ${chapterId}:`, e)
  }
  return []
}

export default {
  items: async ({ query }: { query: string }) => {
    const chapters = await loadChapters()
    const q = query.trim().toLowerCase().replace(/^@/, '')
    
    if (!q) {
      return chapters
    }
    
    // Case 1: Query ends with ':' → show all verses in that chapter
    if (q.endsWith(':')) {
      const chapterPart = q.slice(0, -1)
      const chapterNum = parseInt(chapterPart)
      if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= 114) {
        const chapter = chapters.find(c => c.id === chapterNum)
        if (chapter) {
          const previews = await loadVersePreviews(chapterNum)
          return Array.from({ length: chapter.verses_count }, (_, i) => ({
            chapter_id: chapterNum,
            verse_number: i + 1,
            key: `${chapterNum}:${i + 1}`,
            text: previews[i]?.text || '',
            translation: previews[i]?.translation || '',
            chapter_name: chapter.name_simple
          }))
        }
      }
      return []
    }
    
    // Case 2: Query contains ':' → filter verses
    if (q.includes(':')) {
      const [chapterPart, versePart] = q.split(':')
      const chapterNum = parseInt(chapterPart)
      if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= 114) {
        const chapter = chapters.find(c => c.id === chapterNum)
        if (chapter) {
          const previews = await loadVersePreviews(chapterNum)
          const verses = Array.from({ length: chapter.verses_count }, (_, i) => ({
            chapter_id: chapterNum,
            verse_number: i + 1,
            key: `${chapterNum}:${i + 1}`,
            text: previews[i]?.text || '',
            translation: previews[i]?.translation || '',
            chapter_name: chapter.name_simple
          }))
          if (versePart) {
            const filterStr = versePart.toLowerCase()
            return verses.filter(v => v.verse_number.toString().startsWith(filterStr)).slice(0, 10)
          }
          return verses.slice(0, 10)
        }
      }
      return []
    }
    
    // Case 3: Pure number query (1-114) → show matching chapters AND verses
    if (/^\d{1,3}$/.test(q)) {
      const num = parseInt(q)
      if (num >= 1 && num <= 114) {
        // Exact chapter match
        const exactChapter = chapters.find(c => c.id === num)
        
        if (exactChapter) {
          // Show the chapter + its first verses
          const previews = await loadVersePreviews(num)
          const verseItems = Array.from({ length: Math.min(exactChapter.verses_count, 5) }, (_, i) => ({
            chapter_id: num,
            verse_number: i + 1,
            key: `${num}:${i + 1}`,
            text: previews[i]?.text || '',
            translation: previews[i]?.translation || '',
            chapter_name: exactChapter.name_simple
          }))
          return [exactChapter, ...verseItems]
        }
        
        // No exact match — search by name
        return chapters.filter(c =>
          c.name_simple?.toLowerCase().includes(q) ||
          c.name_arabic.includes(q) ||
          c.transliteration?.toLowerCase().includes(q)
        ).slice(0, 10)
      }
      return []
    }
    
    // Case 4: Text query → search chapters by name
    return chapters.filter(c => 
      c.id.toString() === q ||
      c.name_simple.toLowerCase().includes(q) ||
      c.name_arabic.includes(q) ||
      c.transliteration?.toLowerCase().includes(q)
    ).slice(0, 10)
  },

  render: () => {
    let component: VueRenderer
    let popup: any
    
    return {
      onStart: (props: any) => {
        component = new VueRenderer(MentionList, {
          props: { items: props.items, command: props.command },
          editor: props.editor,
        })
        
        if (!props.clientRect) {
          return
        }
        
        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          animation: 'fade',
          maxWidth: 400,
        })
      },
      
      onUpdate(props: any) {
        if (component) {
          component.updateProps({ items: props.items, command: props.command })
        }
        if (popup && popup[0]) {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          })
        }
      },
      
      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide()
          return true
        }
        
        return component?.ref?.onKeyDown?.(props.event)
      },
      
      onExit() {
        popup?.[0]?.destroy()
        component?.destroy()
      },
    }
  },
}
