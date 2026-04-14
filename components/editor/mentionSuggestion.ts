import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import MentionList from './MentionList.vue'
import { $fetch } from 'ofetch'

// Basic debounce utility
function debounce(func: Function, wait: number) {
  let timeout: any
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default {
  items: async ({ query }: { query: string }) => {
    if (!query || query.length < 2) return []

    try {
      const q = query.toLowerCase()
      // Call our internal QF API proxy
      const data = await $fetch('/api/quran/search', {
        query: { q }
      })
      
      // Limit to 5 results to keep the UI clean and fast
      return Array.isArray(data?.results) ? data.results.slice(0, 5) : []
    } catch (e) {
      console.error('Failed to fetch mentions:', e)
      return []
    }
  },

  render: () => {
    let component: VueRenderer
    let popup: any

    return {
      onStart: (props: any) => {
        component = new VueRenderer(MentionList, {
          props,
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
          animation: 'fade', // Tippy built-in animation for a premium feel
        })
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide()
          return true
        }

        return component?.ref?.onKeyDown(props.event)
      },

      onExit() {
        if (popup) {
          popup[0].destroy()
        }
        if (component) {
          component.destroy()
        }
      },
    }
  },
}
