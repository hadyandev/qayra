<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-3xl mx-auto px-6 py-12">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 mb-8">
        <NuxtLink to="/hadith" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Hadith</NuxtLink>
        <template v-if="slug.length > 0">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          <span class="text-[#18181B] dark:text-stone-200">{{ collectionName }}</span>
        </template>
        <template v-if="slug.length > 1">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          <span class="text-[#18181B] dark:text-stone-200">Book {{ slug[1] }}</span>
        </template>
      </nav>

      <!-- Level 0: Collections list -->
      <template v-if="slug.length === 0">
        <h1 class="text-4xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-8">Hadith</h1>
        
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <div v-else class="grid gap-4">
          <NuxtLink
            v-for="edition in editions"
            :key="edition.slug"
            :to="`/hadith/${edition.slug}`"
            class="block p-6 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-300 hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100">{{ edition.name }}</h2>
                <p class="text-sm text-[#52525B] dark:text-stone-400 mt-1">{{ edition.books }} books · {{ edition.hadiths }} hadiths</p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-stone-400" />
            </div>
          </NuxtLink>
        </div>
      </template>

      <!-- Level 1: Collection detail / Books list -->
      <template v-else-if="slug.length === 1">
        <h1 class="text-4xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-8">{{ collectionName }}</h1>
        
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <div v-else class="grid gap-4">
          <NuxtLink
            v-for="book in books"
            :key="book.slug"
            :to="`/hadith/${slug[0]}/${book.slug}`"
            class="block p-6 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-300 hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100">{{ book.name }}</h2>
                <p class="text-sm text-[#52525B] dark:text-stone-400 mt-1">{{ book.hadithCount }} hadiths</p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-stone-400" />
            </div>
          </NuxtLink>
        </div>
      </template>

      <!-- Level 2: Book detail / Hadiths list -->
      <template v-else-if="slug.length === 2">
        <h1 class="text-4xl font-light text-[#18181B] dark:text-stone-100 tracking-tight mb-2">{{ bookName }}</h1>
        <p class="text-[#52525B] dark:text-stone-400 mb-8">{{ collectionName }}</p>
        
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <div v-else class="space-y-4">
          <NuxtLink
            v-for="hadith in hadiths"
            :key="hadith.hadithnumber"
            :to="`/hadith/${slug[0]}/${slug[1]}/${hadith.hadithnumber}`"
            class="block p-6 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-300 hover:shadow-md"
          >
            <div class="flex items-start gap-4">
              <span class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-full text-sm font-medium text-[#18181B] dark:text-stone-100">
                {{ hadith.hadithnumber }}
              </span>
              <p class="text-[#18181B] dark:text-stone-200 line-clamp-3">{{ hadith.text }}</p>
            </div>
          </NuxtLink>
        </div>
      </template>

      <!-- Level 3: Hadith detail -->
      <template v-else-if="slug.length === 3">
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <template v-else-if="hadith">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] p-8 md:p-12 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-sm font-medium text-[#52525B] dark:text-stone-400 mb-6">
              {{ collectionName }} · Book {{ slug[1] }} · {{ slug[2] }}
            </span>
            
            <p class="text-2xl md:text-3xl text-[#18181B] dark:text-stone-100 leading-relaxed">
              {{ hadith.text }}
            </p>
            
            <div v-if="hadith.grades?.length" class="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
              <h3 class="text-sm font-medium text-[#52525B] dark:text-stone-400 uppercase tracking-wide mb-3">Grading</h3>
              <div class="space-y-2">
                <p v-for="grade in hadith.grades" :key="grade" class="text-[#18181B] dark:text-stone-200">
                  {{ grade }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => route.params.slug || [])

const loading = ref(true)
const collectionName = ref('')
const bookName = ref('')
const books = ref([])
const hadiths = ref([])
const hadith = ref(null)

const editions = ref([])

onMounted(async () => {
  loading.value = true
  
  try {
    if (slug.value.length === 0) {
      // Level 0: List all editions
      const data = await $fetch('/api/hadith/books')
      const booksData = data.books || []
      
      const editionsMap = {}
      for (const book of booksData) {
        if (!editionsMap[book.slug]) {
          editionsMap[book.slug] = { name: book.name, slug: book.slug, books: 0, hadiths: 0 }
        }
        editionsMap[book.slug].books++
        editionsMap[book.slug].hadiths += book.hadithCount || 0
      }
      editions.value = Object.values(editionsMap)
    }
    else if (slug.value.length === 1) {
      // Level 1: List books in collection
      const collection = slug.value[0]
      collectionName.value = collection.charAt(0).toUpperCase() + collection.slice(1)
      
      const data = await $fetch(`/api/hadith/books?collection=${collection}`)
      books.value = data.books || []
    }
    else if (slug.value.length === 2) {
      // Level 2: List hadiths in book
      const collection = slug.value[0]
      const bookNumber = slug.value[1]
      collectionName.value = collection.charAt(0).toUpperCase() + collection.slice(1)
      
      const data = await $fetch(`/api/hadith/list?collection=${collection}&bookNumber=${bookNumber}`)
      hadiths.value = data.hadiths || []
      
      if (books.value.length > 0) {
        bookName.value = books.value.find(b => b.slug === bookNumber)?.name || `Book ${bookNumber}`
      }
    }
    else if (slug.value.length === 3) {
      // Level 3: Get hadith detail
      const collection = slug.value[0]
      const bookNumber = slug.value[1]
      const hadithNumber = slug.value[2]
      collectionName.value = collection.charAt(0).toUpperCase() + collection.slice(1)
      
      const data = await $fetch(`/api/hadith/detail?collection=${collection}&bookNumber=${bookNumber}&hadithNumber=${hadithNumber}`)
      hadith.value = data.hadith || null
    }
  } catch (e) {
    console.error('[Hadith] Error:', e)
  } finally {
    loading.value = false
  }
})
</script>