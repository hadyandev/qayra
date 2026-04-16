import { httpFetch } from '../services/http.js';

export const userTools = [
  {
    name: 'get_user_bookmarks',
    description: 'Get all bookmarks for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
        limit: { type: 'number', description: 'Number of results', default: 50 }
      }
    }
  },
  {
    name: 'add_bookmark',
    description: 'Add a bookmark for a verse',
    inputSchema: {
      type: 'object',
      properties: {
        chapter_id: { type: 'number', description: 'Chapter ID' },
        verse_number: { type: 'number', description: 'Verse number' }
      },
      required: ['chapter_id', 'verse_number']
    }
  },
  {
    name: 'delete_bookmark',
    description: 'Delete a bookmark by ID',
    inputSchema: {
      type: 'object',
      properties: {
        bookmark_id: { type: 'number', description: 'Bookmark ID to delete' }
      },
      required: ['bookmark_id']
    }
  },
  {
    name: 'get_bookmarks_collections',
    description: 'Get bookmark collections for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'create_collection',
    description: 'Create a new bookmark collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
        description: { type: 'string', description: 'Collection description' }
      },
      required: ['name']
    }
  },
  {
    name: 'get_user_notes',
    description: 'Get all notes for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
        limit: { type: 'number', description: 'Number of results', default: 50 }
      }
    }
  },
  {
    name: 'get_notes_by_verse',
    description: 'Get notes attached to a specific verse',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "2:255")' }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'get_notes_by_range',
    description: 'Get notes within a verse range',
    inputSchema: {
      type: 'object',
      properties: {
        chapter_id: { type: 'number', description: 'Chapter ID' },
        from_verse: { type: 'number', description: 'Starting verse' },
        to_verse: { type: 'number', description: 'Ending verse' }
      },
      required: ['chapter_id', 'from_verse', 'to_verse']
    }
  },
  {
    name: 'add_note',
    description: 'Create a new note for a verse',
    inputSchema: {
      type: 'object',
      properties: {
        body: { type: 'string', description: 'Note content (Markdown supported)' },
        verse_key: { type: 'string', description: 'Verse key (e.g., "2:255")' }
      },
      required: ['body', 'verse_key']
    }
  },
  {
    name: 'update_note',
    description: 'Update an existing note',
    inputSchema: {
      type: 'object',
      properties: {
        note_id: { type: 'number', description: 'Note ID' },
        body: { type: 'string', description: 'Updated note content' }
      },
      required: ['note_id', 'body']
    }
  },
  {
    name: 'delete_note',
    description: 'Delete a note by ID',
    inputSchema: {
      type: 'object',
      properties: {
        note_id: { type: 'number', description: 'Note ID to delete' }
      },
      required: ['note_id']
    }
  },
  {
    name: 'get_reading_sessions',
    description: 'Get reading sessions for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
        limit: { type: 'number', description: 'Number of results', default: 50 }
      }
    }
  },
  {
    name: 'log_reading_session',
    description: 'Log a reading session',
    inputSchema: {
      type: 'object',
      properties: {
        start_time: { type: 'string', description: 'Session start time (ISO 8601)' },
        end_time: { type: 'string', description: 'Session end time (ISO 8601)' },
        verses_read: { type: 'number', description: 'Number of verses read' },
        pages_read: { type: 'number', description: 'Number of pages read' }
      },
      required: ['start_time']
    }
  },
  {
    name: 'get_streaks',
    description: 'Get reading streaks for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_activity_days',
    description: 'Get activity days with reading data',
    inputSchema: {
      type: 'object',
      properties: {
        offset: { type: 'number', description: 'Pagination offset', default: 0 },
        limit: { type: 'number', description: 'Number of results', default: 30 }
      }
    }
  },
  {
    name: 'get_goals',
    description: 'Get reading goals for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'create_goal',
    description: 'Create a new reading goal',
    inputSchema: {
      type: 'object',
      properties: {
        target_type: { 
          type: 'string', 
          enum: ['daily', 'weekly', 'monthly'],
          description: 'Goal frequency' 
        },
        target_value: { type: 'number', description: 'Target value (e.g., pages or verses)' },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD, optional)' }
      },
      required: ['target_type', 'target_value', 'start_date']
    }
  },
  {
    name: 'get_todays_plan',
    description: 'Get the reading plan for today',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_posts_feed',
    description: 'Get the Quran Reflect posts feed',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number', default: 1 },
        per_page: { type: 'number', description: 'Results per page', default: 20 }
      }
    }
  },
  {
    name: 'get_posts_by_verse',
    description: 'Get posts attached to a specific verse',
    inputSchema: {
      type: 'object',
      properties: {
        verse_key: { type: 'string', description: 'Verse key (e.g., "2:255")' }
      },
      required: ['verse_key']
    }
  },
  {
    name: 'get_user_profile',
    description: 'Get profile for a user by username or ID',
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'Username' },
        user_id: { type: 'number', description: 'User ID' }
      }
    }
  },
  {
    name: 'search_users',
    description: 'Search for users',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        page: { type: 'number', description: 'Page number', default: 1 }
      },
      required: ['query']
    }
  },
  {
    name: 'toggle_follow',
    description: 'Follow or unfollow a user',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID to follow/unfollow' },
        action: { type: 'string', enum: ['follow', 'unfollow'], description: 'Follow or unfollow' }
      },
      required: ['user_id', 'action']
    }
  },
  {
    name: 'search_rooms',
    description: 'Search for rooms (groups/pages)',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        type: { type: 'string', enum: ['group', 'page'], description: 'Room type filter' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_room',
    description: 'Get room by ID or URL',
    inputSchema: {
      type: 'object',
      properties: {
        room_id: { type: 'number', description: 'Room ID' },
        url: { type: 'string', description: 'Room URL or subdomain' }
      }
    }
  }
];

