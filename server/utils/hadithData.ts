export const hadithBooks = [
  { slug: 'bukhari', name: 'Sahih al-Bukhari', hadithCount: 7563, chapters: 97, grade: 'Sahih' },
  { slug: 'muslim', name: 'Sahih Muslim', hadithCount: 7563, chapters: 58, grade: 'Sahih' },
  { slug: 'abudawud', name: 'Sunan Abu Dawud', hadithCount: 5274, chapters: 76, grade: 'Hasan' },
  { slug: 'tirmidhi', name: "Jami' al-Tirmidhi", hadithCount: 3956, chapters: 50, grade: 'Sahih' },
  { slug: 'nasai', name: "Sunan al-Nasai", hadithCount: 5710, chapters: 51, grade: 'Sahih' },
  { slug: 'ibnmajah', name: 'Sunan Ibn Majah', hadithCount: 4341, chapters: 37, grade: 'Hasan' }
]

export const hadithBookInfo: Record<string, { name: string; hadithCount: number; chapters: number; grade: string }> = {
  bukhari: { name: 'Sahih al-Bukhari', hadithCount: 7563, chapters: 97, grade: 'Sahih' },
  muslim: { name: 'Sahih Muslim', hadithCount: 7563, chapters: 58, grade: 'Sahih' },
  abudawud: { name: 'Sunan Abu Dawud', hadithCount: 5274, chapters: 76, grade: 'Hasan' },
  tirmidhi: { name: "Jami' al-Tirmidhi", hadithCount: 3956, chapters: 50, grade: 'Sahih' },
  nasai: { name: "Sunan al-Nasai", hadithCount: 5710, chapters: 51, grade: 'Sahih' },
  ibnmajah: { name: 'Sunan Ibn Majah', hadithCount: 4341, chapters: 37, grade: 'Hasan' }
}

export const hadithEditions: Record<string, string> = {
  bukhari: 'eng-bukhari',
  muslim: 'eng-muslim',
  abudawud: 'eng-abudawud',
  tirmidhi: 'eng-tirmidhi',
  nasai: 'eng-nasai',
  ibnmajah: 'eng-ibnmajah'
}

export function getBookInfo(slug: string) {
  return hadithBookInfo[slug] || null
}