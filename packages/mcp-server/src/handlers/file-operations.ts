import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';

export class FileOperationsHandler {
  constructor() {
    logger.info('FileOperationsHandler initialized');
  }

  async readFile(filePath: string): Promise<string> {
    logger.info(`Reading file: ${filePath}`);
    
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      return readFileSync(filePath, 'utf-8');
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  async findFiles(pattern: string, baseDir: string = process.cwd()): Promise<string[]> {
    logger.info(`Finding files with pattern: ${pattern} in ${baseDir}`);

    try {
      const files = await glob(pattern, { 
        cwd: baseDir,
        ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
      });
      
      logger.info(`Found ${files.length} files matching pattern: ${pattern}`);
      return files;
    } catch (error) {
      logger.error(`Failed to find files with pattern: ${pattern}`, error);
      throw error;
    }
  }

  async getProjectStructure(rootDir: string = process.cwd()): Promise<any> {
    logger.info(`Getting project structure for: ${rootDir}`);

    try {
      const structure = this.buildDirectoryTree(rootDir);
      return structure;
    } catch (error) {
      logger.error(`Failed to get project structure: ${rootDir}`, error);
      throw error;
    }
  }

  private buildDirectoryTree(dirPath: string, maxDepth: number = 3, currentDepth: number = 0): any {
    if (currentDepth >= maxDepth) return null;

    const items = readdirSync(dirPath, { withFileTypes: true });
    const tree: any = {
      name: dirname(dirPath),
      type: 'directory',
      children: []
    };

    for (const item of items) {
      // Skip hidden files and common build directories
      if (item.name.startsWith('.') || 
          ['node_modules', 'dist', 'build', '__pycache__'].includes(item.name)) {
        continue;
      }

      const itemPath = join(dirPath, item.name);

      if (item.isDirectory()) {
        const subtree = this.buildDirectoryTree(itemPath, maxDepth, currentDepth + 1);
        if (subtree) {
          tree.children.push({
            name: item.name,
            type: 'directory',
            children: subtree.children
          });
        }
      } else {
        const stats = statSync(itemPath);
        tree.children.push({
          name: item.name,
          type: 'file',
          size: stats.size,
          extension: extname(item.name),
          lastModified: stats.mtime
        });
      }
    }

    return tree;
  }
}