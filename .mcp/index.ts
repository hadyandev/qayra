#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolRequest
} from '@modelcontextprotocol/sdk/types.js';
import { contentTools, handleContentTool } from './tools/content.js';
import { searchTools, handleSearchTool } from './tools/search.js';
import { userTools, handleUserTool } from './tools/user.js';

const allTools = [...contentTools, ...searchTools, ...userTools];

const server = new Server(
  {
    name: 'quran-foundation-api',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: allTools };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    if (contentTools.some(t => t.name === name)) {
      return await handleContentTool(name, args || {});
    }
    if (searchTools.some(t => t.name === name)) {
      return await handleSearchTool(name, args || {});
    }
    if (userTools.some(t => t.name === name)) {
      return await handleUserTool(name, args || {});
    }

    return {
      content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
      isError: true
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Quran Foundation MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
