import React from 'react';

export default function Editor({ value, onChange, placeholder, readOnly = false, title }) {
  // Simple line numbers
  const lines = value ? value.split('\n').length : 1;
  const lineNumbers = Array.from({ length: Math.max(10, lines) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      {title && (
        <div className="bg-surfaceHover/50 border-b border-border px-4 py-2 flex items-center justify-between">
          <h3 className="font-medium text-sm text-textMain">{title}</h3>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden relative group">
        <div className="w-10 bg-surface/50 border-r border-border flex flex-col items-end py-4 px-2 select-none overflow-hidden font-mono text-xs text-textMuted/50">
          {lineNumbers.map(n => (
            <div key={n} className="h-5 leading-5">{n}</div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className={`flex-1 bg-transparent p-4 font-mono text-sm leading-5 resize-none outline-none focus:ring-0 ${
            readOnly ? 'text-textMuted cursor-default' : 'text-textMain'
          }`}
          style={{ whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'auto' }}
        />
      </div>
    </div>
  );
}
