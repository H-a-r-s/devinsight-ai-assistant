import { z } from 'zod';

// MCP Tool Definitions
export const AnalyzeCodeSchema = z.object({
  filePath: z.string(),
  includeMetrics: z.boolean().optional().default(true),
  includeSecurityCheck: z.boolean().optional().default(false)
});

export const FindBugSchema = z.object({
  traceback: z.string(),
  contextFiles: z.array(z.string()).optional()
});

export const ExplainCodeSchema = z.object({
  filePath: z.string(),
  startLine: z.number().optional(),
  endLine: z.number().optional()
});

export const GitHistorySchema = z.object({
  query: z.string(),
  maxResults: z.number().optional().default(10),
  includeFiles: z.boolean().optional().default(true)
});

// Response Types
export interface CodeAnalysisResult {
  filePath: string;
  language: string;
  metrics: {
    linesOfCode: number;
    complexity: number;
    maintainabilityIndex: number;
  };
  issues: Array<{
    type: 'warning' | 'error' | 'info';
    line: number;
    column?: number;
    message: string;
    rule?: string;
  }>;
  suggestions: string[];
  securityIssues?: Array<{
    severity: 'high' | 'medium' | 'low';
    line: number;
    message: string;
    recommendation: string;
  }>;
}

export interface BugAnalysisResult {
  errorType: string;
  probableCause: string;
  suggestedFix: string;
  relevantFiles: string[];
  codeSnippets: Array<{
    file: string;
    lines: string;
    explanation: string;
  }>;
}

export interface CodeExplanationResult {
  filePath: string;
  overview: string;
  sections: Array<{
    startLine: number;
    endLine: number;
    explanation: string;
    concepts: string[];
  }>;
  dependencies: string[];
  relatedFiles: string[];
}

export interface GitAnalysisResult {
  commits: Array<{
    hash: string;
    author: string;
    date: string;
    message: string;
    filesChanged: string[];
    summary: string;
  }>;
  patterns: string[];
  recommendations: string[];
}

// MCP Server Configuration
export interface MCPServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string[];
  };
  tools: {
    enabled: string[];
  };
  ai: {
    provider: 'openai' | 'anthropic';
    model: string;
    maxTokens: number;
  };
  rag: {
    vectorStore: {
      path: string;
      dimension: number;
    };
    embeddings: {
      model: string;
      batchSize: number;
    };
  };
}