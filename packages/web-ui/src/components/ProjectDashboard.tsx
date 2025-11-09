import React, { useState, useEffect } from 'react';
import { FolderIcon, FileIcon, PlayIcon } from 'lucide-react';

interface ProjectDashboardProps {
  onFileSelect: (filePath: string) => void;
  connected: boolean;
}

interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeItem[];
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  onFileSelect,
  connected
}) => {
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>('');

  const loadFileTree = async () => {
    if (!connected) return;
    
    setLoading(true);
    try {
      // This would call your MCP server to get project structure
      // For now, we'll use a mock structure
      const mockTree: FileTreeItem[] = [
        {
          name: 'src',
          path: './src',
          type: 'directory',
          children: [
            { name: 'App.tsx', path: './src/App.tsx', type: 'file' },
            { name: 'index.tsx', path: './src/index.tsx', type: 'file' },
            {
              name: 'components',
              path: './src/components',
              type: 'directory',
              children: [
                { name: 'Header.tsx', path: './src/components/Header.tsx', type: 'file' },
                { name: 'Sidebar.tsx', path: './src/components/Sidebar.tsx', type: 'file' }
              ]
            }
          ]
        },
        { name: 'package.json', path: './package.json', type: 'file' },
        { name: 'README.md', path: './README.md', type: 'file' }
      ];
      setFileTree(mockTree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFileTree();
  }, [connected]);

  const handleFileClick = (item: FileTreeItem) => {
    if (item.type === 'file') {
      setSelectedPath(item.path);
      onFileSelect(item.path);
    }
  };

  const renderFileTree = (items: FileTreeItem[], level: number = 0) => {
    return items.map((item) => (
      <div key={item.path} style={{ paddingLeft: `${level * 20}px` }}>
        <div
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            selectedPath === item.path ? 'bg-blue-100' : ''
          }`}
          onClick={() => handleFileClick(item)}
        >
          {item.type === 'directory' ? (
            <FolderIcon className="w-4 h-4 text-blue-500" />
          ) : (
            <FileIcon className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm">{item.name}</span>
        </div>
        {item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Explorer */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
            <button
              onClick={loadFileTree}
              disabled={!connected || loading}
              className="btn btn-primary"
            >
              {loading ? '...' : 'Refresh'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {connected ? (
              fileTree.length > 0 ? (
                renderFileTree(fileTree)
              ) : (
                <p className="text-gray-500 text-sm">No files found</p>
              )
            ) : (
              <p className="text-gray-500 text-sm">Connect to server to browse files</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <PlayIcon className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-gray-900">Analyze Project</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Run a complete analysis of your codebase
              </p>
              <button 
                className="btn btn-primary w-full"
                disabled={!connected}
              >
                Start Analysis
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <FileIcon className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-gray-900">Upload Files</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Upload files for analysis
              </p>
              <input
                type="file"
                multiple
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={!connected}
              />
            </div>
          </div>

          {/* Project Stats */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Project Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-xs text-gray-600">Files</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-green-600">1,240</div>
                <div className="text-xs text-gray-600">Lines</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-xs text-gray-600">Warnings</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-xs text-gray-600">Errors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};