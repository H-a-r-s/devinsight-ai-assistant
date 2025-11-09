"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ChatInterface_1 = require("./components/ChatInterface");
var ProjectDashboard_1 = require("./components/ProjectDashboard");
var CodeViewer_1 = require("./components/CodeViewer");
var AnalysisResults_1 = require("./components/AnalysisResults");
function App() {
    var _a = (0, react_1.useState)({
        currentView: 'dashboard',
        connectedToServer: false
    }), state = _a[0], setState = _a[1];
    (0, react_1.useEffect)(function () {
        // Test connection to MCP server
        fetch('http://localhost:3001/health')
            .then(function (response) {
            setState(function (prev) { return (__assign(__assign({}, prev), { connectedToServer: response.ok })); });
        })
            .catch(function () {
            setState(function (prev) { return (__assign(__assign({}, prev), { connectedToServer: false })); });
        });
    }, []);
    var handleViewChange = function (view) {
        setState(function (prev) { return (__assign(__assign({}, prev), { currentView: view })); });
    };
    var handleFileSelect = function (filePath) {
        setState(function (prev) { return (__assign(__assign({}, prev), { currentFile: filePath, currentView: 'analysis' })); });
    };
    var handleAnalysisComplete = function (results) {
        setState(function (prev) { return (__assign(__assign({}, prev), { analysisResults: results })); });
    };
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">DevInsight</h1>
            <div className={"w-3 h-3 rounded-full ".concat(state.connectedToServer ? 'bg-green-500' : 'bg-red-500')} title={state.connectedToServer ? 'Connected' : 'Disconnected'}/>
          </div>
          
          <nav className="flex space-x-4">
            <button onClick={function () { return handleViewChange('dashboard'); }} className={"px-4 py-2 rounded-md font-medium ".concat(state.currentView === 'dashboard'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-gray-900')}>
              Dashboard
            </button>
            <button onClick={function () { return handleViewChange('chat'); }} className={"px-4 py-2 rounded-md font-medium ".concat(state.currentView === 'chat'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-gray-900')}>
              AI Chat
            </button>
            <button onClick={function () { return handleViewChange('analysis'); }} className={"px-4 py-2 rounded-md font-medium ".concat(state.currentView === 'analysis'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-gray-900')}>
              Analysis
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!state.connectedToServer && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">
              Cannot connect to MCP server. Make sure the server is running on localhost:3001
            </p>
          </div>)}

        {state.currentView === 'dashboard' && (<ProjectDashboard_1.ProjectDashboard onFileSelect={handleFileSelect} connected={state.connectedToServer}/>)}

        {state.currentView === 'chat' && (<ChatInterface_1.ChatInterface connected={state.connectedToServer} onAnalysisComplete={handleAnalysisComplete}/>)}

        {state.currentView === 'analysis' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeViewer_1.CodeViewer filePath={state.currentFile} connected={state.connectedToServer}/>
            <AnalysisResults_1.AnalysisResults results={state.analysisResults} filePath={state.currentFile}/>
          </div>)}
      </main>
    </div>);
}
exports.default = App;
