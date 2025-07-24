#!/usr/bin/env node

// Auto-generated: MCP server entry point for Docsyte

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { createRAGFlowProvider } from './providers/ragflow.js';

// Create MCP server
const server = new Server({
  name: 'docsyte',
  version: '0.1.0-alpha',
});

// Initialize RAGFlow provider
const ragflowConfig = {
  url: process.env.RAGFLOW_URL || 'http://localhost:9380',
  apiKey: process.env.RAGFLOW_API_KEY,
  timeout: 30000
};

console.error(`Initializing RAGFlow provider with URL: ${ragflowConfig.url}`);

const provider = createRAGFlowProvider(ragflowConfig);


// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_docs',
        description: 'Search through documentation and return relevant chunks with citations',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query for documentation' },
            library: { type: 'string', description: 'Library name to filter by' },
            version: { type: 'string', description: 'Version to filter by' },
            k: { type: 'number', description: 'Number of results to return', minimum: 1, maximum: 50, default: 8 }
          },
          required: ['query']
        }
      },
      {
        name: 'get_chunk',
        description: 'Retrieve a specific documentation chunk by its unique ID',
        inputSchema: {
          type: 'object',
          properties: {
            chunkId: { type: 'string', description: 'ID of the chunk to retrieve' }
          },
          required: ['chunkId']
        }
      },
      {
        name: 'answer_with_docs',
        description: 'Answer a question using relevant documentation as context with source citations',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Question to answer using documentation' },
            library: { type: 'string', description: 'Library name to filter by' },
            version: { type: 'string', description: 'Version to filter by' },
            k: { type: 'number', description: 'Number of sources to use', minimum: 1, maximum: 50, default: 8 }
          },
          required: ['query']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_docs': {
        if (!args) {
          throw new Error('Missing arguments for search_docs');
        }
        const params = {
          query: args.query as string,
          library: args.library as string | undefined,
          version: args.version as string | undefined,
          k: (args.k as number) || 8
        };
        const results = await provider.searchDocs(params);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(results, null, 2)
          }]
        };
      }

      case 'get_chunk': {
        if (!args) {
          throw new Error('Missing arguments for get_chunk');
        }
        const params = {
          chunkId: args.chunkId as string
        };
        const result = await provider.getChunk(params);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      }

      case 'answer_with_docs': {
        if (!args) {
          throw new Error('Missing arguments for answer_with_docs');
        }
        const params = {
          query: args.query as string,
          library: args.library as string | undefined,
          version: args.version as string | undefined,
          k: (args.k as number) || 8
        };
        const result = await provider.answerWithDocs(params);
        const sourcesText = result.sources.map((source, index) => 
          `[${index + 1}] ${source.content.slice(0, 200)}...${source.metadata?.source ? ` (Source: ${source.metadata.source})` : ''}`
        ).join('\n\n');
        
        return {
          content: [{
            type: 'text',
            text: `**Answer:** ${result.answer}\n\n**Sources:**\n${sourcesText}`
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{
        type: 'text',
        text: `Error: ${errorMessage}`
      }],
      isError: true
    };
  }
});


// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Docsyte MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  server.close();
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}