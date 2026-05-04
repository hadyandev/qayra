import { getQuery } from 'h3'
import { qfFetchJson } from '../../utils/qfHttp'
import { serverSupabaseClient } from '#supabase/server'

const fallbackVerses: Record<string, { text: string; translation: string }> = {
  '1:1': { text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', translation: 'In the name of God, the Most Gracious, the Most Merciful.' },
  '1:2': { text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'All praise is due to God, the Lord of the worlds.' },
  '1:3': { text: 'الرَّحْمَنِ الرَّحِيمِ', translation: 'The Most Gracious, the Most Merciful.' },
  '1:4': { text: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Master of the Day of Judgment.' },
  '1:5': { text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'You alone we worship and from You alone we seek help.' },
  '1:6': { text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path.' },
  '1:7': { text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلاَ الضَّآلِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have earned wrath, nor of the astray.' },
  '2:1': { text: 'الِمّ', translation: 'Alif-Lam-Mim.' },
  '2:2': { text: 'ذٰلِكَ الْكِتَابُ لاَ رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ', translation: 'This is the Book; in it is guidance for the righteous.' },
  '2:3': { text: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ', translation: 'Who believe in the unseen and establish prayer, and from what We have provided them, they spend.' },
}

async function getChapterInfo(event: any, chapterId: number) {
  try {
    const client = await serverSupabaseClient(event)
    const { data } = await client
      .from('chapters')
      .select('name_simple,name_complex,name_arabic,verse_count,chapter_type')
      .eq('id', chapterId)
      .single()
    if (data) {
      return {
        name_simple: data.name_simple,
        name_complex: data.name_complex,
        name_arabic: data.name_arabic,
        verses_count: data.verse_count,
        revelation_place: data.chapter_type
      }
    }
  } catch (e) {
    console.warn('[verse.get] Failed to fetch chapter from Supabase:', e)
  }
  return null
}

function getFallbackVerse(key: string) {
  const normalized = key.toLowerCase().replace(/[-_]/g, ':')
  return fallbackVerses[normalized] || null
}

export default defineEventHandler(async (event) => {
  const key = getQuery(event).key as string
  const config = useRuntimeConfig()

  if (!key) {
    return { error: 'Verse key is required', verse: null }
  }

  const keyParts = key.split(':')
  const chapterNum = parseInt(keyParts[0], 10) || 1
  const verseNum = keyParts[1] ? parseInt(keyParts[1], 10) : 1

  try {
    const translationIds = (config.qfTranslationIds as string) || '85'
    const path = `/content/api/v4/verses/by_key/${encodeURIComponent(key)}`
    const data = await qfFetchJson<{
      verse?: Record<string, unknown>
    }>(
      path,
      {
        translations: translationIds,
        fields: 'verse_key,text_uthmani,text_imlaei_simple,chapter,verse_number',
        tafsirs: '168,169',
        reciter: '1'
      },
      'content'
    )

    const verse = data.verse
    if (!verse) {
      return { error: 'Verse not found', verse: null }
    }

    // Get chapter info from Supabase
    const surah = await getChapterInfo(event, chapterNum)
    const chapterNameSimple = surah?.name_simple || 'Chapter ' + chapterNum
    const chapterNameComplex = surah?.name_complex || chapterNameSimple
    const chapterNameArabic = surah?.name_arabic || ''
    const chapterVersesCount = surah?.verses_count || (chapterNum === 1 ? 7 : chapterNum === 2 ? 286 : 0)
    const revelationPlace = surah?.revelation_place || ''

    // Verse data from API
    const verseNumber = verse.verse_number ? Number(verse.verse_number) : verseNum

    // Translations
    const translationsRaw = (verse.translations as Record<string, unknown>[]) || []
    const translations = translationsRaw.map((t) => ({
      text: String(t.text ?? ''),
      resource_name: String(t.resource_name ?? t.resourceName ?? '')
    }))

    // Tafsir - collect all available
    const tafsirsRaw = (verse.tafsirs as Record<string, unknown>[]) || []
    const tafsirs = tafsirsRaw
      .filter(t => t.text)
      .map(t => ({
        text: String(t.text),
        resourceName: String(t.resource_name ?? t.resourceName ?? 'Tafsir')
      }))

    // Audio
    const audioRaw = verse.audio as Record<string, unknown> | undefined
    let audioUrl: string | null = null
    let reciterName: string | null = null
    if (audioRaw?.url) {
      audioUrl = String(audioRaw.url)
      reciterName = String(audioRaw.reciter_name ?? audioRaw.reciterName ?? '')
    }

    // Use fallback if API returns empty text
    const fallback = getFallbackVerse(key)
    const apiText = String(verse.text_uthmani ?? verse.text ?? '')
    const finalText = (apiText && apiText.length > 5) ? apiText : (fallback?.text || '')
    const finalTranslation = (translations.length > 0 && translations[0].text.length > 5) 
      ? translations[0].text 
      : (fallback?.translation || '')

    return {
      verse: {
        id: verse.id,
        verse_key: String(verse.verse_key ?? key),
        text: finalText,
        text_uthmani: finalText,
        text_imlaei_simple: String(verse.text_imlaei_simple ?? ''),
        translations: finalTranslation ? [{ text: finalTranslation, resource_name: 'Sahih International' }] : translations,
        tafsirs,
        tafsir: tafsirs.length > 0 ? tafsirs[0] : null,
        audio: audioUrl ? { url: audioUrl, reciter: reciterName } : null,
        chapter_id: chapterNum,
        chapter_name: chapterNameSimple,
        chapter_name_arabic: chapterNameArabic,
        verse_number: verseNumber,
        total_verses: chapterVersesCount,
        revelation_place: revelationPlace,
        surah: surah ? {
          id: chapterNum,
          name_complex: surah.name_complex,
          name_simple: surah.name_simple,
          name_arabic: surah.name_arabic
        } : null
      },
      error: null
    }
  } catch (error: any) {
    console.error('Verse API Error:', error?.message || error)
    return {
      error: error?.message || 'Failed to fetch verse',
      verse: null
    }
  }
})