export const hadithBooks = [
  {
    slug: 'bukhari',
    name: 'Sahih al-Bukhari',
    nameArabic: 'صحيح البخاري',
    author: 'Imam Muhammad al-Bukhari',
    description: 'The most authentic collection of hadith, containing over 7,500 ahadith',
    hadithCount: 7563,
    chapters: 97,
    grade: 'Sahih'
  },
  {
    slug: 'muslim',
    name: 'Sahih Muslim',
    nameArabic: 'صحيح مسلم',
    author: 'Imam Muslim ibn al-Hajjaj',
    description: 'Second most authentic collection, compiled with rigorous criteria',
    hadithCount: 7563,
    chapters: 58,
    grade: 'Sahih'
  },
  {
    slug: 'abudawud',
    name: 'Sunan Abu Dawud',
    nameArabic: 'سنن أبي داود',
    author: 'Imam Abu Dawud',
    description: 'Collection of hadith focusing on jurisprudence',
    hadithCount: 5274,
    chapters: 76,
    grade: 'Hasan'
  },
  {
    slug: 'tirmidhi',
    name: "Jami' al-Tirmidhi",
    nameArabic: 'جامع الترمذي',
    author: 'Imam al-Tirmidhi',
    description: 'Comprehensive collection with grading of hadith',
    hadithCount: 3956,
    chapters: 50,
    grade: 'Sahih'
  },
  {
    slug: 'nasai',
    name: "Sunan al-Nasai",
    nameArabic: 'سنن النسائي',
    author: 'Imam al-Nasai',
    description: 'Important collection for jurisprudence',
    hadithCount: 5710,
    chapters: 51,
    grade: 'Sahih'
  },
  {
    slug: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    nameArabic: 'سنن ابن ماجه',
    author: 'Imam Ibn Majah',
    description: 'Last of the six major collections',
    hadithCount: 4341,
    chapters: 37,
    grade: 'Hasan'
  }
]

export const hadithEditions: Record<string, string> = {
  bukhari: 'eng-bukhari',
  muslim: 'eng-muslim',
  abudawud: 'eng-abudawud',
  tirmidhi: 'eng-tirmidhi',
  nasai: 'eng-nasai',
  ibnmajah: 'eng-ibnmajah'
}