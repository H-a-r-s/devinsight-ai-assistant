export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'code' | 'documentation' | 'comment';
    language?: string;
    startLine?: number;
    endLine?: number;
  };
  embedding?: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  relevance: 'high' | 'medium' | 'low';
}

export interface RAGQuery {
  query: string;
  context?: string;
  filters?: {
    source?: string;
    type?: string;
    language?: string;
  };
  maxResults?: number;
  threshold?: number;
}

export interface RAGResponse {
  results: SearchResult[];
  context: string;
  suggestions: string[];
}