"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectDashboard = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ProjectDashboard = function (_a) {
    var onFileSelect = _a.onFileSelect, connected = _a.connected;
    var _b = (0, react_1.useState)([]), fileTree = _b[0], setFileTree = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(''), selectedPath = _d[0], setSelectedPath = _d[1];
    var loadFileTree = function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockTree;
        return __generator(this, function (_a) {
            if (!connected)
                return [2 /*return*/];
            setLoading(true);
            try {
                mockTree = [
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
            }
            catch (error) {
                console.error('Failed to load file tree:', error);
            }
            setLoading(false);
            return [2 /*return*/];
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadFileTree();
    }, [connected]);
    var handleFileClick = function (item) {
        if (item.type === 'file') {
            setSelectedPath(item.path);
            onFileSelect(item.path);
        }
    };
    var renderFileTree = function (items, level) {
        if (level === void 0) { level = 0; }
        return items.map(function (item) { return (<div key={item.path} style={{ paddingLeft: "".concat(level * 20, "px") }}>
        <div className={"flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ".concat(selectedPath === item.path ? 'bg-blue-100' : '')} onClick={function () { return handleFileClick(item); }}>
          {item.type === 'directory' ? (<lucide_react_1.FolderIcon className="w-4 h-4 text-blue-500"/>) : (<lucide_react_1.FileIcon className="w-4 h-4 text-gray-500"/>)}
          <span className="text-sm">{item.name}</span>
        </div>
        {item.children && renderFileTree(item.children, level + 1)}
      </div>); });
    };
    return (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Explorer */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
            <button onClick={loadFileTree} disabled={!connected || loading} className="btn btn-primary">
              {loading ? '...' : 'Refresh'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {connected ? (fileTree.length > 0 ? (renderFileTree(fileTree)) : (<p className="text-gray-500 text-sm">No files found</p>)) : (<p className="text-gray-500 text-sm">Connect to server to browse files</p>)}
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
                <lucide_react_1.PlayIcon className="w-5 h-5 text-green-500"/>
                <h3 className="font-medium text-gray-900">Analyze Project</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Run a complete analysis of your codebase
              </p>
              <button className="btn btn-primary w-full" disabled={!connected}>
                Start Analysis
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <lucide_react_1.FileIcon className="w-5 h-5 text-blue-500"/>
                <h3 className="font-medium text-gray-900">Upload Files</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Upload files for analysis
              </p>
              <input type="file" multiple className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={!connected}/>
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
    </div>);
};
exports.ProjectDashboard = ProjectDashboard;
