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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInterface = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ChatInterface = function (_a) {
    var connected = _a.connected, onAnalysisComplete = _a.onAnalysisComplete;
    var _b = (0, react_1.useState)([
        {
            id: '1',
            type: 'assistant',
            content: 'Hello! I\'m DevInsight AI. I can help you analyze code, debug issues, explain functions, and review your git history. What would you like me to help with?',
            timestamp: new Date()
        }
    ]), messages = _b[0], setMessages = _b[1];
    var _c = (0, react_1.useState)(''), input = _c[0], setInput = _c[1];
    var _d = (0, react_1.useState)(false), isTyping = _d[0], setIsTyping = _d[1];
    var messagesEndRef = (0, react_1.useRef)(null);
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    (0, react_1.useEffect)(function () {
        scrollToBottom();
    }, [messages]);
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var userMessage, response, assistantMessage_1, error_1, errorMessage_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!input.trim() || !connected)
                        return [2 /*return*/];
                    userMessage = {
                        id: Date.now().toString(),
                        type: 'user',
                        content: input.trim(),
                        timestamp: new Date()
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [userMessage], false); });
                    setInput('');
                    setIsTyping(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, simulateAIResponse(userMessage.content)];
                case 2:
                    response = _a.sent();
                    assistantMessage_1 = {
                        id: (Date.now() + 1).toString(),
                        type: 'assistant',
                        content: response.content,
                        timestamp: new Date(),
                        results: response.results
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [assistantMessage_1], false); });
                    if (response.results) {
                        onAnalysisComplete(response.results);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    errorMessage_1 = {
                        id: (Date.now() + 1).toString(),
                        type: 'assistant',
                        content: 'Sorry, I encountered an error. Please make sure the MCP server is running and try again.',
                        timestamp: new Date()
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [errorMessage_1], false); });
                    return [3 /*break*/, 4];
                case 4:
                    setIsTyping(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var simulateAIResponse = function (input) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Simulate network delay
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 1:
                    // Simulate network delay
                    _a.sent();
                    if (input.toLowerCase().includes('analyze') || input.toLowerCase().includes('code')) {
                        return [2 /*return*/, {
                                content: 'I\'ve analyzed your code. Here are the key findings:\n\n• Code quality: Good\n• Complexity: Medium\n• Suggestions: Consider adding more comments\n• Security: No issues found\n\nWould you like me to analyze a specific file?',
                                results: {
                                    quality: 'good',
                                    complexity: 'medium',
                                    suggestions: ['Add more comments', 'Consider breaking down large functions'],
                                    security: []
                                }
                            }];
                    }
                    else if (input.toLowerCase().includes('bug') || input.toLowerCase().includes('error')) {
                        return [2 /*return*/, {
                                content: 'I can help debug that error! Please share the error message or traceback, and I\'ll analyze it for you.'
                            }];
                    }
                    else if (input.toLowerCase().includes('git') || input.toLowerCase().includes('history')) {
                        return [2 /*return*/, {
                                content: 'I can analyze your git history! Here\'s what I found:\n\n• Recent activity: 15 commits this week\n• Most active files: src/App.tsx, src/components/\n• Commit pattern: Regular, well-structured commits\n• Suggestions: Great job maintaining consistent commit messages!'
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                content: 'I understand you want help with: "' + input + '"\n\nI can assist with:\n• Code analysis and review\n• Bug debugging and fixes\n• Code explanations\n• Git history analysis\n• Performance suggestions\n\nWhat specific task would you like me to help with?'
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var formatTimestamp = function (date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return (<div className="bg-white rounded-lg shadow flex flex-col h-96">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        {!connected && (<p className="text-sm text-red-600">Disconnected - responses are simulated</p>)}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(function (message) { return (<div key={message.id} className={"flex items-start space-x-3 ".concat(message.type === 'user' ? 'flex-row-reverse space-x-reverse' : '')}>
            <div className={"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ".concat(message.type === 'user'
                ? 'bg-blue-600'
                : 'bg-gray-600')}>
              {message.type === 'user' ? (<lucide_react_1.UserIcon className="w-4 h-4 text-white"/>) : (<lucide_react_1.BotIcon className="w-4 h-4 text-white"/>)}
            </div>
            <div className={"flex-1 max-w-xs lg:max-w-md ".concat(message.type === 'user' ? 'text-right' : '')}>
              <div className={"rounded-lg px-4 py-2 ".concat(message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900')}>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
          </div>); })}
        
        {isTyping && (<div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <lucide_react_1.BotIcon className="w-4 h-4 text-white"/>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>)}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input type="text" value={input} onChange={function (e) { return setInput(e.target.value); }} placeholder="Ask me about your code..." className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isTyping}/>
          <button type="submit" disabled={!input.trim() || isTyping} className="btn btn-primary flex items-center space-x-2">
            <lucide_react_1.SendIcon className="w-4 h-4"/>
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>);
};
exports.ChatInterface = ChatInterface;
