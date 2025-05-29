"use client";

import { useState } from "react";

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
      default: // 'time'
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const avgExecutionTime = queryStats.length > 0 
    ? queryStats.reduce((sum, stat) => sum + stat.executionTime, 0) / queryStats.length 
    : 0;

  const totalQueries = queryStats.length;
  const fastestQuery = queryStats.reduce((fastest, current) => 
    current.executionTime < fastest.executionTime ? current : fastest, 
    queryStats[0] || { executionTime: 0 }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Query Performance Analytics</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {queryStats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">No query data available yet</div>
              <div className="text-gray-600 text-sm mt-2">Execute some queries to see performance analytics</div>
            </div>
          ) : (
            <>
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="text-sm text-blue-600 font-medium">Total Queries</div>
                  <div className="text-2xl font-bold text-blue-800">{totalQueries}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="text-sm text-green-600 font-medium">Avg Execution Time</div>
                  <div className="text-2xl font-bold text-green-800">
                    {avgExecutionTime.toFixed(2)}ms
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
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
                    onClick={() => setSortBy(key as 'time' | 'speed' | 'results')}
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

              {/* Query History Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Query
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Execution Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Results
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedStats.map((stat, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={stat.query}>
                              {stat.query}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stat.executionTime < 1000 
                                ? 'bg-green-100 text-green-800' 
                                : stat.executionTime < 3000 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {stat.executionTime.toFixed(2)}ms
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {stat.resultCount} rows
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(stat.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>      </div>
    </div>
  );
}
