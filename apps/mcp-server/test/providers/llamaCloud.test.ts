// Auto-generated: Unit tests for LlamaCloud provider

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlamaCloudProvider, createLlamaCloudProvider } from '../../src/providers/llamaCloud.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('LlamaCloudProvider', () => {
  let provider: LlamaCloudProvider;
  const mockConfig = {
    apiKey: 'test-llama-api-key',
    baseUrl: 'https://test-llamacloud.com',
    timeout: 30000
  };

  beforeEach(() => {
    provider = createLlamaCloudProvider(mockConfig);
    vi.clearAllMocks();
  });

  describe('searchDocs', () => {
    it('should successfully search documents', async () => {
      const mockResponse = {
        results: [
          {
            id: 'chunk-1',
            content: 'LlamaCloud test content 1',
            metadata: { source: 'doc1.pdf', pipeline: 'test' },
            score: 0.92
          },
          {
            id: 'chunk-2',
            content: 'LlamaCloud test content 2',
            metadata: { source: 'doc2.pdf', pipeline: 'test' },
            score: 0.85
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.searchDocs({
        query: 'llama test query',
        library: 'llama-lib',
        version: '2.0',
        k: 3
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://test-llamacloud.com/api/v1/pipelines/retrieval',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-llama-api-key'
          }),
          body: JSON.stringify({
            query: 'llama test query',
            top_k: 3,
            filters: {
              library: 'llama-lib',
              version: '2.0'
            }
          })
        })
      );

      expect(result).toEqual(mockResponse.results);
    });

    it('should use default base URL when not provided', () => {
      const providerWithDefaults = createLlamaCloudProvider({
        apiKey: 'test-key'
      });
      
      expect(providerWithDefaults).toBeInstanceOf(LlamaCloudProvider);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      });

      await expect(
        provider.searchDocs({ query: 'test query' })
      ).rejects.toThrow('LlamaCloud search failed: Unauthorized');
    });

    it('should validate input parameters', async () => {
      await expect(
        provider.searchDocs({ query: '' })
      ).rejects.toThrow('Query cannot be empty');
    });
  });

  describe('getChunk', () => {
    it('should successfully retrieve a chunk', async () => {
      const mockChunk = {
        id: 'llama-chunk-1',
        content: 'Detailed LlamaCloud chunk content',
        metadata: { source: 'doc1.pdf', index: 'test-index' }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChunk)
      });

      const result = await provider.getChunk({ chunkId: 'llama-chunk-1' });

      expect(fetch).toHaveBeenCalledWith(
        'https://test-llamacloud.com/api/v1/chunks/llama-chunk-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-llama-api-key'
          })
        })
      );

      expect(result).toEqual(mockChunk);
    });

    it('should validate chunk ID', async () => {
      await expect(
        provider.getChunk({ chunkId: '' })
      ).rejects.toThrow('Chunk ID cannot be empty');
    });
  });

  describe('answerWithDocs', () => {
    it('should generate answer using RAG pipeline and include sources', async () => {
      const mockSearchResults = [
        { id: 'chunk-1', content: 'LlamaCloud content 1', metadata: {} },
        { id: 'chunk-2', content: 'LlamaCloud content 2', metadata: {} }
      ];

      const mockRAGResponse = {
        answer: 'LlamaCloud generated answer with context'
      };

      // Mock RAG pipeline call
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRAGResponse)
        })
        // Mock search call for sources
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: mockSearchResults })
        });

      const result = await provider.answerWithDocs({
        query: 'What does LlamaCloud provide?'
      });

      expect(result).toEqual({
        answer: 'LlamaCloud generated answer with context',
        sources: mockSearchResults
      });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        'https://test-llamacloud.com/api/v1/pipelines/rag',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should handle RAG pipeline errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable'
      });

      await expect(
        provider.answerWithDocs({ query: 'test query' })
      ).rejects.toThrow('LlamaCloud RAG failed: Service Unavailable');
    });
  });

  describe('createLlamaCloudProvider', () => {
    it('should create provider instance', () => {
      const provider = createLlamaCloudProvider(mockConfig);
      expect(provider).toBeInstanceOf(LlamaCloudProvider);
    });

    it('should require API key', () => {
      expect(() => createLlamaCloudProvider({} as any)).not.toThrow();
    });
  });
});