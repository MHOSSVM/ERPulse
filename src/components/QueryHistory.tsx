"use client";

import { useState } from "react";

interface QueryHistoryProps {
  queries: string[];
  onSelectQuery: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function QueryHistory({ queries, onSelectQuery, isOpen, onClose }: QueryHistoryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Query History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        {queries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">📝</div>
            <p>No queries yet. Start asking questions about your data!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Click on any previous query to reuse it:
            </p>
            {queries.map((query, index) => (
              <div
                key={index}
                onClick={() => {
                  onSelectQuery(query);
                  onClose();
                }}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 flex-1">{query}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {index === 0 ? 'Latest' : `${index + 1} ago`}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Suggested Queries</h3>
              <div className="space-y-2">
                {[
                  "Show customers who made orders in the last week",
                  "Find the average shipping cost by carrier",
                  "List orders sorted by shipping cost descending",
                  "Show customer names with their total number of orders",
                  "Find customers who haven't made any orders"
                ].map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onSelectQuery(suggestion);
                      onClose();
                    }}
                    className="p-2 text-sm bg-blue-50 text-blue-700 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
