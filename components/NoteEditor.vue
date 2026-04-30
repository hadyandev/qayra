<template>
  <ClientOnly>
    <div class="note-editor border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-900">
      <!-- Toolbar -->
      <div v-if="editor" class="flex items-center gap-1 px-3 py-2 border-b border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50">
        <button 
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'bg-stone-200 dark:bg-stone-700': editor.isActive('bold') }"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Bold"
        >
          <UIcon name="i-heroicons-bold" class="w-4 h-4" />
        </button>
        <button 
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'bg-stone-200 dark:bg-stone-700': editor.isActive('italic') }"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Italic"
        >
          <UIcon name="i-heroicons-italic" class="w-4 h-4" />
        </button>
        <button 
          type="button"
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'bg-stone-200 dark:bg-stone-700': editor.isActive('strike') }"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Strikethrough"
        >
          <UIcon name="i-heroicons-minus" class="w-4 h-4" />
        </button>
        
        <div class="w-px h-5 bg-stone-200 dark:bg-stone-700 mx-1"></div>
        
        <button 
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'bg-stone-200 dark:bg-stone-700': editor.isActive('heading', { level: 2 }) }"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-bold"
          title="Heading"
        >
          H
        </button>
        <button 
          type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'bg-stone-200 dark:bg-stone-700': editor.isActive('bulletList') }"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Bullet List"
        >
          <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
        </button>
        <button 
          type="button"
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'bg-stone-200 dark:bg-stone-700': editor.isActive('orderedList') }"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Numbered List"
        >
          <UIcon name="i-heroicons-list-numbers" class="w-4 h-4" />
        </button>
        <button 
          type="button"
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'bg-stone-200 dark:bg-stone-700': editor.isActive('blockquote') }"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Quote"
        >
          <UIcon name="i-heroicons-chat-bubble-left" class="w-4 h-4" />
        </button>
        
        <div class="w-px h-5 bg-stone-200 dark:bg-stone-700 mx-1"></div>
        
        <button 
          type="button"
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().undo()"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-30"
          title="Undo"
        >
          <UIcon name="i-heroicons-arrow-uturn-left" class="w-4 h-4" />
        </button>
        <button 
          type="button"
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().redo()"
          class="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-30"
          title="Redo"
        >
          <UIcon name="i-heroicons-arrow-uturn-right" class="w-4 h-4" />
        </button>
        
        <div class="flex-1"></div>
        
        <span class="text-xs text-stone-400">Type @ to cite verses</span>
      </div>
      
      <EditorContent :editor="editor" class="prose dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none" />
    </div>
    <template #fallback>
      <UTextarea :model-value="modelValue" rows="10" class="w-full" readonly />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import { Node, mergeAttributes } from '@tiptap/core'
import suggestion from './editor/mentionSuggestion'

const router = useRouter()

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const VerseRef = Node.create({
  name: 'verseRef',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      verseKey: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-verse-ref]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-verse-ref': '' }, HTMLAttributes), `@${HTMLAttributes.verseKey} => `]
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const dom = document.createElement('span')
      dom.className = 'verse-ref'
      dom.setAttribute('data-verse-ref', node.attrs.verseKey)
      dom.innerHTML = `@${node.attrs.verseKey} => `
      return { dom }
    }
  },
})

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [2, 3]
      }
    }),
    VerseRef,
    Placeholder.configure({
      placeholder:
        'Write your reflection... Type @ to cite verses like @1:1 => ""'
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      renderHTML({ node }) {
        const verseKey = node.attrs.label || node.attrs.id
        return [
          'a',
          {
            href: `/verse/${verseKey}`,
            class: 'mention text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md font-mono text-sm border-b-2 border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer no-underline',
            'data-verse-key': verseKey,
          },
          `@${verseKey}`,
        ]
      },
      suggestion: {
        ...suggestion,
        command: ({ editor, range, props }) => {
          const item = props
          if (item.verse_number !== undefined || item.chapter_id !== undefined) {
            const verseKey = item.key
            editor.chain().focus().deleteRange(range).insertContent([
              {
                type: 'text',
                text: `@${verseKey} => ""`
              }
            ]).run()
            setTimeout(() => {
              const { state } = editor
              const { selection } = state
              const pos = selection.to
              editor.chain().focus().setTextSelection(pos - 1).run()
            }, 10)
          } else {
            const chapterId = item.id
            editor.chain().focus().deleteRange(range).insertContent(`@${chapterId}:`).run()
          }
        },
      },
      addAttributes() {
        return {
          verseKey: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-verse-key'),
            renderHTML: (attributes) => {
              if (!attributes.verseKey) return {}
              return { 'data-verse-key': attributes.verseKey }
            },
          },
        }
      },
    }),
  ],
  content: props.modelValue || '',
  editorProps: {
    attributes: {
      class: 'focus:outline-none min-h-[180px] [&_p]:my-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#18181B] dark:[&_h2]:text-stone-100 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-600 dark:[&_blockquote]:text-stone-400'
    },
    handleClick(view, pos, event) {
      const target = event.target as HTMLElement
      if (target.classList.contains('mention') || target.closest('.mention')) {
        const link = target.closest('a.mention') as HTMLAnchorElement
        if (link && link.href) {
          event.preventDefault()
          router.push(link.pathname)
          return true
        }
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(
  () => props.modelValue,
  (html) => {
    const e = editor.value
    if (!e || html === e.getHTML()) return
    e.commands.setContent(html || '', { emitUpdate: false })
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.note-editor .ProseMirror {
  min-height: 180px;
}

.note-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #a8a29e;
  pointer-events: none;
  height: 0;
}

.note-editor .ProseMirror a.mention {
  cursor: pointer;
  text-decoration: none;
}

.note-editor .ProseMirror .verse-ref {
  display: inline;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  color: #d97706;
  background-color: rgba(253, 230, 138, 0.3);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.note-editor .ProseMirror .verse-ref[data-verse-ref] {
  cursor: pointer;
}

.note-editor .ProseMirror .verse-ref:hover {
  background-color: rgba(253, 230, 138, 0.5);
}

.note-editor .ProseMirror:focus {
  outline: none;
}
</style>
