<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-stone-950">
    <div class="max-w-4xl mx-auto px-6 py-12">
      
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-[#52525B] dark:text-stone-400 mb-8">
        <NuxtLink to="/hadith" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Hadith</NuxtLink>
        <template v-if="slug.length > 0">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          <NuxtLink :to="`/hadith/${slug[0]}`" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
            {{ collectionName }}
          </NuxtLink>
        </template>
        <template v-if="slug.length > 1">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          <NuxtLink :to="`/hadith/${slug[0]}/${slug[1]}`" class="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
            {{ getBookBreadcrumbLabel(slug[1]) }}
          </NuxtLink>
        </template>
        <template v-if="slug.length > 2">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          <span class="text-[#18181B] dark:text-stone-200">Hadith {{ slug[2] }}</span>
        </template>
      </nav>

      <!-- Level 0: Collections list -->
      <template v-if="slug.length === 0">
        <header class="mb-10">
          <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">Hadith</h1>
          <p class="text-lg text-[#52525B] dark:text-stone-400 mt-2">Explore ahadith from the six major hadith collections</p>
        </header>
        
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <div v-else class="grid gap-4">
          <NuxtLink
            v-for="edition in editions"
            :key="edition.slug"
            :to="`/hadith/${edition.slug}`"
            class="group block p-6 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-300 hover:shadow-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="inline-flex items-center px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400">
                    {{ edition.grade }}
                  </span>
                  <h2 class="text-xl font-medium text-[#18181B] dark:text-stone-100">{{ edition.name }}</h2>
                </div>
                <p class="text-sm text-[#52525B] dark:text-stone-400">
                  {{ edition.books }} books · {{ edition.hadiths.toLocaleString() }} ahadith
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
            </div>
          </NuxtLink>
        </div>
      </template>

      <!-- Level 1: Collection detail / Books list -->
      <template v-else-if="slug.length === 1">
        <header class="mb-10">
          <div class="flex items-center gap-3 mb-2">
            <span class="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full text-sm font-medium text-amber-700 dark:text-amber-400">
              {{ collectionGrade }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">{{ collectionName }}</h1>
          <p class="text-lg text-[#52525B] dark:text-stone-400 mt-2">{{ books.length }} books · {{ totalHadiths.toLocaleString() }} ahadith</p>
        </header>
        
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <div v-else class="space-y-6">
          <NuxtLink
            v-for="(book, index) in books"
            :key="book.slug"
            :to="`/hadith/${slug[0]}/${book.slug}`"
            class="group block p-5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-300 hover:shadow-md"
          >
            <div class="flex items-start gap-4">
              <span class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-full text-sm font-medium text-[#52525B] dark:text-stone-400">
                {{ index + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-medium text-[#18181B] dark:text-stone-100">{{ book.name }}</h2>
                <p class="text-sm text-[#52525B] dark:text-stone-400 mt-1">{{ book.hadithCount }} ahadith</p>
                <p v-if="book.introduction" class="text-sm text-[#52525B] dark:text-stone-400 mt-2 line-clamp-2">{{ book.introduction }}</p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-1" />
            </div>
          </NuxtLink>
        </div>
      </template>

      <!-- Level 2: Book detail / Hadiths list -->
      <template v-else-if="slug.length === 2">
        <header class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <span class="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full text-sm font-medium text-amber-700 dark:text-amber-400">
              {{ collectionGrade }}
            </span>
            <span class="text-sm text-[#52525B] dark:text-stone-400">Book {{ slug[1] }}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-light text-[#18181B] dark:text-stone-100 tracking-tight">{{ bookInfo.title }}</h1>
          <p class="text-lg text-[#52525B] dark:text-stone-400 mt-1">{{ collectionName }}</p>
          
          <div v-if="bookInfo.introduction" class="mt-4 p-4 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-xl">
            <p class="text-sm text-[#52525B] dark:text-stone-400">{{ bookInfo.introduction }}</p>
          </div>
        </header>
        
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <div v-else class="space-y-4">
          <NuxtLink
            v-for="hadith in hadiths"
            :key="hadith.hadithnumber"
            :to="`/hadith/${slug[0]}/${slug[1]}/${hadith.hadithnumber}`"
            class="group block p-5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl hover:border-amber-200 dark:hover:border-amber-700/50 transition-all duration-300 hover:shadow-lg"
          >
            <div class="flex items-start gap-4">
              <span class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-full text-base font-medium text-[#18181B] dark:text-stone-100">
                {{ hadith.hadithnumber }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-[#18181B] dark:text-stone-200 leading-relaxed line-clamp-3">{{ hadith.text }}</p>
                <div class="mt-3 flex items-center gap-4">
                  <span v-if="hadith.grade" class="inline-flex items-center px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-xs font-medium text-[#52525B] dark:text-stone-400">
                    {{ hadith.grade }}
                  </span>
                  <span v-if="hadith.chapterTitle" class="flex items-center gap-1 text-sm text-[#52525B] dark:text-stone-400">
                    <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
                    {{ hadith.chapterTitle }}
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
        
        <div v-if="hadiths.length === 0" class="text-center py-12 text-[#52525B] dark:text-stone-400">
          No ahadith found in this book.
        </div>
      </template>

      <!-- Level 3: Hadith detail -->
      <template v-else-if="slug.length === 3">
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-stone-200 dark:border-stone-700 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        
        <template v-else-if="hadith">
          <div class="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] p-8 md:p-12 ring-1 ring-stone-200/30 dark:ring-stone-800/30">
            <div class="flex items-center gap-3 mb-6">
              <NuxtLink 
                :to="`/hadith/${slug[0]}/${slug[1]}`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-sm font-medium text-[#52525B] dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
                Back
              </NuxtLink>
            </div>
            
            <div class="flex items-center gap-3 mb-6">
              <span class="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full text-sm font-medium text-amber-700 dark:text-amber-400">
                {{ hadith.grade }}
              </span>
              <span class="text-sm text-[#52525B] dark:text-stone-400">
                {{ collectionName }} · Book {{ slug[1] }} · Hadith {{ slug[2] }}
              </span>
            </div>
            
            <div class="mb-8">
              <h2 class="text-sm font-medium text-[#52525B] dark:text-stone-400 uppercase tracking-wide mb-3">Hadith Text</h2>
              <p class="text-2xl md:text-3xl text-[#18181B] dark:text-stone-100 leading-relaxed">
                {{ hadith.text }}
              </p>
            </div>
            
            <div v-if="hadith.chapterTitle" class="mb-6 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <h3 class="text-sm font-medium text-[#52525B] dark:text-stone-400 uppercase tracking-wide mb-2">Chapter</h3>
              <p class="text-lg text-[#18181B] dark:text-stone-200">{{ hadith.chapterTitle }}</p>
            </div>
            
            <div v-if="hadith.grades && hadith.grades.length > 1" class="mb-6 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <h3 class="text-sm font-medium text-[#52525B] dark:text-stone-400 uppercase tracking-wide mb-2">Grading</h3>
              <div class="space-y-1">
                <p v-for="grade in hadith.grades" :key="grade" class="text-[#18181B] dark:text-stone-200">
                  {{ grade }}
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-4 pt-6 border-t border-stone-200 dark:border-stone-800">
              <NuxtLink 
                v-if="parseInt(slug[2]) > 1"
                :to="`/hadith/${slug[0]}/${slug[1]}/${parseInt(slug[2]) - 1}`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-[#18181B] dark:text-stone-100 rounded-full text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
                Previous
              </NuxtLink>
              <NuxtLink 
                :to="`/hadith/${slug[0]}/${slug[1]}/${parseInt(slug[2]) + 1}`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-[#18181B] dark:bg-amber-600 text-white rounded-full text-sm font-medium hover:bg-[#3f3f46] dark:hover:bg-amber-500 transition-colors"
              >
                Next
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </template>
        
        <div v-else class="text-center py-12">
          <p class="text-[#52525B] dark:text-stone-400">Hadith not found.</p>
        </div>
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
const collectionGrade = ref('')
const bookInfo = ref({})
const books = ref([])
const hadiths = ref([])
const hadith = ref(null)
const editions = ref([])
const totalHadiths = ref(0)

const collectionNames = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
  abudawud: 'Sunan Abu Dawud',
  tirmidhi: "Jami' al-Tirmidhi",
  nasai: "Sunan al-Nasai",
  ibnmajah: 'Sunan Ibn Majah'
}

const collectionGrades = {
  bukhari: 'Sahih',
  muslim: 'Sahih',
  abudawud: 'Hasan',
  tirmidhi: 'Sahih',
  nasai: 'Sahih',
  ibnmajah: 'Hasan'
}

const collectionBookCounts = {
  bukhari: 97,
  muslim: 58,
  abudawud: 76,
  tirmidhi: 50,
  nasai: 51,
  ibnmajah: 37
}

const collectionHadithCounts = {
  bukhari: 7563,
  muslim: 7563,
  abudawud: 5274,
  tirmidhi: 3956,
  nasai: 5710,
  ibnmajah: 4341
}

function getBookLabel(bookNumber) {
  const book = books.value.find(b => b.slug === bookNumber || b.chapterNumber === parseInt(bookNumber))
  if (book && book.name && book.name !== `Book ${bookNumber}`) {
    return `Book ${bookNumber}: ${book.name}`
  }
  return `Book ${bookNumber}`
}

function getBookBreadcrumbLabel(bookNumber) {
  const book = books.value.find(b => b.slug === bookNumber || b.chapterNumber === parseInt(bookNumber))
  if (book && book.name) {
    return book.name
  }
  return `Book ${bookNumber}`
}

onMounted(async () => {
  loading.value = true
  
  try {
    if (slug.value.length === 0) {
      const data = await $fetch('/api/hadith/books')
      
      editions.value = Object.keys(collectionNames).map(key => ({
        slug: key,
        name: collectionNames[key],
        grade: collectionGrades[key],
        books: collectionBookCounts[key],
        hadiths: collectionHadithCounts[key]
      }))
    }
    else if (slug.value.length === 1) {
      const collection = slug.value[0]
      collectionName.value = collectionNames[collection] || collection.charAt(0).toUpperCase() + collection.slice(1)
      collectionGrade.value = collectionGrades[collection] || 'Sahih'
      
      const data = await $fetch(`/api/hadith/books?collection=${collection}`)
      books.value = data.books || []
      
      totalHadiths.value = collectionHadithCounts[collection] || 0
    }
    else if (slug.value.length === 2) {
      const collection = slug.value[0]
      const bookNumber = slug.value[1]
      collectionName.value = collectionNames[collection] || collection.charAt(0).toUpperCase() + collection.slice(1)
      collectionGrade.value = collectionGrades[collection] || 'Sahih'
      
      const data = await $fetch(`/api/hadith/list?collection=${collection}&bookNumber=${bookNumber}`)
      hadiths.value = data.hadiths || []
      bookInfo.value = data.bookInfo || {}
    }
    else if (slug.value.length === 3) {
      const collection = slug.value[0]
      const bookNumber = slug.value[1]
      const hadithNumber = slug.value[2]
      collectionName.value = collectionNames[collection] || collection.charAt(0).toUpperCase() + collection.slice(1)
      collectionGrade.value = collectionGrades[collection] || 'Sahih'
      
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