import React from 'react';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, TrendingUpIcon } from 'lucide-react';

interface AnalysisResultsProps {
  results?: any;
  filePath?: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, filePath }) => {
  if (!results && !filePath) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <TrendingUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Analysis results will appear here</p>
          <p className="text-sm">Select a file or run an analysis to see insights</p>
        </div>
      </div>
    );
  }

  // Mock results if none provided
  const analysisData = results || {
    overall: {
      score: 85,
      status: 'good'
    },
    issues: {
      errors: 0,
      warnings: 2,
      info: 3
    },
    suggestions: [
      'Consider adding TypeScript strict mode',
      'Add more unit tests for better coverage',
      'Optimize bundle size by removing unused imports',
      'Add error boundaries for better error handling'
    ],
    security: {
      vulnerabilities: 0,
      recommendations: [
        'All security checks passed',
        'No hardcoded secrets found',
        'Dependencies are up to date'
      ]
    },
    performance: {
      score: 92,
      recommendations: [
        'Code splitting could improve load times',
        'Consider lazy loading for large components',
        'Optimize images and assets'
      ]
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
      case 'excellent':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'poor':
        return <AlertTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
        {filePath && (
          <p className="text-sm text-gray-600">For: {filePath}</p>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {/* Overall Score */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Overall Code Quality</h4>
            {getStatusIcon(analysisData.overall.status)}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`text-center p-4 rounded-lg ${getScoreColor(analysisData.overall.score)}`}>
              <div className="text-3xl font-bold">{analysisData.overall.score}</div>
              <div className="text-sm">Quality Score</div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Code Quality</span>
                <span>{analysisData.overall.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    analysisData.overall.score >= 80 ? 'bg-green-500' :
                    analysisData.overall.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisData.overall.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Issues Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">{analysisData.issues.errors}</div>
              <div className="text-xs text-red-600">Errors</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">{analysisData.issues.warnings}</div>
              <div className="text-xs text-yellow-600">Warnings</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{analysisData.issues.info}</div>
              <div className="text-xs text-blue-600">Info</div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Suggestions</h4>
          <div className="space-y-2">
            {analysisData.suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <InfoIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Security Analysis</h4>
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              {analysisData.security.vulnerabilities === 0 ? 'No vulnerabilities found' : `${analysisData.security.vulnerabilities} vulnerabilities found`}
            </span>
          </div>
          <div className="space-y-2">
            {analysisData.security.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Performance Analysis</h4>
          <div className="flex items-center space-x-4 mb-4">
            <div className={`text-center p-3 rounded-lg ${getScoreColor(analysisData.performance.score)}`}>
              <div className="text-2xl font-bold">{analysisData.performance.score}</div>
              <div className="text-xs">Performance Score</div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Performance</span>
                <span>{analysisData.performance.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analysisData.performance.score}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {analysisData.performance.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <TrendingUpIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};