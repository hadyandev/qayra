import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import MentionList from './MentionList.vue'
import { $fetch } from 'ofetch'

interface Chapter {
  id: number
  name_simple: string
  name_arabic: string
  verse_count: number
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
    const data = await $fetch<{ chapters: Chapter[] }>('/api/chapters')
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
    const q = query.trim()

    if (!q) {
      return chapters.slice(0, 10)
    }

    if (q.endsWith(':')) {
      const chapterPart = q.slice(0, -1)
      const chapterNum = parseInt(chapterPart)
      if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= 114) {
        const chapter = chapters.find(c => c.id === chapterNum)
        if (chapter) {
          const previews = await loadVersePreviews(chapterNum)
          const items = Array.from({ length: chapter.verse_count }, (_, i) => ({
            chapter_id: chapterNum,
            verse_number: i + 1,
            key: `${chapterNum}:${i + 1}`,
            text: previews[i]?.text || '',
            translation: previews[i]?.translation || '',
            chapter_name: chapter.name_simple
          }))
          return items
        }
      }
      return []
    }

    if (q.includes(':')) {
      const [chapterPart, versePart] = q.split(':')
      const chapterNum = parseInt(chapterPart)
      if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= 114) {
        const chapter = chapters.find(c => c.id === chapterNum)
        if (chapter) {
          const previews = await loadVersePreviews(chapterNum)
          const verses = Array.from({ length: chapter.verse_count }, (_, i) => ({
            chapter_id: chapterNum,
            verse_number: i + 1,
            key: `${chapterNum}:${i + 1}`,
            text: previews[i]?.text || '',
            translation: previews[i]?.translation || '',
            chapter_name: chapter.name_simple
          }))
          if (versePart) {
            return verses.filter(v => v.key.split(':')[1].startsWith(versePart.toLowerCase())).slice(0, 10)
          }
          return verses.slice(0, 10)
        }
      }
      return []
    }

    const chapterNum = parseInt(q)
    if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= 114) {
      return chapters.filter(c => 
        c.id === chapterNum || c.name_simple.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 10)
    }

    return chapters.filter(c => 
      c.id.toString().startsWith(q.toLowerCase()) || 
      c.name_simple.toLowerCase().includes(q.toLowerCase()) ||
      c.name_arabic.includes(q) ||
      c.transliteration?.toLowerCase().includes(q.toLowerCase())
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
