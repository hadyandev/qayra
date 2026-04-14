<template>
  <ClientOnly>
    <div class="note-editor border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-900">
      <EditorContent :editor="editor" class="prose dark:prose-invert max-w-none p-3 min-h-[200px] focus:outline-none" />
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
import suggestion from './editor/mentionSuggestion'

const router = useRouter()

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder:
        'Write your note… Cite verses with @surah:ayah (e.g. @2:153).'
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
        'data-verse-key': '',
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
      suggestion,
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
      class: 'focus:outline-none min-h-[180px] px-1 [&_p]:my-1 [&_a.mention]:cursor-pointer'
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
.note-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #a8a29e;
  pointer-events: none;
  height: 0;
}

.note-editor .ProseMirror a.mention {
  cursor: pointer;
}

.note-editor .ProseMirror a.mention:hover {
  text-decoration: none;
}
</style>