export async function handleUserTool(tool: string, args: Record<string, unknown>) {
  const { data, error } = await (async () => {
    switch (tool) {
      case 'get_user_bookmarks': {
        const offset = (args.offset as number) || 0;
        const limit = (args.limit as number) || 50;
        return httpFetch<{ bookmarks: unknown[] }>(`/v1/bookmarks`, { offset, limit }, { scope: 'user' });
      }
      case 'add_bookmark': {
        const chapter_id = args.chapter_id as number;
        const verse_number = args.verse_number as number;
        return httpFetch<{ bookmark: unknown }>(`/v1/bookmarks`, { chapter_id, verse_number }, { scope: 'user' });
      }
      case 'delete_bookmark': {
        const bookmark_id = args.bookmark_id as number;
        return httpFetch<{ success: boolean }>(`/v1/bookmarks/${bookmark_id}`, undefined, { scope: 'user' });
      }
      case 'get_bookmarks_collections': {
        return httpFetch<{ collections: unknown[] }>(`/v1/bookmarks/collections`, undefined, { scope: 'user' });
      }
      case 'create_collection': {
        const name = args.name as string;
        const description = args.description as string;
        return httpFetch<{ collection: unknown }>(`/v1/collections`, { name, description }, { scope: 'user' });
      }
      case 'get_user_notes': {
        const offset = (args.offset as number) || 0;
        const limit = (args.limit as number) || 50;
        return httpFetch<{ notes: unknown[] }>(`/v1/notes`, { offset, limit }, { scope: 'user' });
      }
      case 'get_notes_by_verse': {
        const verse_key = args.verse_key as string;
        return httpFetch<{ notes: unknown[] }>(`/v1/notes/by_verse/${verse_key}`, undefined, { scope: 'user' });
      }
      case 'get_notes_by_range': {
        const chapter_id = args.chapter_id as number;
        const from_verse = args.from_verse as number;
        const to_verse = args.to_verse as number;
        return httpFetch<{ notes: unknown[] }>(
          `/v1/notes/by_range`,
          { chapter_id, from_verse, to_verse },
          { scope: 'user' }
        );
      }
      case 'add_note': {
        const body = args.body as string;
        const verse_key = args.verse_key as string;
        return httpFetch<{ note: unknown }>(`/v1/notes`, { body, verse_key }, { scope: 'user' });
      }
      case 'update_note': {
        const note_id = args.note_id as number;
        const body = args.body as string;
        return httpFetch<{ note: unknown }>(`/v1/notes/${note_id}`, { body }, { scope: 'user' });
      }
      case 'delete_note': {
        const note_id = args.note_id as number;
        return httpFetch<{ success: boolean }>(`/v1/notes/${note_id}`, undefined, { scope: 'user' });
      }
      case 'get_reading_sessions': {
        const offset = (args.offset as number) || 0;
        const limit = (args.limit as number) || 50;
        return httpFetch<{ reading_sessions: unknown[] }>(`/v1/reading_sessions`, { offset, limit }, { scope: 'user' });
      }
      case 'log_reading_session': {
        const start_time = args.start_time as string;
        const end_time = args.end_time as string | undefined;
        const verses_read = args.verses_read as number | undefined;
        const pages_read = args.pages_read as number | undefined;
        return httpFetch<{ session: unknown }>(
          `/v1/reading_sessions`,
          { start_time, end_time, verses_read, pages_read },
          { scope: 'user' }
        );
      }
      case 'get_streaks': {
        return httpFetch<{ streaks: unknown }>(`/v1/streaks`, undefined, { scope: 'user' });
      }
      case 'get_activity_days': {
        const offset = (args.offset as number) || 0;
        const limit = (args.limit as number) || 30;
        return httpFetch<{ activity_days: unknown[] }>(`/v1/activity_days`, { offset, limit }, { scope: 'user' });
      }
      case 'get_goals': {
        return httpFetch<{ goals: unknown[] }>(`/v1/goals`, undefined, { scope: 'user' });
      }
      case 'create_goal': {
        const target_type = args.target_type as string;
        const target_value = args.target_value as number;
        const start_date = args.start_date as string;
        const end_date = args.end_date as string | undefined;
        return httpFetch<{ goal: unknown }>(
          `/v1/goals`,
          { target_type, target_value, start_date, end_date },
          { scope: 'user' }
        );
      }
      case 'get_todays_plan': {
        return httpFetch<{ plan: unknown }>(`/v1/goals/todays_plan`, undefined, { scope: 'user' });
      }
      case 'get_posts_feed': {
        const page = (args.page as number) || 1;
        const per_page = (args.per_page as number) || 20;
        return httpFetch<{ posts: unknown[] }>(`/posts/feed`, { page, per_page }, { scope: 'user' });
      }
      case 'get_posts_by_verse': {
        const verse_key = args.verse_key as string;
        return httpFetch<{ posts: unknown[] }>(`/posts/by_verse/${verse_key}`, undefined, { scope: 'user' });
      }
      case 'get_user_profile': {
        const username = args.username as string | undefined;
        const user_id = args.user_id as number | undefined;
        const path = username 
          ? `/users/profile/${username}` 
          : user_id 
            ? `/users/profile/${user_id}` 
            : '/users/profile';
        return httpFetch<{ user: unknown }>(path, undefined, { scope: 'user' });
      }
      case 'search_users': {
        const query = args.query as string;
        const page = (args.page as number) || 1;
        return httpFetch<{ users: unknown[] }>(`/users/search`, { query, page }, { scope: 'user' });
      }
      case 'toggle_follow': {
        const user_id = args.user_id as number;
        const action = args.action as string;
        return httpFetch<{ following: boolean }>(
          `/users/${user_id}/${action}`,
          undefined,
          { scope: 'user' }
        );
      }
      case 'search_rooms': {
        const query = args.query as string;
        const type = args.type as string | undefined;
        return httpFetch<{ rooms: unknown[] }>(
          `/rooms/search`,
          { query, type },
          { scope: 'user' }
        );
      }
      case 'get_room': {
        const room_id = args.room_id as number | undefined;
        const url = args.url as string | undefined;
        const path = room_id 
          ? `/rooms/${room_id}` 
          : url 
            ? `/rooms/profile` 
            : null;
        if (!path) return { data: null, error: 'Either room_id or url is required' };
        return httpFetch<{ room: unknown }>(path, url ? { url } : undefined, { scope: 'user' });
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
