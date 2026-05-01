export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          source: string | null
          speaker: string | null
          note_date: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content?: string
          source?: string | null
          speaker?: string | null
          note_date?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          source?: string | null
          speaker?: string | null
          note_date?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      note_verses: {
        Row: {
          note_id: string
          verse_key: string
        }
        Insert: {
          note_id: string
          verse_key: string
        }
        Update: {
          note_id?: string
          verse_key?: string
        }
      }
      sources: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      speakers: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      chapters: {
        Row: {
          id: number
          name_simple: string
          name_complex: string
          name_arabic: string
          transliteration: string | null
          verse_count: number
          chapter_type: string | null
        }
        Insert: {
          id?: number
          name_simple: string
          name_complex: string
          name_arabic: string
          transliteration?: string | null
          verse_count: number
          chapter_type?: string | null
        }
        Update: {
          id?: number
          name_simple?: string
          name_complex?: string
          name_arabic?: string
          transliteration?: string | null
          verse_count?: number
          chapter_type?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          default_translation_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          default_translation_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          default_translation_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_user_notes: {
        Args: {
          q?: string
          tag_filter?: string
          source_filter?: string
          date_from?: string
          date_to?: string
        }
        Returns: Database['public']['Tables']['notes']['Row'][]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']
export type NoteVerse = Database['public']['Tables']['note_verses']['Row']
export type Source = Database['public']['Tables']['sources']['Row']
export type Speaker = Database['public']['Tables']['speakers']['Row']
export type Chapter = Database['public']['Tables']['chapters']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
