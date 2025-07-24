// Auto-generated: Unit tests for RAGFlow provider

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RAGFlowProvider, createRAGFlowProvider } from '../../src/providers/ragflow.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('RAGFlowProvider', () => {
  let provider: RAGFlowProvider;
  const mockConfig = {
    url: 'https://test-ragflow.com',
    apiKey: 'test-api-key',
    timeout: 30000
  };

  beforeEach(() => {
    provider = createRAGFlowProvider(mockConfig);
    vi.clearAllMocks();
  });

  describe('searchDocs', () => {
    it('should successfully search documents', async () => {
      const mockResponse = {
        results: [
          {
            id: 'chunk-1',
            content: 'Test content 1',
            metadata: { source: 'doc1.pdf' },
            score: 0.95
          },
          {
            id: 'chunk-2',
            content: 'Test content 2',
            metadata: { source: 'doc2.pdf' },
            score: 0.88
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.searchDocs({
        query: 'test query',
        library: 'test-lib',
        version: '1.0',
        k: 5
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://test-ragflow.com/api/v1/search',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
          }),
          body: JSON.stringify({
            query: 'test query',
            top_k: 5,
            filters: {
              library: 'test-lib',
              version: '1.0'
            }
          })
        })
      );

      expect(result).toEqual(mockResponse.results);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(
        provider.searchDocs({ query: 'test query' })
      ).rejects.toThrow('RAGFlow search failed: Internal Server Error');
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
        id: 'chunk-1',
        content: 'Detailed chunk content',
        metadata: { source: 'doc1.pdf', page: 1 }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChunk)
      });

      const result = await provider.getChunk({ chunkId: 'chunk-1' });

      expect(fetch).toHaveBeenCalledWith(
        'https://test-ragflow.com/api/v1/chunks/chunk-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
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
    it('should generate answer with source documents', async () => {
      const mockSearchResults = [
        { id: 'chunk-1', content: 'Content 1', metadata: {} },
        { id: 'chunk-2', content: 'Content 2', metadata: {} }
      ];

      const mockAnswerResponse = {
        answer: 'Generated answer based on context'
      };

      // Mock search call
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: mockSearchResults })
        })
        // Mock generate call
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnswerResponse)
        });

      const result = await provider.answerWithDocs({
        query: 'What is the main concept?'
      });

      expect(result).toEqual({
        answer: 'Generated answer based on context',
        sources: mockSearchResults
      });

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('createRAGFlowProvider', () => {
    it('should create provider instance', () => {
      const provider = createRAGFlowProvider(mockConfig);
      expect(provider).toBeInstanceOf(RAGFlowProvider);
    });
  });
});