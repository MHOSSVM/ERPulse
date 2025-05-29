"use client";

import { useState, useEffect } from "react";

interface QueryPerformanceProps {
  isOpen: boolean;
  onClose: () => void;
  queryStats: {
    query: string;
    executionTime: number;
    timestamp: Date;
    resultCount: number;
  }[];
}

export default function QueryPerformance({ isOpen, onClose, queryStats }: QueryPerformanceProps) {
  const [sortBy, setSortBy] = useState<'time' | 'speed' | 'results'>('time');

  if (!isOpen) return null;

  const sortedStats = [...queryStats].sort((a, b) => {
    switch (sortBy) {
      case 'speed':
        return a.executionTime - b.executionTime;
      case 'results':
        return b.resultCount - a.resultCount;
      case 'time':
      default:
        return b.timestamp.getTime() - a.timestamp.getTime();
    }
  });

  const avgExecutionTime = queryStats.length > 0 
    ? queryStats.reduce((sum, stat) => sum + stat.executionTime, 0) / queryStats.length 
    : 0;

  const totalQueries = queryStats.length;
  const fastestQuery = queryStats.reduce((min, stat) => 
    stat.executionTime < min.executionTime ? stat : min, 
    queryStats[0] || { executionTime: 0 }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Query Performance Analytics</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {queryStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">📊</div>
            <p>No query performance data yet. Execute some queries to see analytics!</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Total Queries</div>
                <div className="text-2xl font-bold text-blue-800">{totalQueries}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Avg Execution Time</div>
                <div className="text-2xl font-bold text-green-800">{avgExecutionTime.toFixed(2)}ms</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Fastest Query</div>
                <div className="text-2xl font-bold text-purple-800">
                  {fastestQuery?.executionTime?.toFixed(2) || 0}ms
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 mb-4">
              <span className="text-sm text-gray-600 py-2">Sort by:</span>
              {[
                { key: 'time', label: 'Recent' },
                { key: 'speed', label: 'Fastest' },
                { key: 'results', label: 'Most Results' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as any)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    sortBy === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Query List */}
            <div className="space-y-3">
              {sortedStats.map((stat, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-4">
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {stat.query}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {stat.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                      <span className="text-blue-600">
                        ⚡ {stat.executionTime.toFixed(2)}ms
                      </span>
                      <span className="text-green-600">
                        📊 {stat.resultCount} rows
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      stat.executionTime < 100 
                        ? 'bg-green-100 text-green-800'
                        : stat.executionTime < 500
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stat.executionTime < 100 ? 'Fast' : stat.executionTime < 500 ? 'Medium' : 'Slow'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Tips */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Performance Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use LIMIT clauses for large result sets</li>
                <li>• Add WHERE conditions to filter data early</li>
                <li>• Consider using indexes for frequently queried columns</li>
                <li>• Avoid SELECT * when you only need specific columns</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
