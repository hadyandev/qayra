import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { httpFetch } from '../services/http.js';
import type { Chapter, Verse, Translation, Tafsir, Recitation, Footnote } from './types.js';

interface ContentResponse<T> {
  data: T | null;
  error: string | null;
}

export const contentTools = [
  {
    name: 'list_chapters',
    description: 'Get list of all 114 chapters (surahs) of the Quran with metadata',
    inputSchema: {
      type: 'object',
      properties: {
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
        limit: { type: 'number', description: 'Number of results', default: 114 }
      }
    }
  },
  {
    name: 'get_chapter',
    description: 'Get detailed information about a specific chapter by number',
    inputSchema: {
      type: 'object',
      properties: {
        chapter_number: { type: 'number', description: 'Chapter number (1-114)', minimum: 1, maximum: 114 }
      },
      required: ['chapter_number']
    }
  },
  {
    name: 'get_verse',
    description: 'Get a specific verse by its key (e.g., "2:255" for Ayat al-Kursi)',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key in format "chapter:verse" (e.g., "2:255")' },
        translations: { type: 'string', description: 'Comma-separated translation IDs (default: 85 for Abdel Haleem)', default: '85' },
        fields: { type: 'string', description: 'Fields to include', default: 'text_uthmani,translations' }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'get_verses_by_range',
    description: 'Get a range of verses from a chapter',
    inputSchema: {
      type: 'object',
      properties: {
        chapter_number: { type: 'number', description: 'Chapter number (1-114)', minimum: 1, maximum: 114 },
        from_verse: { type: 'number', description: 'Starting verse number', minimum: 1 },
        to_verse: { type: 'number', description: 'Ending verse number' },
        translations: { type: 'string', description: 'Comma-separated translation IDs', default: '85' },
        fields: { type: 'string', description: 'Fields to include', default: 'text_uthmani,translations' }
      },
      required: ['chapter_number', 'from_verse', 'to_verse']
    }
  },
  {
    name: 'get_random_verse',
    description: 'Get a random verse from the Quran',
    inputSchema: {
      type: 'object',
      properties: {
        translations: { type: 'string', description: 'Comma-separated translation IDs', default: '85' }
      }
    }
  },
  {
    name: 'get_chapter_info',
    description: 'Get contextual information about a chapter (asma, tafseer, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        chapter_number: { type: 'number', description: 'Chapter number (1-114)', minimum: 1, maximum: 114 },
        language: { type: 'string', description: 'Language code', default: 'en' }
      },
      required: ['chapter_number']
    }
  },
  {
    name: 'list_translations',
    description: 'Get list of available translations',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', description: 'Filter by language code', default: 'en' },
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
        limit: { type: 'number', description: 'Number of results', default: 50 }
      }
    }
  },
  {
    name: 'get_translation',
    description: 'Get a specific translation for verses',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "1:1")' },
        translation_id: { type: 'number', description: 'Translation resource ID' }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'list_tafsirs',
    description: 'Get list of available tafsirs',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', description: 'Filter by language code', default: 'en' }
      }
    }
  },
  {
    name: 'get_tafsir',
    description: 'Get tafsir (interpretation) for a specific verse',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "2:255")' },
        tafsir_id: { type: 'number', description: 'Tafsir resource ID', default: 167 }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'list_recitations',
    description: 'Get list of available recitations/reciters',
    inputSchema: {
      type: 'object',
      properties: {
        style: { type: 'string', description: 'Filter by recitation style (e.g., "gapped", "continuous")' }
      }
    }
  },
  {
    name: 'get_audio_recitations',
    description: 'Get audio recitation files for verses',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "1:1")' },
        reciter_id: { type: 'number', description: 'Reciter ID', default: 7 }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'get_chapter_audio',
    description: 'Get audio file for a complete chapter by a reciter',
    inputSchema: {
      type: 'object',
      properties: {
        chapter_number: { type: 'number', description: 'Chapter number (1-114)', minimum: 1, maximum: 114 },
        reciter_id: { type: 'number', description: 'Reciter ID', default: 7 }
      },
      required: ['chapter_number']
    }
  },
  {
    name: 'get_juz',
    description: 'Get information about a specific juz (part of the Quran)',
    inputSchema: {
      type: 'object',
      properties: {
        juz_number: { type: 'number', description: 'Juz number (1-30)', minimum: 1, maximum: 30 }
      },
      required: ['juz_number']
    }
  },
  {
    name: 'get_juz_verses',
    description: 'Get verses from a specific juz',
    inputSchema: {
      type: 'object',
      properties: {
        juz_number: { type: 'number', description: 'Juz number (1-30)', minimum: 1, maximum: 30 },
        translations: { type: 'string', description: 'Comma-separated translation IDs', default: '85' }
      },
      required: ['juz_number']
    }
  },
  {
    name: 'get_hizb',
    description: 'Get information about a specific hizb (eighth of a juz)',
    inputSchema: {
      type: 'object',
      properties: {
        hizb_number: { type: 'number', description: 'Hizb number (1-60)', minimum: 1, maximum: 60 }
      },
      required: ['hizb_number']
    }
  },
  {
    name: 'get_hizb_verses',
    description: 'Get verses from a specific hizb',
    inputSchema: {
      type: 'object',
      properties: {
        hizb_number: { type: 'number', description: 'Hizb number (1-60)', minimum: 1, maximum: 60 },
        translations: { type: 'string', description: 'Comma-separated translation IDs', default: '85' }
      },
      required: ['hizb_number']
    }
  },
  {
    name: 'get_ruku',
    description: 'Get information about a specific ruku',
    inputSchema: {
      type: 'object',
      properties: {
        ruku_number: { type: 'number', description: 'Ruku number' }
      },
      required: ['ruku_number']
    }
  },
  {
    name: 'get_ruku_verses',
    description: 'Get verses from a specific ruku',
    inputSchema: {
      type: 'object',
      properties: {
        ruku_number: { type: 'number', description: 'Ruku number' },
        translations: { type: 'string', description: 'Comma-separated translation IDs', default: '85' }
      },
      required: ['ruku_number']
    }
  },
  {
    name: 'get_page_verses',
    description: 'Get verses from a specific page of the Madani Mushaf',
    inputSchema: {
      type: 'object',
      properties: {
        page_number: { type: 'number', description: 'Page number (1-604)', minimum: 1, maximum: 604 },
        translations: { type: 'string', description: 'Comma-separated translation IDs', default: '85' }
      },
      required: ['page_number']
    }
  },
  {
    name: 'get_manzil',
    description: 'Get information about a specific manzil',
    inputSchema: {
      type: 'object',
      properties: {
        manzil_number: { type: 'number', description: 'Manzil number (1-7)', minimum: 1, maximum: 7 }
      },
      required: ['manzil_number']
    }
  },
  {
    name: 'get_manzil_verses',
    description: 'Get verses from a specific manzil',
    inputSchema: {
      type: 'object',
      properties: {
        manzil_number: { type: 'number', description: 'Manzil number (1-7)', minimum: 1, maximum: 7 },
        translations: { type: 'string', description: 'Comma-separated translation IDs', default: '85' }
      },
      required: ['manzil_number']
    }
  },
  {
    name: 'get_footnote',
    description: 'Get footnote information for a verse',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "1:1")' }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'get_verse_media',
    description: 'Get media (images, videos) associated with a verse',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "1:1")' }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'get_verse_text',
    description: 'Get verse text in a specific script (Uthmani, Imlaei, Indopak, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "1:1")' },
        script: { 
          type: 'string', 
          description: 'Script type: uthmani, uthmani_simple, uthmani_tajweed, imlaei, indopak, indopak_nastaleeq',
          default: 'uthmani'
        }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'get_languages',
    description: 'Get list of languages available in the API',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

