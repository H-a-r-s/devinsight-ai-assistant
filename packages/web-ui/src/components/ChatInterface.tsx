import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, BotIcon, UserIcon } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  results?: any;
}

interface ChatInterfaceProps {
  connected: boolean;
  onAnalysisComplete: (results: any) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  connected,
  onAnalysisComplete
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m DevInsight AI. I can help you analyze code, debug issues, explain functions, and review your git history. What would you like me to help with?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate API call to MCP server
      const response = await simulateAIResponse(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        results: response.results
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.results) {
        onAnalysisComplete(response.results);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the MCP server is running and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  const simulateAIResponse = async (input: string): Promise<{ content: string; results?: any }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (input.toLowerCase().includes('analyze') || input.toLowerCase().includes('code')) {
      return {
        content: 'I\'ve analyzed your code. Here are the key findings:\n\n• Code quality: Good\n• Complexity: Medium\n• Suggestions: Consider adding more comments\n• Security: No issues found\n\nWould you like me to analyze a specific file?',
        results: {
          quality: 'good',
          complexity: 'medium',
          suggestions: ['Add more comments', 'Consider breaking down large functions'],
          security: []
        }
      };
    } else if (input.toLowerCase().includes('bug') || input.toLowerCase().includes('error')) {
      return {
        content: 'I can help debug that error! Please share the error message or traceback, and I\'ll analyze it for you.'
      };
    } else if (input.toLowerCase().includes('git') || input.toLowerCase().includes('history')) {
      return {
        content: 'I can analyze your git history! Here\'s what I found:\n\n• Recent activity: 15 commits this week\n• Most active files: src/App.tsx, src/components/\n• Commit pattern: Regular, well-structured commits\n• Suggestions: Great job maintaining consistent commit messages!'
      };
    } else {
      return {
        content: 'I understand you want help with: "' + input + '"\n\nI can assist with:\n• Code analysis and review\n• Bug debugging and fixes\n• Code explanations\n• Git history analysis\n• Performance suggestions\n\nWhat specific task would you like me to help with?'
      };
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-96">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        {!connected && (
          <p className="text-sm text-red-600">Disconnected - responses are simulated</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-blue-600' 
                : 'bg-gray-600'
            }`}>
              {message.type === 'user' ? (
                <UserIcon className="w-4 h-4 text-white" />
              ) : (
                <BotIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`flex-1 max-w-xs lg:max-w-md ${
              message.type === 'user' ? 'text-right' : ''
            }`}>
              <div className={`rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <BotIcon className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your code..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="btn btn-primary flex items-center space-x-2"
          >
            <SendIcon className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};