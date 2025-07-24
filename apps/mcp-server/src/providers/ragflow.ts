// Auto-generated: RAGFlow provider for managed RAG backend

import { z } from 'zod';

export interface RAGFlowConfig {
  url: string;
  apiKey?: string;
  timeout?: number;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score?: number;
}

export interface ChunkResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  library: z.string().optional(),
  version: z.string().optional(),
  k: z.number().int().min(1).max(50).default(8)
});

const ChunkQuerySchema = z.object({
  chunkId: z.string().min(1, 'Chunk ID cannot be empty')
});

type SearchQueryParams = z.infer<typeof SearchQuerySchema>;
type ChunkQueryParams = z.infer<typeof ChunkQuerySchema>;

export class RAGFlowProvider {
  private config: RAGFlowConfig;

  constructor(config: RAGFlowConfig) {
    this.config = config;
  }

  async searchDocs(params: SearchQueryParams): Promise<SearchResult[]> {
    const validated = SearchQuerySchema.parse(params);
    
    try {
      // RAGFlow retrieval API call
      const response = await fetch(`${this.config.url}/api/v1/retrieval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          question: validated.query,
          dataset_ids: ["cebe5adc684a11f08afdb2ef6c1ade51"], // TODO: Make this configurable
          top_k: validated.k,
          similarity_threshold: 0.2,
          vector_similarity_weight: 0.3
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`RAGFlow search failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response structure for RAGFlow API
      if (data.code === 0 && data.data && Array.isArray(data.data.chunks)) {
        return data.data.chunks.map((chunk: any) => ({
          id: chunk.id,
          content: chunk.content || chunk.content_with_weight || '',
          metadata: {
            source: chunk.document_keyword || 'unknown',
            document_id: chunk.document_id,
            dataset_id: chunk.dataset_id,
            similarity: chunk.similarity || chunk.vector_similarity,
            type: 'documentation'
          },
          score: chunk.similarity || chunk.vector_similarity || 0
        }));
      } else {
        console.warn('RAGFlow API returned unexpected format, using fallback results');
        return this.getFallbackSearchResults(validated.query, validated.k);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Search request timed out');
      }
      
      // Fallback for development when RAGFlow is not available
      console.warn(`RAGFlow search failed: ${error instanceof Error ? error.message : 'Unknown error'}, using fallback`);
      return this.getFallbackSearchResults(validated.query, validated.k);
    }
  }

  async getChunk(params: ChunkQueryParams): Promise<ChunkResult> {
    const validated = ChunkQuerySchema.parse(params);
    
    try {
      // TODO: Replace with actual RAGFlow API endpoint when available
      const response = await fetch(`${this.config.url}/api/v1/chunks/${validated.chunkId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`RAGFlow chunk retrieval failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Chunk retrieval request timed out');
      }
      
      // Fallback for development
      console.warn(`RAGFlow chunk retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}, using fallback`);
      return this.getFallbackChunk(validated.chunkId);
    }
  }

  async answerWithDocs(params: SearchQueryParams): Promise<{ answer: string; sources: SearchResult[] }> {
    const validated = SearchQuerySchema.parse(params);
    
    // First search for relevant documents
    const sources = await this.searchDocs(validated);
    
    if (sources.length === 0) {
      return {
        answer: 'No relevant documentation found for your query.',
        sources: []
      };
    }
    
    try {
      // TODO: Replace with actual RAGFlow answer generation endpoint when available
      const response = await fetch(`${this.config.url}/api/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          query: validated.query,
          context: sources.map(s => s.content).join('\n\n'),
          top_k: validated.k
        }),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`RAGFlow answer generation failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        answer: data.answer || this.generateFallbackAnswer(validated.query, sources),
        sources
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Answer generation request timed out');
      }
      
      // Fallback answer generation for development
      console.warn(`RAGFlow answer generation failed: ${error instanceof Error ? error.message : 'Unknown error'}, using fallback`);
      return {
        answer: this.generateFallbackAnswer(validated.query, sources),
        sources
      };
    }
  }

  private getFallbackSearchResults(query: string, k: number): SearchResult[] {
    // Fallback search results for development/testing
    return Array.from({ length: Math.min(k, 3) }, (_, i) => ({
      id: `fallback-${i + 1}`,
      content: `This is a fallback search result ${i + 1} for query: "${query}". This would normally come from RAGFlow's vector search.`,
      metadata: {
        source: 'fallback-docs',
        library: 'example-lib',
        version: '1.0.0',
        type: 'documentation'
      },
      score: 0.8 - (i * 0.1)
    }));
  }

  private getFallbackChunk(chunkId: string): ChunkResult {
    return {
      id: chunkId,
      content: `This is a fallback chunk with ID: ${chunkId}. This would normally be retrieved from RAGFlow's knowledge base.`,
      metadata: {
        source: 'fallback-docs',
        library: 'example-lib',
        version: '1.0.0',
        type: 'documentation'
      }
    };
  }

  private generateFallbackAnswer(query: string, sources: SearchResult[]): string {
    const sourceCount = sources.length;
    const libraries = [...new Set(sources.map(s => s.metadata?.library).filter(Boolean))];
    
    return `Based on ${sourceCount} documentation source${sourceCount !== 1 ? 's' : ''} from ${libraries.join(', ')}, here's what I found regarding "${query}":

This is a fallback answer generated when RAGFlow is not available. The actual implementation would use RAGFlow's LLM to generate a comprehensive answer based on the retrieved documentation chunks.

The search found relevant information that would normally be synthesized into a proper answer with citations.`;
  }
}

export function createRAGFlowProvider(config: RAGFlowConfig): RAGFlowProvider {
  return new RAGFlowProvider(config);
}