"use client";

import { useEffect, useState } from "react";
import {
  HumanMessage,
  SystemMessage,
  BaseMessage,
  AIMessage,
  mapChatMessagesToStoredMessages,
} from "@langchain/core/messages";
import { message } from "./actions";
import { seed } from "./database";
import QueryResult from "../components/QueryResult";
import DatabaseSchema from "../components/DatabaseSchema";
import QueryHistory from "../components/QueryHistory";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";
import QueryPerformance from "../components/QueryPerformance";

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([
    new SystemMessage(`
      You are an expert SQL assistant. Your task is to generate SQL queries based on user requests. Follow these strict formatting guidelines:
          You should create a SQLite query based on natural language. 
      Use the &quot;getFromDB&quot; tool to get data from a database.

      - Always enclose field names and table names in double quotes (&quot;), even if they contain no special characters.
      - Ensure proper SQL syntax and use best practices for readability.
      - Maintain consistency in capitalization (e.g., SQL keywords in uppercase).
    `),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [queryCount, setQueryCount] = useState(0);
  const [queryStats, setQueryStats] = useState<Array<{
    query: string;
    executionTime: number;
    timestamp: Date;
    resultCount: number;
  }>>([]);

  useEffect(() => {
    seed();
    // Load query history from localStorage
    const savedHistory = localStorage.getItem('sqlQueryHistory');
    if (savedHistory) {
      setQueryHistory(JSON.parse(savedHistory));
    }
  }, []);

  async function sendMessage() {
    if (!inputMessage.trim()) return;
    
    setIsLoading(true);
    const startTime = Date.now();
    const messageHistory = [...messages, new HumanMessage(inputMessage)];

    try {
      const response = await message(
        mapChatMessagesToStoredMessages(messageHistory)
      );

      if (response) {
        messageHistory.push(new AIMessage(response as string));
        
        // Update query history
        const newHistory = [inputMessage, ...queryHistory].slice(0, 20); // Keep last 20 queries
        setQueryHistory(newHistory);
        localStorage.setItem('sqlQueryHistory', JSON.stringify(newHistory));
        
        // Update performance metrics
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        // Count actual results from the response
        const resultCount = parseTableData(response as string).length;        setQueryStats(prev => [{
          query: inputMessage,
          executionTime,
          timestamp: new Date(),
          resultCount
        }, ...prev].slice(0, 50)); // Keep last 50 queries
        setQueryCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      messageHistory.push(new AIMessage('Sorry, there was an error processing your query. Please try again.'));
    }

    setMessages(messageHistory);
    setInputMessage("");
    setIsLoading(false);
  }

  const parseTableData = (content: string) => {
    // Simple parser for markdown-style tables
    const lines = content.split('\n');
    const tableLines = lines.filter(line => line.includes('|'));
    
    if (tableLines.length < 2) return [];
    
    const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
    const dataLines = tableLines.slice(2); // Skip header separator
    
    return dataLines.map(line => {      const values = line.split('|').map(v => v.trim()).filter(v => v);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleHistorySelect = (query: string) => {
    setInputMessage(query);
    setShowHistory(false);
  };

  const renderMessage = (message: BaseMessage, index: number) => {
    const content = message.content as string;
    
    if (message instanceof HumanMessage) {
      return (
        <div key={`${message.getType()}-${index}`} className="mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              You
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm border p-4">
              <p className="text-gray-800">{content}</p>
            </div>
          </div>
        </div>
      );
    }

    if (message instanceof AIMessage) {
      // Check if the response contains SQL results
      const hasTableData = content.includes('|') && (content.includes('---') || content.includes('━━'));
      
      return (
        <div key={`${message.getType()}-${index}`} className="mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              AI
            </div>
            <div className="flex-1">
              {hasTableData ? (
                <QueryResult 
                  data={parseTableData(content)}
                  query={index > 0 ? (messages[index - 1]?.content as string) : ''}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg shadow-sm border p-4">
                  <div className="text-gray-800 whitespace-pre-wrap">{content}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SQL</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Text-to-SQL Agent</h1>
                  <p className="text-sm text-gray-500">
                    {queryCount > 0 && `${queryCount} queries • `}
                    {queryStats.length > 0 && `Avg: ${Math.round(queryStats.reduce((sum, stat) => sum + stat.executionTime, 0) / queryStats.length)}ms`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPerformance(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Performance
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  History
                </button>
                <button
                  onClick={() => setShowSchema(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View Schema
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              {messages.slice(1).map((message, index) => renderMessage(message, index + 1))}
              
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-600">Processing your query...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything about your database... (Press Enter to send, Shift+Enter for new line)"
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Query</span>
                  )}
                </button>
              </div>
              
              {/* Helper Text */}
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>Try asking: &quot;Show me all customers&quot; or &quot;What are the recent orders?&quot;</span>
                <span>Queries: {queryCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <DatabaseSchema 
          isOpen={showSchema} 
          onClose={() => setShowSchema(false)} 
        />
        
        <QueryHistory 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)}
          queries={queryHistory}
          onSelectQuery={handleHistorySelect}
        />

        <QueryPerformance
          isOpen={showPerformance}
          onClose={() => setShowPerformance(false)}
          queryStats={queryStats}
        />
      </div>
    </ErrorBoundary>
  );
}
