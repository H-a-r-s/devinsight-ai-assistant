import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { logger } from '../utils/logger.js';
import { CodeAnalysisResult, BugAnalysisResult, CodeExplanationResult } from '../types/mcp.js';

export class CodeAnalysisHandler {
  constructor() {
    logger.info('CodeAnalysisHandler initialized');
  }

  async analyzeCode(args: any): Promise<CodeAnalysisResult> {
    const { filePath, includeMetrics = true, includeSecurityCheck = false } = args;
    
    logger.info(`Analyzing code: ${filePath}`);

    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const language = this.detectLanguage(filePath);
      const stats = statSync(filePath);

      const result: CodeAnalysisResult = {
        filePath,
        language,
        metrics: includeMetrics ? this.calculateMetrics(content, language) : {
          linesOfCode: content.split('\n').length,
          complexity: 0,
          maintainabilityIndex: 0
        },
        issues: await this.findIssues(content, language, filePath),
        suggestions: this.generateSuggestions(content, language),
        ...(includeSecurityCheck && {
          securityIssues: this.findSecurityIssues(content, language)
        })
      };

      logger.info(`Code analysis completed for ${filePath}`);
      return result;

    } catch (error) {
      logger.error(`Code analysis failed for ${filePath}`, error);
      throw error;
    }
  }

  async findBug(args: any): Promise<BugAnalysisResult> {
    const { traceback, contextFiles = [] } = args;
    
    logger.info('Analyzing bug from traceback');

    try {
      const errorInfo = this.parseTraceback(traceback);
      const relevantFiles = await this.findRelevantFiles(errorInfo, contextFiles);
      const codeSnippets = await this.extractCodeSnippets(relevantFiles, errorInfo);

      const result: BugAnalysisResult = {
        errorType: errorInfo.type,
        probableCause: this.determineProbableCause(errorInfo, codeSnippets),
        suggestedFix: this.generateBugFix(errorInfo, codeSnippets),
        relevantFiles: relevantFiles,
        codeSnippets: codeSnippets
      };

      logger.info('Bug analysis completed');
      return result;

    } catch (error) {
      logger.error('Bug analysis failed', error);
      throw error;
    }
  }

  async explainCode(args: any): Promise<CodeExplanationResult> {
    const { filePath, startLine, endLine } = args;
    
    logger.info(`Explaining code: ${filePath}`);

    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const language = this.detectLanguage(filePath);

      const targetLines = startLine && endLine 
        ? lines.slice(startLine - 1, endLine)
        : lines;

      const result: CodeExplanationResult = {
        filePath,
        overview: this.generateOverview(content, language),
        sections: this.breakIntoSections(targetLines, startLine || 1, language),
        dependencies: this.findDependencies(content, language),
        relatedFiles: await this.findRelatedFiles(filePath, content)
      };

      logger.info(`Code explanation completed for ${filePath}`);
      return result;

    } catch (error) {
      logger.error(`Code explanation failed for ${filePath}`, error);
      throw error;
    }
  }

  private detectLanguage(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    const languageMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust'
    };
    return languageMap[ext] || 'unknown';
  }

  private calculateMetrics(content: string, language: string) {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
    });

    return {
      linesOfCode: codeLines.length,
      complexity: this.calculateComplexity(content, language),
      maintainabilityIndex: this.calculateMaintainability(content, language)
    };
  }

  private calculateComplexity(content: string, language: string): number {
    // Simplified cyclomatic complexity calculation
    const complexityPatterns = {
      javascript: /\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/g,
      typescript: /\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/g,
      python: /\b(if|elif|else|while|for|except|and|or)\b/g,
      java: /\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/g
    };

    const pattern = complexityPatterns[language as keyof typeof complexityPatterns] || complexityPatterns.javascript;
    const matches = content.match(pattern);
    return matches ? matches.length + 1 : 1;
  }

  private calculateMaintainability(content: string, language: string): number {
    // Simplified maintainability index (0-100 scale)
    const lines = content.split('\n').length;
    const complexity = this.calculateComplexity(content, language);
    
    // Formula based on Halstead metrics (simplified)
    let score = 171 - 5.2 * Math.log(lines) - 0.23 * complexity - 16.2 * Math.log(lines / 10);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private async findIssues(content: string, language: string, filePath: string) {
    const issues: Array<{
      type: 'warning' | 'error' | 'info';
      line: number;
      column?: number;
      message: string;
      rule?: string;
    }> = [];

    const lines = content.split('\n');

    // Common code smell detection
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      // Long line detection
      if (line.length > 120) {
        issues.push({
          type: 'warning',
          line: lineNumber,
          message: 'Line too long (>120 characters)',
          rule: 'line-length'
        });
      }

      // TODO comments
      if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
        issues.push({
          type: 'info',
          line: lineNumber,
          message: 'TODO/FIXME comment found',
          rule: 'todo-comment'
        });
      }

      // Console.log detection (for JS/TS)
      if ((language === 'javascript' || language === 'typescript') && 
          trimmed.includes('console.log')) {
        issues.push({
          type: 'warning',
          line: lineNumber,
          message: 'Console.log statement found - consider removing for production',
          rule: 'no-console'
        });
      }

      // Unused variables (simplified detection)
      if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) {
        const varName = trimmed.split(' ')[1]?.replace(/[=:,]/g, '');
        if (varName && !content.includes(varName.slice(0, -1))) {
          issues.push({
            type: 'warning',
            line: lineNumber,
            message: `Variable '${varName}' might be unused`,
            rule: 'unused-variable'
          });
        }
      }
    });

    return issues;
  }

  private generateSuggestions(content: string, language: string): string[] {
    const suggestions: string[] = [];
    const lines = content.split('\n');

    // Performance suggestions
    if (language === 'javascript' || language === 'typescript') {
      if (content.includes('document.getElementById')) {
        suggestions.push('Consider caching DOM queries for better performance');
      }
      if (content.includes('for (let i = 0; i < arr.length; i++)')) {
        suggestions.push('Consider using forEach, map, or for...of for better readability');
      }
    }

    // Security suggestions
    if (content.includes('eval(')) {
      suggestions.push('Avoid using eval() as it poses security risks');
    }

    // Code organization suggestions
    if (lines.length > 100) {
      suggestions.push('Consider breaking this file into smaller, more focused modules');
    }

    // Documentation suggestions
    const functionCount = (content.match(/function|const.*=.*=>|def /g) || []).length;
    const commentCount = (content.match(/\/\/|\/\*|\#/g) || []).length;
    if (functionCount > commentCount / 2) {
      suggestions.push('Consider adding more comments and documentation');
    }

    return suggestions;
  }

  private findSecurityIssues(content: string, language: string) {
    const issues: Array<{
      severity: 'high' | 'medium' | 'low';
      line: number;
      message: string;
      recommendation: string;
    }> = [];

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      // SQL Injection risks
      if (trimmed.includes('SELECT') && trimmed.includes('+')) {
        issues.push({
          severity: 'high',
          line: lineNumber,
          message: 'Potential SQL injection vulnerability',
          recommendation: 'Use parameterized queries or prepared statements'
        });
      }

      // XSS risks
      if (trimmed.includes('innerHTML') && trimmed.includes('+')) {
        issues.push({
          severity: 'medium',
          line: lineNumber,
          message: 'Potential XSS vulnerability with innerHTML',
          recommendation: 'Use textContent or properly sanitize HTML'
        });
      }

      // Hardcoded credentials
      if (/password|secret|key.*=.*['"]/.test(trimmed.toLowerCase())) {
        issues.push({
          severity: 'high',
          line: lineNumber,
          message: 'Potential hardcoded credential',
          recommendation: 'Use environment variables or secure configuration'
        });
      }
    });

    return issues;
  }

  private parseTraceback(traceback: string) {
    // Simplified traceback parsing
    const lines = traceback.split('\n');
    const errorLine = lines.find(line => line.includes('Error:') || line.includes('Exception:'));
    
    return {
      type: errorLine ? errorLine.split(':')[0] : 'UnknownError',
      message: errorLine ? errorLine.split(':').slice(1).join(':').trim() : traceback,
      files: lines.filter(line => line.includes('.js') || line.includes('.ts') || line.includes('.py'))
        .map(line => {
          const match = line.match(/([^/]+\.(js|ts|py)):(\d+)/);
          return match ? { file: match[1], line: parseInt(match[3]) } : null;
        }).filter(Boolean)
    };
  }

  private async findRelevantFiles(errorInfo: any, contextFiles: string[]): Promise<string[]> {
    const relevantFiles = [...contextFiles];
    
    // Add files mentioned in traceback
    errorInfo.files?.forEach((fileInfo: any) => {
      if (fileInfo && !relevantFiles.includes(fileInfo.file)) {
        relevantFiles.push(fileInfo.file);
      }
    });

    return relevantFiles.slice(0, 5); // Limit to 5 files
  }

  private async extractCodeSnippets(files: string[], errorInfo: any) {
    const snippets: Array<{
      file: string;
      lines: string;
      explanation: string;
    }> = [];

    for (const file of files) {
      if (existsSync(file)) {
        try {
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          
          // Find relevant line from error info
          const errorFileInfo = errorInfo.files?.find((f: any) => f?.file === file);
          const lineNumber = errorFileInfo?.line || 1;
          
          // Extract 5 lines around the error
          const start = Math.max(0, lineNumber - 3);
          const end = Math.min(lines.length, lineNumber + 2);
          const relevantLines = lines.slice(start, end);
          
          snippets.push({
            file,
            lines: relevantLines.join('\n'),
            explanation: `Code around line ${lineNumber} where error occurred`
          });
        } catch (error) {
          logger.warn(`Could not read file: ${file}`);
        }
      }
    }

    return snippets;
  }

  private determineProbableCause(errorInfo: any, codeSnippets: any[]): string {
    const errorType = errorInfo.type.toLowerCase();
    
    if (errorType.includes('undefined')) {
      return 'Variable or property is not defined or has not been initialized';
    } else if (errorType.includes('null')) {
      return 'Attempting to access properties or methods on null value';
    } else if (errorType.includes('type')) {
      return 'Type mismatch - value is not the expected type';
    } else if (errorType.includes('reference')) {
      return 'Variable is referenced before declaration or is out of scope';
    } else if (errorType.includes('syntax')) {
      return 'Code contains syntax errors - check brackets, semicolons, quotes';
    } else {
      return 'Error analysis requires deeper investigation of the code context';
    }
  }

  private generateBugFix(errorInfo: any, codeSnippets: any[]): string {
    const errorType = errorInfo.type.toLowerCase();
    
    if (errorType.includes('undefined')) {
      return 'Add null checks: if (variable !== undefined) { ... } or use optional chaining: object?.property';
    } else if (errorType.includes('null')) {
      return 'Add null checks: if (variable !== null) { ... } or initialize with default values';
    } else if (errorType.includes('type')) {
      return 'Verify data types: use typeof checks or TypeScript for type safety';
    } else if (errorType.includes('reference')) {
      return 'Ensure variable is declared before use or check scope/import statements';
    } else if (errorType.includes('syntax')) {
      return 'Review syntax: check matching brackets, proper semicolons, correct quotes';
    } else {
      return 'Review the code context and error message for specific debugging steps';
    }
  }

  private generateOverview(content: string, language: string): string {
    const lines = content.split('\n').length;
    const functions = (content.match(/function|const.*=.*=>|def |class /g) || []).length;
    
    return `This ${language} file contains ${lines} lines of code with ${functions} functions/classes. ` +
           `It appears to be ${this.inferPurpose(content, language)}.`;
  }

  private inferPurpose(content: string, language: string): string {
    if (content.includes('import React') || content.includes('from \'react\'')) {
      return 'a React component';
    } else if (content.includes('express') || content.includes('app.listen')) {
      return 'an Express.js server';
    } else if (content.includes('class') && content.includes('constructor')) {
      return 'a class definition';
    } else if (content.includes('function') || content.includes('=>')) {
      return 'a utility module with functions';
    } else {
      return 'a general purpose module';
    }
  }

  private breakIntoSections(lines: string[], startLine: number, language: string) {
    const sections: Array<{
      startLine: number;
      endLine: number;
      explanation: string;
      concepts: string[];
    }> = [];

    let currentSection = { start: startLine, lines: [] as string[], concepts: new Set<string>() };

    lines.forEach((line, index) => {
      const lineNumber = startLine + index;
      currentSection.lines.push(line);

      // Detect concepts
      if (line.includes('import') || line.includes('require')) {
        currentSection.concepts.add('imports');
      }
      if (line.includes('function') || line.includes('=>')) {
        currentSection.concepts.add('function-definition');
      }
      if (line.includes('if') || line.includes('else')) {
        currentSection.concepts.add('conditional-logic');
      }
      if (line.includes('for') || line.includes('while') || line.includes('forEach')) {
        currentSection.concepts.add('loops');
      }

      // Break into sections on empty lines or significant syntax
      if (line.trim() === '' || line.includes('function') || 
          (index > 0 && lines[index - 1].trim() === '')) {
        if (currentSection.lines.length > 1) {
          sections.push({
            startLine: currentSection.start,
            endLine: lineNumber - 1,
            explanation: this.explainSection(currentSection.lines, language),
            concepts: Array.from(currentSection.concepts)
          });
        }
        currentSection = { start: lineNumber + 1, lines: [] as string[], concepts: new Set<string>() };
      }
    });

    // Add final section
    if (currentSection.lines.length > 0) {
      sections.push({
        startLine: currentSection.start,
        endLine: startLine + lines.length - 1,
        explanation: this.explainSection(currentSection.lines, language),
        concepts: Array.from(currentSection.concepts)
      });
    }

    return sections;
  }

  private explainSection(lines: string[], language: string): string {
    const content = lines.join('\n');
    
    if (content.includes('import') || content.includes('require')) {
      return 'This section imports dependencies and modules needed for the code to function';
    } else if (content.includes('function') || content.includes('=>')) {
      return 'This section defines a function that encapsulates specific functionality';
    } else if (content.includes('if') || content.includes('else')) {
      return 'This section contains conditional logic that executes different code paths';
    } else if (content.includes('for') || content.includes('while')) {
      return 'This section contains loop logic for iterating over data or repeating operations';
    } else if (content.includes('return')) {
      return 'This section returns a value or result from the function';
    } else {
      return 'This section contains core logic and operations for the module';
    }
  }

  private findDependencies(content: string, language: string): string[] {
    const dependencies: string[] = [];
    
    // JavaScript/TypeScript imports
    const importMatches = content.match(/import.*from ['"`]([^'"`]+)['"`]/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const dep = match.match(/from ['"`]([^'"`]+)['"`]/)?.[1];
        if (dep) dependencies.push(dep);
      });
    }

    // Node.js requires
    const requireMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g);
    if (requireMatches) {
      requireMatches.forEach(match => {
        const dep = match.match(/['"`]([^'"`]+)['"`]/)?.[1];
        if (dep) dependencies.push(dep);
      });
    }

    return [...new Set(dependencies)];
  }

  private async findRelatedFiles(filePath: string, content: string): Promise<string[]> {
    const related: string[] = [];
    const dir = dirname(filePath);
    
    // Look for relative imports
    const relativeImports = content.match(/from ['"`]\.\/([^'"`]+)['"`]/g);
    if (relativeImports) {
      relativeImports.forEach(match => {
        const relativePath = match.match(/['"`]\.\/([^'"`]+)['"`]/)?.[1];
        if (relativePath) {
          related.push(join(dir, relativePath));
        }
      });
    }

    return related;
  }
}