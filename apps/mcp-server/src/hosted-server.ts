#!/usr/bin/env node

// Auto-generated: Hosted MCP server for Docsyte with HTTP transport
// This provides HTTP endpoint wrapper around the stdio-based MCP server

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  JSONRPCRequest,
  JSONRPCResponse
} from '@modelcontextprotocol/sdk/types.js';
import { HTTPServerTransport } from './http-transport.js';
import { createRAGFlowProvider } from './providers/ragflow.js';

// Environment configuration
const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';
const RAGFLOW_URL = process.env.RAGFLOW_URL || 'http://localhost:80';
const RAGFLOW_API_KEY = process.env.RAGFLOW_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express app
const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS configuration for browser clients
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://claude.ai', 'https://cursor.sh', 'https://codeium.com', 'https://windsurf.greptile.com']
    : '*',
  exposedHeaders: ['Content-Type'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'docsyte-mcp-server',
    version: '0.1.0-alpha'
  });
});

// Initialize RAGFlow provider
console.log(`🔗 Initializing RAGFlow provider with URL: ${RAGFLOW_URL}`);
const provider = createRAGFlowProvider({
  url: RAGFLOW_URL,
  apiKey: RAGFLOW_API_KEY,
  timeout: 30000
});

// Create MCP server instance with the same logic as the stdio version
const server = new Server({
  name: 'docsyte-hosted',
  version: '0.1.0-alpha',
});

// List available tools (same as stdio version)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_docs',
        description: 'Search through comprehensive documentation database with semantic search and return relevant chunks with citations',
        inputSchema: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search query for documentation - be specific about what you\'re looking for' 
            },
            library: { 
              type: 'string', 
              description: 'Filter by specific library/framework name (e.g. "react", "typescript", "express")' 
            },
            version: { 
              type: 'string', 
              description: 'Filter by specific version (e.g. "18.0.0", "latest")' 
            },
            k: { 
              type: 'number', 
              description: 'Number of results to return (1-20)', 
              minimum: 1, 
              maximum: 20, 
              default: 8 
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_chunk',
        description: 'Retrieve a specific documentation chunk by its unique ID for detailed content',
        inputSchema: {
          type: 'object',
          properties: {
            chunkId: { 
              type: 'string', 
              description: 'Unique ID of the documentation chunk to retrieve' 
            }
          },
          required: ['chunkId']
        }
      },
      {
        name: 'answer_with_docs',
        description: 'Get comprehensive answers to programming questions using the documentation database with source citations',
        inputSchema: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Your programming question or topic you need help with' 
            },
            library: { 
              type: 'string', 
              description: 'Focus on specific library/framework (e.g. "react", "node", "python")' 
            },
            version: { 
              type: 'string', 
              description: 'Target specific version if important' 
            },
            k: { 
              type: 'number', 
              description: 'Number of documentation sources to use (1-15)', 
              minimum: 1, 
              maximum: 15, 
              default: 8 
            }
          },
          required: ['query']
        }
      }
    ]
  };
});

// Handle tool calls (same logic as stdio version)
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
        
        if (results.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No documentation found for query: "${params.query}"${params.library ? ` in ${params.library}` : ''}${params.version ? ` version ${params.version}` : ''}`
            }]
          };
        }

        const formattedResults = results.map((result, index) => ({
          rank: index + 1,
          content: result.content,
          library: result.metadata?.library || 'unknown',
          source: result.metadata?.source || 'unknown',
          similarity: result.score || 0,
          document_id: result.metadata?.document_id,
          chunk_id: result.id
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(formattedResults, null, 2)
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
        
        if (result.sources.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `**Answer:** I couldn't find specific documentation to answer your question about: "${params.query}"${params.library ? ` in ${params.library}` : ''}\n\n**Suggestion:** Try rephrasing your question or check if the library name is correct.`
            }]
          };
        }

        const sourcesText = result.sources.map((source, index) => {
          const library = source.metadata?.library || 'unknown';
          const sourceFile = source.metadata?.source || 'documentation';
          const preview = source.content.slice(0, 150);
          
          return `**[${index + 1}]** ${library} - ${sourceFile}\n${preview}${source.content.length > 150 ? '...' : ''}`;
        }).join('\n\n');

        return {
          content: [{
            type: 'text',
            text: `**Answer:**\n${result.answer}\n\n**📚 Sources:**\n${sourcesText}\n\n---\n*Powered by Docsyte - Comprehensive documentation search with ${result.sources.length} sources*`
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

// Connect server to HTTP transport
const transport = new HTTPServerTransport();
await server.connect(transport);

// Main MCP endpoint - handles JSON-RPC over HTTP
app.post('/mcp', async (req, res) => {
  try {
    const jsonrpcRequest = req.body as JSONRPCRequest;
    
    // Validate JSON-RPC format
    if (!jsonrpcRequest.jsonrpc || jsonrpcRequest.jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request: JSON-RPC version must be 2.0'
        },
        id: jsonrpcRequest.id || null
      });
    }

    // Handle initialization request
    if (jsonrpcRequest.method === 'initialize') {
      const initResponse: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: jsonrpcRequest.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          serverInfo: {
            name: 'docsyte-hosted',
            version: '0.1.0-alpha'
          }
        }
      };
      return res.json(initResponse);
    }

    // Handle the request through our HTTP transport
    const response = await transport.handleHTTPRequest(jsonrpcRequest);
    res.json(response);
  } catch (error) {
    console.error('❌ Error handling MCP request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: NODE_ENV === 'development' ? errorMessage : undefined
      },
      id: req.body?.id || null
    });
  }
});

// Server statistics endpoint
app.get('/stats', (_req, res) => {
  res.json({
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    ragflow_url: RAGFLOW_URL,
    environment: NODE_ENV,
    tools_available: 3
  });
});

// Test endpoint for MCP tools
app.get('/test', (_req, res) => {
  res.json({
    message: 'Docsyte MCP Server is running',
    endpoints: {
      health: '/health',
      stats: '/stats',
      mcp: '/mcp (POST)',
      test: '/test'
    },
    usage: {
      mcp_endpoint: 'POST /mcp with JSON-RPC 2.0 format',
      example_requests: [
        {
          description: 'Initialize connection',
          request: {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'test-client', version: '1.0.0' }
            }
          }
        },
        {
          description: 'List available tools',
          request: {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list'
          }
        },
        {
          description: 'Search documentation',
          request: {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'search_docs',
              arguments: {
                query: 'how to use React hooks',
                k: 5
              }
            }
          }
        }
      ]
    }
  });
});

// Start the server
async function startServer() {
  try {
    await new Promise<void>((resolve, reject) => {
      const httpServer = app.listen(PORT, HOST, () => {
        console.log(`🚀 Docsyte MCP Server running on http://${HOST}:${PORT}`);
        console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
        console.log(`🔌 MCP endpoint: http://${HOST}:${PORT}/mcp`);
        console.log(`📈 Stats endpoint: http://${HOST}:${PORT}/stats`);
        console.log(`🧪 Test endpoint: http://${HOST}:${PORT}/test`);
        console.log(`🌍 Environment: ${NODE_ENV}`);
        resolve();
      });
      
      httpServer.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  server.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    console.error('💥 Unhandled error during startup:', error);
    process.exit(1);
  });
}

export { app, startServer };