export async function handleContentTool(tool: string, args: Record<string, unknown>) {
  const { data, error } = await (async (): Promise<ContentResponse<unknown>> => {
    switch (tool) {
      case 'list_chapters': {
        const offset = (args.offset as number) || 0;
        const limit = (args.limit as number) || 114;
        return httpFetch<{ chapters: Chapter[] }>(`/content/api/v4/chapters`, { offset, limit });
      }
      case 'get_chapter': {
        const chapter_number = args.chapter_number as number;
        return httpFetch<{ chapter: Chapter }>(`/content/api/v4/chapters/${chapter_number}`);
      }
      case 'get_verse': {
        const verse_key = args.verse_key as string;
        const translations = (args.translations as string) || '85';
        const fields = (args.fields as string) || 'text_uthmani,translations';
        return httpFetch<{ verse: Verse & { translations: Translation[] } }>(
          `/content/api/v4/verses/by_key/${verse_key}`,
          { translations, fields }
        );
      }
      case 'get_verses_by_range': {
        const chapter_number = args.chapter_number as number;
        const from_verse = args.from_verse as number;
        const to_verse = args.to_verse as number;
        const translations = (args.translations as string) || '85';
        const fields = (args.fields as string) || 'text_uthmani,translations';
        return httpFetch<{ verses: (Verse & { translations: Translation[] })[] }>(
          `/content/api/v4/verses/by_chapter/${chapter_number}`,
          { from: from_verse, to: to_verse, translations, fields }
        );
      }
      case 'get_random_verse': {
        const translations = (args.translations as string) || '85';
        return httpFetch<{ verse: Verse & { translations: Translation[] } }>(
          `/content/api/v4/verses/random`,
          { translations }
        );
      }
      case 'get_chapter_info': {
        const chapter_number = args.chapter_number as number;
        const language = (args.language as string) || 'en';
        return httpFetch<{ chapter_info: unknown }>(
          `/content/api/v4/chapters/${chapter_number}/info`,
          { language }
        );
      }
      case 'list_translations': {
        const language = (args.language as string) || 'en';
        const offset = (args.offset as number) || 0;
        const limit = (args.limit as number) || 50;
        return httpFetch<{ translations: unknown[] }>(`/content/api/v4/resources/translations`, { language, offset, limit });
      }
      case 'get_translation': {
        const verse_key = args.verse_key as string;
        const translation_id = args.translation_id as number;
        return httpFetch<{ verse: Verse & { translations: Translation[] } }>(
          `/content/api/v4/verses/by_key/${verse_key}/translations/${translation_id}`
        );
      }
      case 'list_tafsirs': {
        const language = (args.language as string) || 'en';
        return httpFetch<{ tafsirs: unknown[] }>(`/content/api/v4/resources/tafsirs`, { language });
      }
      case 'get_tafsir': {
        const verse_key = args.verse_key as string;
        const tafsir_id = (args.tafsir_id as number) || 167;
        return httpFetch<{ verse: Verse & { tafsir: Tafsir } }>(
          `/content/api/v4/verses/by_key/${verse_key}/tafsirs/${tafsir_id}`
        );
      }
      case 'list_recitations': {
        const style = args.style as string | undefined;
        return httpFetch<{ recitations: unknown[] }>(`/content/api/v4/recitations`, style ? { style } : undefined);
      }
      case 'get_audio_recitations': {
        const verse_key = args.verse_key as string;
        const reciter_id = (args.reciter_id as number) || 7;
        return httpFetch<{ audio_files: Recitation[] }>(
          `/content/api/v4/verses/by_key/${verse_key}/recitations`,
          { reciter_id }
        );
      }
      case 'get_chapter_audio': {
        const chapter_number = args.chapter_number as number;
        const reciter_id = (args.reciter_id as number) || 7;
        return httpFetch<{ audio_files: Recitation[] }>(
          `/content/api/v4/chapters/${chapter_number}/recitation_audio_files`,
          { reciter_id }
        );
      }
      case 'get_juz': {
        const juz_number = args.juz_number as number;
        return httpFetch<{ juz: unknown }>(`/content/api/v4/juzs/${juz_number}`);
      }
      case 'get_juz_verses': {
        const juz_number = args.juz_number as number;
        const translations = (args.translations as string) || '85';
        return httpFetch<{ verses: unknown[] }>(
          `/content/api/v4/juzs/${juz_number}/verses`,
          { translations }
        );
      }
      case 'get_hizb': {
        const hizb_number = args.hizb_number as number;
        return httpFetch<{ hizb: unknown }>(`/content/api/v4/hizbs/${hizb_number}`);
      }
      case 'get_hizb_verses': {
        const hizb_number = args.hizb_number as number;
        const translations = (args.translations as string) || '85';
        return httpFetch<{ verses: unknown[] }>(
          `/content/api/v4/hizbs/${hizb_number}/verses`,
          { translations }
        );
      }
      case 'get_ruku': {
        const ruku_number = args.ruku_number as number;
        return httpFetch<{ ruku: unknown }>(`/content/api/v4/rukus/${ruku_number}`);
      }
      case 'get_ruku_verses': {
        const ruku_number = args.ruku_number as number;
        const translations = (args.translations as string) || '85';
        return httpFetch<{ verses: unknown[] }>(
          `/content/api/v4/rukus/${ruku_number}/verses`,
          { translations }
        );
      }
      case 'get_page_verses': {
        const page_number = args.page_number as number;
        const translations = (args.translations as string) || '85';
        return httpFetch<{ verses: unknown[] }>(
          `/content/api/v4/verses/by_page/${page_number}`,
          { translations }
        );
      }
      case 'get_manzil': {
        const manzil_number = args.manzil_number as number;
        return httpFetch<{ manzil: unknown }>(`/content/api/v4/manzils/${manzil_number}`);
      }
      case 'get_manzil_verses': {
        const manzil_number = args.manzil_number as number;
        const translations = (args.translations as string) || '85';
        return httpFetch<{ verses: unknown[] }>(
          `/content/api/v4/manzils/${manzil_number}/verses`,
          { translations }
        );
      }
      case 'get_footnote': {
        const verse_key = args.verse_key as string;
        return httpFetch<{ footnotes: Footnote[] }>(
          `/content/api/v4/verses/by_key/${verse_key}/footnotes`
        );
      }
      case 'get_verse_media': {
        const verse_key = args.verse_key as string;
        return httpFetch<{ media: unknown[] }>(
          `/content/api/v4/verses/by_key/${verse_key}/media`
        );
      }
      case 'get_verse_text': {
        const verse_key = args.verse_key as string;
        const script = (args.script as string) || 'uthmani';
        return httpFetch<{ verse: { text: string } }>(
          `/content/api/v4/verses/by_key/${verse_key}`,
          { script }
        );
      }
      case 'get_languages': {
        return httpFetch<{ languages: unknown[] }>(`/content/api/v4/languages`);
      }
      default:
        return { data: null, error: `Unknown tool: ${tool}` };
    }
  })();

  if (error) {
    return { content: [{ type: 'text' as const, text: `Error: ${error}` }], isError: true };
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
