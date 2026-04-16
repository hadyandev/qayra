export type QfScope = 'content' | 'search' | 'user';

export interface Chapter {
  id: number;
  chapter_number: number;
  name_arabic: string;
  name_complex: string;
  name_simple: string;
  transliteration: string;
  translation: string;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  pages: number[];
  verse_count: number;
}

export interface Verse {
  id: number;
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  page_number: number;
  text_uthmani: string;
  text_uthmani_simple: string;
  text_uthmani_tajweed: string;
  text_imlaei: string;
  text_indopak: string;
  text_indopak_nastaleeq: string;
}

export interface Translation {
  id: number;
  resource_id: number;
  resource_name: string;
  text: string;
  language_name: string;
}

export interface Tafsir {
  id: number;
  resource_id: number;
  resource_name: string;
  text: string;
  language_name: string;
}

export interface Recitation {
  id: number;
  reciter_id: number;
  reciter_name: string;
  style: string;
  audio_url: string;
  duration: number;
}

export interface Footnote {
  id: number;
  text: string;
  footnoteable_type: string;
  footnoteable_id: number;
}

export interface SearchResult {
  id: number;
  verse_key: string;
  text: string;
  translations: Translation[];
  score: number;
}

export interface UserBookmark {
  id: number;
  user_id: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  created_at: string;
}

export interface UserNote {
  id: number;
  user_id: number;
  body: string;
  verse_key: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  visibility: string;
  created_at: string;
}

export interface ReadingSession {
  id: number;
  user_id: number;
  start_time: string;
  end_time?: string;
  verses_read: number;
  pages_read: number;
}

export interface Goal {
  id: number;
  user_id: number;
  target_type: 'daily' | 'weekly' | 'monthly';
  target_value: number;
  current_value: number;
  start_date: string;
  end_date?: string;
}

export interface Post {
  id: number;
  user_id: number;
  body: string;
  verse_key?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

export interface Room {
  id: number;
  name: string;
  type: 'group' | 'page';
  description?: string;
  member_count: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  bio?: string;
  image_url?: string;
  followers_count: number;
  following_count: number;
}
