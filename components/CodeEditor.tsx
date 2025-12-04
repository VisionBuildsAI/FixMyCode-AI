import React, { useState, useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  highlightLines?: number[];
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  readOnly = false, 
  highlightLines = [],
  placeholder
}) => {
  const [lines, setLines] = useState<number>(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLines(value.split('\n').length);
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    // Sync scroll if we had a separate line number div, but here we use absolute positioning
    // so we might not strictly need it if the layout is correct.
    // However, usually line numbers are in a separate container.
  };

  const lineNumbers = Array.from({ length: Math.max(lines, 10) }, (_, i) => i + 1);

  return (
    <div className="relative w-full h-full flex flex-row overflow-hidden bg-[#0f172a] border border-gray-700 rounded-lg group focus-within:border-blue-500 transition-colors">
      {/* Line Numbers */}
      <div className="flex-none w-12 py-4 text-right pr-3 bg-[#1e293b] text-gray-500 select-none font-mono text-sm leading-6 border-r border-gray-700">
        {lineNumbers.map((num) => (
          <div 
            key={num} 
            className={`${highlightLines.includes(num) ? 'text-red-400 font-bold' : ''}`}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          placeholder={placeholder || "// Paste your code here..."}
          className={`w-full h-full bg-[#0f172a] text-gray-200 font-mono text-sm leading-6 p-4 outline-none resize-none ${readOnly ? 'opacity-90' : ''}`}
        />
        
        {/* Simple highlight overlay for "Real-time error underline" could go here if we parsed AST, 
            but for now we rely on the line number highlighting which is cleaner/faster. */}
      </div>
    </div>
  );
};

export default CodeEditor;
