"use client";

import { useState } from "react";

interface DatabaseSchemaProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
  isRequired?: boolean;
  isForeignKey?: boolean;
}

interface TableSchema {
  columns: Column[];
}

export default function DatabaseSchema({ isOpen, onClose }: DatabaseSchemaProps) {
  if (!isOpen) return null;

  const schema: Record<string, TableSchema> = {
    customer: {
      columns: [
        { name: "id", type: "INTEGER", isPrimary: true },
        { name: "email", type: "TEXT", isRequired: true },
        { name: "name", type: "TEXT", isRequired: true }
      ]
    },
    order: {
      columns: [
        { name: "id", type: "INTEGER", isPrimary: true },
        { name: "createdate", type: "TEXT", isRequired: true },
        { name: "shippingcost", type: "REAL", isRequired: false },
        { name: "customerid", type: "INTEGER", isRequired: true, isForeignKey: true },
        { name: "carrier", type: "TEXT", isRequired: true },
        { name: "trackingid", type: "TEXT", isRequired: true }
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Database Schema</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {Object.entries(schema).map(([tableName, table]) => (
            <div key={tableName} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">
                {tableName}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Column</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Constraints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((column) => (
                      <tr key={column.name} className="border-b">
                        <td className="py-2 font-medium">{column.name}</td>
                        <td className="py-2 text-gray-600">{column.type}</td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            {column.isPrimary && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                PRIMARY KEY
                              </span>
                            )}
                            {column.isRequired && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                NOT NULL
                              </span>
                            )}
                            {column.isForeignKey && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                FOREIGN KEY
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Sample Queries</h4>
          <div className="space-y-2 text-sm">
            <div className="bg-white p-2 rounded font-mono">
              SELECT * FROM customer LIMIT 5;
            </div>
            <div className="bg-white p-2 rounded font-mono">
              SELECT c.name, COUNT(o.id) as order_count FROM customer c LEFT JOIN "order" o ON c.id = o.customerid GROUP BY c.id;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
