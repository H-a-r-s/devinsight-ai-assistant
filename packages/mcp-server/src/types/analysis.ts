export interface FileInfo {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  lastModified?: Date;
  language?: string;
}

export interface ProjectStructure {
  name: string;
  type: 'directory';
  children: (FileInfo | ProjectStructure)[];
}

export interface TestResult {
  testFile: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  failures?: Array<{
    test: string;
    message: string;
    stack?: string;
  }>;
}

export interface TestRunResult {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: TestResult[];
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}