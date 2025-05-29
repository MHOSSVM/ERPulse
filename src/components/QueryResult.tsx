"use client";

import { useState } from "react";

interface QueryResultProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  query?: string;
}

export default function QueryResult({ data, query }: QueryResultProps) {
  const [copied, setCopied] = useState(false);

  const copyQuery = () => {
    if (query) {
      navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No results found
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="mt-4 space-y-4">
      {query && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Generated SQL:</span>
            <button
              onClick={copyQuery}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <code className="text-sm bg-white p-2 rounded border block overflow-x-auto">
            {query}
          </code>
        </div>
      )}
      
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="text-sm text-gray-500">
        {data.length} row{data.length !== 1 ? 's' : ''} returned
      </div>
    </div>
  );
}
