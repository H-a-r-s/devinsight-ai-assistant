import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ProjectDashboard } from './components/ProjectDashboard';
import { CodeViewer } from './components/CodeViewer';
import { AnalysisResults } from './components/AnalysisResults';

interface AppState {
  currentView: 'dashboard' | 'chat' | 'analysis';
  connectedToServer: boolean;
  currentFile?: string;
  analysisResults?: any;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'dashboard',
    connectedToServer: false
  });

  useEffect(() => {
    // Test connection to MCP server
    fetch('http://localhost:3001/health')
      .then(response => {
        setState(prev => ({ ...prev, connectedToServer: response.ok }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, connectedToServer: false }));
      });
  }, []);

  const handleViewChange = (view: AppState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  const handleFileSelect = (filePath: string) => {
    setState(prev => ({ ...prev, currentFile: filePath, currentView: 'analysis' }));
  };

  const handleAnalysisComplete = (results: any) => {
    setState(prev => ({ ...prev, analysisResults: results }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">DevInsight</h1>
            <div className={`w-3 h-3 rounded-full ${
              state.connectedToServer ? 'bg-green-500' : 'bg-red-500'
            }`} title={state.connectedToServer ? 'Connected' : 'Disconnected'} />
          </div>
          
          <nav className="flex space-x-4">
            <button
              onClick={() => handleViewChange('dashboard')}
              className={`px-4 py-2 rounded-md font-medium ${
                state.currentView === 'dashboard'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleViewChange('chat')}
              className={`px-4 py-2 rounded-md font-medium ${
                state.currentView === 'chat'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AI Chat
            </button>
            <button
              onClick={() => handleViewChange('analysis')}
              className={`px-4 py-2 rounded-md font-medium ${
                state.currentView === 'analysis'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analysis
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!state.connectedToServer && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">
              Cannot connect to MCP server. Make sure the server is running on localhost:3001
            </p>
          </div>
        )}

        {state.currentView === 'dashboard' && (
          <ProjectDashboard 
            onFileSelect={handleFileSelect}
            connected={state.connectedToServer}
          />
        )}

        {state.currentView === 'chat' && (
          <ChatInterface 
            connected={state.connectedToServer}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {state.currentView === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeViewer 
              filePath={state.currentFile}
              connected={state.connectedToServer}
            />
            <AnalysisResults 
              results={state.analysisResults}
              filePath={state.currentFile}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;