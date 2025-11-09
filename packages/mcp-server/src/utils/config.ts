import { config } from 'dotenv';
import { MCPServerConfig } from '../types/mcp.js';

config();

export const serverConfig: MCPServerConfig = {
  port: parseInt(process.env.MCP_SERVER_PORT || '3001'),
  host: process.env.MCP_SERVER_HOST || 'localhost',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
    ]
  },
  tools: {
    enabled: [
      'analyzeCode',
      'findBug',
      'explainCode',
      'gitHistory',
      'runTests',
      'searchDocs'
    ]
  },
  ai: {
    provider: process.env.AI_PROVIDER as 'openai' | 'anthropic' || 'openai',
    model: process.env.AI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000')
  },
  rag: {
    vectorStore: {
      path: process.env.VECTOR_STORE_PATH || './data/vector-store',
      dimension: 1536 // OpenAI ada-002 dimension
    },
    embeddings: {
      model: process.env.EMBEDDINGS_MODEL || 'text-embedding-ada-002',
      batchSize: parseInt(process.env.EMBEDDINGS_BATCH_SIZE || '100')
    }
  }
};

export const getApiKey = (provider: 'openai' | 'anthropic'): string => {
  const key = provider === 'openai' 
    ? process.env.OPENAI_API_KEY 
    : process.env.ANTHROPIC_API_KEY;
    
  if (!key) {
    throw new Error(`${provider.toUpperCase()} API key not found in environment variables`);
  }
  
  return key;
};