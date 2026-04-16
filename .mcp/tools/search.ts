import { httpFetch } from '../services/http.js';

export const searchTools = [
  {
    name: 'search_quran',
    description: 'Search Quran text with full-text search across translations and tafsirs',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query text' },
        page: { type: 'number', description: 'Page number for pagination', default: 1 },
        per_page: { type: 'number', description: 'Results per page', default: 20 },
        language: { type: 'string', description: 'Filter by language code', default: 'en' }
      },
      required: ['query']
    }
  },
  {
    name: 'search',
    description: 'General search across all Quran Foundation content',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query text' },
        type: { 
          type: 'string', 
          description: 'Content type filter: verse, tafsir, transliteration, chapter',
          default: 'verse'
        },
        page: { type: 'number', description: 'Page number', default: 1 },
        per_page: { type: 'number', description: 'Results per page', default: 20 }
      },
      required: ['query']
    }
  }
];

interface SearchResult {
  id: number;
  verse_key: string;
  text: string;
  translations?: { id: number; text: string }[];
  score?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total_count: number;
  page: number;
  per_page: number;
}

export async function handleSearchTool(tool: string, args: Record<string, unknown>) {
  const { data, error } = await (async () => {
    switch (tool) {
      case 'search_quran': {
        const query = args.query as string;
        const page = (args.page as number) || 1;
        const per_page = (args.per_page as number) || 20;
        const language = (args.language as string) || 'en';
        return httpFetch<SearchResponse>(`/search/v1/quran`, { query, page, per_page, language });
      }
      case 'search': {
        const query = args.query as string;
        const type = (args.type as string) || 'verse';
        const page = (args.page as number) || 1;
        const per_page = (args.per_page as number) || 20;
        return httpFetch<SearchResponse>(`/search/v1/search`, { query, type, page, per_page });
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
