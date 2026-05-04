import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const query = ref('')
let inputFocusFn: (() => void) | null = null

export function useCommandPalette() {
  function open() {
    isOpen.value = true
    query.value = ''
    nextTick(() => inputFocusFn?.())
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  function registerInputFocus(fn: () => void) {
    inputFocusFn = fn
  }

  return {
    isOpen,
    query,
    open,
    close,
    toggle,
    registerInputFocus
  }
}
