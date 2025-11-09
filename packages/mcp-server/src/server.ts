import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { serverConfig, getApiKey } from './utils/config.js';
import { logger } from './utils/logger.js';
import { CodeAnalysisHandler } from './handlers/code-analysis.js';
import { GitIntegrationHandler } from './handlers/git-integration.js';
import { FileOperationsHandler } from './handlers/file-operations.js';

class DevInsightMCPServer {
  private server: Server;
  private fastify: ReturnType<typeof Fastify>;
  private handlers: Map<string, any> = new Map();

  constructor() {
    this.server = new Server({
      name: 'devinsight-mcp-server',
      version: '1.0.0',
      capabilities: {
        tools: {},
      },
    });

    this.fastify = Fastify({
      logger: {
        level: 'info',
        transport: {
          target: 'pino-pretty'
        }
      }
    });

    this.setupHandlers();
    this.setupMCPHandlers();
    this.setupWebSocketServer();
  }

  private setupHandlers() {
    this.handlers.set('code-analysis', new CodeAnalysisHandler());
    this.handlers.set('git-integration', new GitIntegrationHandler());
    this.handlers.set('file-operations', new FileOperationsHandler());
    logger.info('MCP handlers initialized');
  }

  private setupMCPHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [
        {
          name: 'analyzeCode',
          description: 'Analyze code quality, complexity, and potential issues in a file',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string', description: 'Path to the file to analyze' },
              includeMetrics: { type: 'boolean', description: 'Include code metrics' },
              includeSecurityCheck: { type: 'boolean', description: 'Include security analysis' }
            },
            required: ['filePath']
          }
        },
        {
          name: 'findBug',
          description: 'Analyze error traceback and suggest fixes',
          inputSchema: {
            type: 'object',
            properties: {
              traceback: { type: 'string', description: 'Error traceback or error message' },
              contextFiles: { type: 'array', items: { type: 'string' }, description: 'Related files for context' }
            },
            required: ['traceback']
          }
        },
        {
          name: 'explainCode',
          description: 'Provide detailed explanation of code functionality',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string', description: 'Path to the file to explain' },
              startLine: { type: 'number', description: 'Start line (optional)' },
              endLine: { type: 'number', description: 'End line (optional)' }
            },
            required: ['filePath']
          }
        },
        {
          name: 'gitHistory',
          description: 'Analyze git history and provide insights',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query for git history' },
              maxResults: { type: 'number', description: 'Maximum number of results' },
              includeFiles: { type: 'boolean', description: 'Include changed files' }
            },
            required: ['query']
          }
        }
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info(`Executing tool: ${name}`, { args });

      try {
        switch (name) {
          case 'analyzeCode': {
            const handler = this.handlers.get('code-analysis');
            const result = await handler.analyzeCode(args);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }
          case 'findBug': {
            const handler = this.handlers.get('code-analysis');
            const result = await handler.findBug(args);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }
          case 'explainCode': {
            const handler = this.handlers.get('code-analysis');
            const result = await handler.explainCode(args);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }
          case 'gitHistory': {
            const handler = this.handlers.get('git-integration');
            const result = await handler.analyzeHistory(args);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, error);
        throw error;
      }
    });
  }

  private async setupWebSocketServer() {
    await this.fastify.register(cors, serverConfig.cors);
    await this.fastify.register(websocket);

    this.fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    this.fastify.get('/', async () => {
      return { message: 'DevInsight MCP Server is running.' };
    });

    // Use arrow function to preserve 'this'
    const self = this;
    await this.fastify.register(async function (fastify: any) {
      fastify.get('/ws', { websocket: true }, (connection: any, req: any) => {
        connection.socket.on('message', async (message: any) => {
          try {
            const data = JSON.parse(message.toString());
            logger.info('Received WebSocket message', { type: data.type });

            switch (data.type) {
              case 'ping':
                connection.socket.send(JSON.stringify({ type: 'pong' }));
                break;
              case 'tool-call':
                const result = await self.handleToolCall(data.payload);
                connection.socket.send(JSON.stringify({
                  type: 'tool-result',
                  id: data.id,
                  result
                }));
                break;
              default:
                logger.warn('Unknown message type', { type: data.type });
            }
          } catch (error) {
            logger.error('WebSocket message handling error', error);
            connection.socket.send(JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : 'Unknown error'
            }));
          }
        });

        connection.socket.on('close', () => {
          logger.info('WebSocket connection closed');
        });
      });
    });
  }

  private async handleToolCall(payload: any) {
    const { name, arguments: args } = payload;
    switch (name) {
      case 'analyzeCode': {
        const handler = this.handlers.get('code-analysis');
        return await handler.analyzeCode(args);
      }
      case 'findBug': {
        const handler = this.handlers.get('code-analysis');
        return await handler.findBug(args);
      }
      case 'explainCode': {
        const handler = this.handlers.get('code-analysis');
        return await handler.explainCode(args);
      }
      case 'gitHistory': {
        const handler = this.handlers.get('git-integration');
        return await handler.analyzeHistory(args);
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async start() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      logger.info('MCP Server connected via stdio');

      await this.fastify.listen({
        port: serverConfig.port,
        host: serverConfig.host
      });

      logger.info(`DevInsight MCP Server running on http://${serverConfig.host}:${serverConfig.port}`);
      logger.info(`WebSocket available at ws://${serverConfig.host}:${serverConfig.port}/ws`);

    } catch (error) {
      logger.error('Server startup failed', error);
      process.exit(1);
    }
  }
}

const server = new DevInsightMCPServer();
server.start();