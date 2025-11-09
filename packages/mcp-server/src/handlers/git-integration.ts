import { simpleGit, SimpleGit } from 'simple-git';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import { GitAnalysisResult } from '../types/mcp.js';

export class GitIntegrationHandler {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
    logger.info('GitIntegrationHandler initialized');
  }

  async analyzeHistory(args: any): Promise<GitAnalysisResult> {
    const { query, maxResults = 10, includeFiles = true } = args;
    
    logger.info(`Analyzing git history: ${query}`);

    try {
      // Check if we're in a git repository
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('Not in a git repository');
      }

      const log = await this.git.log({
        maxCount: maxResults,
        grep: query
      });

      const commits = await Promise.all(
        log.all.map(async (commit) => {
          const files = includeFiles ? await this.getCommitFiles(commit.hash) : [];
          return {
            hash: commit.hash,
            author: commit.author_name,
            date: commit.date,
            message: commit.message,
            filesChanged: files,
            summary: this.generateCommitSummary(commit.message, files)
          };
        })
      );

      const patterns = this.analyzePatterns(commits);
      const recommendations = this.generateRecommendations(commits, patterns);

      const result: GitAnalysisResult = {
        commits,
        patterns,
        recommendations
      };

      logger.info(`Git history analysis completed for query: ${query}`);
      return result;

    } catch (error) {
      logger.error(`Git history analysis failed for query: ${query}`, error);
      throw error;
    }
  }

  private async getCommitFiles(hash: string): Promise<string[]> {
    try {
      const diff = await this.git.show([hash, '--name-only', '--pretty=format:']);
      return diff.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
      logger.warn(`Could not get files for commit ${hash}`, error);
      return [];
    }
  }

  private generateCommitSummary(message: string, files: string[]): string {
    const fileTypes = this.categorizeFiles(files);
    let summary = message.split('\n')[0]; // First line of commit message

    if (fileTypes.length > 0) {
      summary += ` (Modified: ${fileTypes.join(', ')})`;
    }

    return summary;
  }

  private categorizeFiles(files: string[]): string[] {
    const categories = new Set<string>();

    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
        categories.add('JavaScript/TypeScript');
      } else if (file.endsWith('.py')) {
        categories.add('Python');
      } else if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.sass')) {
        categories.add('Styles');
      } else if (file.endsWith('.html')) {
        categories.add('HTML');
      } else if (file.endsWith('.md') || file.endsWith('.txt')) {
        categories.add('Documentation');
      } else if (file.includes('package.json') || file.includes('yarn.lock') || file.includes('requirements.txt')) {
        categories.add('Dependencies');
      } else if (file.includes('test') || file.includes('spec')) {
        categories.add('Tests');
      } else {
        categories.add('Config/Other');
      }
    });

    return Array.from(categories);
  }

  private analyzePatterns(commits: any[]): string[] {
    const patterns: string[] = [];

    // Analyze commit frequency
    if (commits.length > 5) {
      patterns.push('High commit frequency - active development');
    }

    // Analyze commit messages
    const hasConventionalCommits = commits.some(commit => 
      /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/.test(commit.message)
    );
    if (hasConventionalCommits) {
      patterns.push('Uses conventional commit messages');
    }

    // Analyze file change patterns
    const allFiles = commits.flatMap(commit => commit.filesChanged);
    const fileFreq = allFiles.reduce((acc, file) => {
      acc[file] = (acc[file] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequentFiles = Object.entries(fileFreq)
      .filter(([_, count]) => (count as number) > 2)
      .map(([file, _]) => file);

    if (frequentFiles.length > 0) {
      patterns.push(`Frequently modified files: ${frequentFiles.slice(0, 3).join(', ')}`);
    }

    return patterns;
  }

  private generateRecommendations(commits: any[], patterns: string[]): string[] {
    const recommendations: string[] = [];

    // Check for large commits
    const largeCommits = commits.filter(commit => commit.filesChanged.length > 10);
    if (largeCommits.length > 0) {
      recommendations.push('Consider breaking large commits into smaller, focused changes');
    }

    // Check for commit message quality
    const hasShortMessages = commits.some(commit => commit.message.length < 10);
    if (hasShortMessages) {
      recommendations.push('Write more descriptive commit messages for better project history');
    }

    // Check for test files
    const hasTestCommits = commits.some(commit => 
      commit.filesChanged.some((file: string | string[]) => file.includes('test') || file.includes('spec'))
    );
    if (!hasTestCommits) {
      recommendations.push('Consider adding tests alongside feature development');
    }

    return recommendations;
  }
}