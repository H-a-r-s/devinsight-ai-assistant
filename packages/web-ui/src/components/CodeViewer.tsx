import React, { useState, useEffect } from 'react';
import { FileIcon, AlertTriangleIcon, InfoIcon, CheckCircleIcon } from 'lucide-react';

interface CodeViewerProps {
  filePath?: string;
  connected: boolean;
}

interface CodeAnalysis {
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
    message: string;
    rule?: string;
  }>;
  suggestions: string[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ filePath, connected }) => {
  const [content, setContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (filePath && connected) {
      loadFileAndAnalyze();
    }
  }, [filePath, connected]);

  const loadFileAndAnalyze = async () => {
    if (!filePath) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate file loading and analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock file content
      const mockContent = `// ${filePath}
import React, { useState } from 'react';

interface Props {
  title: string;
  children?: React.ReactNode;
}

const Component: React.FC<Props> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="component">
      <h2 onClick={handleToggle}>{title}</h2>
      {isOpen && (
        <div className="content">
          {children}
        </div>
      )}
    </div>
  );
};

export default Component;`;

      // Mock analysis results
      const mockAnalysis: CodeAnalysis = {
        filePath,
        language: 'typescript',
        metrics: {
          linesOfCode: 24,
          complexity: 3,
          maintainabilityIndex: 85
        },
        issues: [
          {
            type: 'info',
            line: 1,
            message: 'Consider adding JSDoc comments for better documentation',
            rule: 'documentation'
          },
          {
            type: 'warning',
            line: 10,
            message: 'Consider memoizing this handler to prevent unnecessary re-renders',
            rule: 'performance'
          }
        ],
        suggestions: [
          'Add TypeScript strict mode for better type safety',
          'Consider using useCallback for event handlers',
          'Add PropTypes or better TypeScript interfaces'
        ]
      };

      setContent(mockContent);
      setAnalysis(mockAnalysis);
      
    } catch (err) {
      setError('Failed to load file or perform analysis');
    }
    
    setLoading(false);
  };

  const getIssueIcon = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <InfoIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!filePath) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <FileIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a file to view and analyze</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">{filePath}</h3>
          </div>
          {connected && (
            <button
              onClick={loadFileAndAnalyze}
              disabled={loading}
              className="btn btn-primary text-sm"
            >
              {loading ? 'Analyzing...' : 'Re-analyze'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 border-b">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="px-6 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Analyzing code...</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {/* Code Content */}
          <div className="p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Code</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{content}</code>
            </pre>
          </div>

          {/* Issues */}
          {analysis && analysis.issues.length > 0 && (
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Issues Found</h4>
              <div className="space-y-2">
                {analysis.issues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{issue.message}</p>
                      <p className="text-xs text-gray-500">Line {issue.line}{issue.rule && ` • ${issue.rule}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {analysis && (
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Code Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{analysis.metrics.linesOfCode}</div>
                  <div className="text-xs text-blue-600">Lines of Code</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{analysis.metrics.complexity}</div>
                  <div className="text-xs text-yellow-600">Complexity</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{analysis.metrics.maintainabilityIndex}</div>
                  <div className="text-xs text-green-600">Maintainability</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};