<template>
  <div class="flex items-center gap-2">
    <!-- Logo Mark -->
    <div :class="[sizeClass, 'flex-shrink-0 relative']">
      <img src="/logo-light.png" alt="Qayra Logo" class="absolute inset-0 w-full h-full object-contain dark:hidden" />
      <img src="/logo-dark.png" alt="Qayra Logo" class="absolute inset-0 w-full h-full object-contain hidden dark:block" />
    </div>

    <!-- Logo Text -->
    <span v-if="!iconOnly" :class="[textClass, 'font-display tracking-tight text-[#18181B] dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors duration-300']">
      Qayra
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  iconOnly: {
    type: Boolean,
    default: false
  }
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16'
  }
  return sizes[props.size as keyof typeof sizes] || sizes.md
})

const textClass = computed(() => {
  const sizes = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-semibold',
    xl: 'text-4xl font-medium'
  }
  return sizes[props.size as keyof typeof sizes] || sizes.md
})
</script>
