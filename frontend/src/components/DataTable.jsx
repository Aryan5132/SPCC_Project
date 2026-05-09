import React from 'react';

export default function DataTable({ title, columns, data, emptyMessage }) {
  return (
    <div className="glass-card overflow-hidden flex flex-col h-full">
      <div className="bg-surfaceHover/50 border-b border-border px-4 py-2">
        <h3 className="font-medium text-sm text-primary">{title}</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface/50 sticky top-0 backdrop-blur-sm shadow-sm border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 font-medium text-textMuted whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-surfaceHover/30 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 font-mono text-xs text-textMain whitespace-nowrap">
                      {row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-textMuted text-sm">
                  {emptyMessage || "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
