import React, { useState, useEffect, useRef } from 'react';
import { AnalysisMode } from '../types';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  highlightLines?: number[];
  placeholder?: string;
  mode?: AnalysisMode;
  isAnalyzing?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  readOnly = false, 
  highlightLines = [],
  placeholder,
  mode = AnalysisMode.PRO,
  isAnalyzing = false
}) => {
  const [lines, setLines] = useState<number>(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLines(value.split('\n').length);
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    // Scroll sync logic would go here if needed for line numbers
  };

  const lineNumbers = Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1);

  // Determine glow color based on mode
  let glowColorClass = 'group-focus-within:border-neon-cyan/50 group-focus-within:shadow-[0_0_20px_rgba(6,182,212,0.1)]';
  if (mode === AnalysisMode.HACK_DEFEND) {
    glowColorClass = 'group-focus-within:border-neon-red/50 group-focus-within:shadow-[0_0_20px_rgba(244,63,94,0.1)]';
  } else if (mode === AnalysisMode.TECH_DEBT) {
    glowColorClass = 'group-focus-within:border-neon-purple/50 group-focus-within:shadow-[0_0_20px_rgba(139,92,246,0.1)]';
  }

  return (
    <div className={`
      relative w-full h-full flex flex-row overflow-hidden rounded-xl border transition-all duration-300 group
      bg-surface/50 backdrop-blur-sm
      border-white/5
      ${glowColorClass}
    `}>
      {/* Security Laser Scanner */}
      {isAnalyzing && mode === AnalysisMode.HACK_DEFEND && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="w-full h-[2px] bg-neon-red shadow-[0_0_15px_#f43f5e] absolute animate-scan opacity-80"></div>
        </div>
      )}

      {/* Tech Debt Scanner */}
      {isAnalyzing && mode === AnalysisMode.TECH_DEBT && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden bg-neon-purple/5 animate-pulse"></div>
      )}

      {/* Line Numbers */}
      <div className="flex-none w-14 py-6 text-right pr-4 bg-black/20 text-slate-600 select-none font-mono text-xs leading-6 border-r border-white/5">
        {lineNumbers.map((num) => (
          <div 
            key={num} 
            className={`transition-colors duration-300 ${
              highlightLines.includes(num) 
                ? mode === AnalysisMode.HACK_DEFEND 
                    ? 'text-neon-red font-bold drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]' 
                    : 'text-neon-cyan font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]'
                : 'opacity-50'
            }`}
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
          placeholder={placeholder || "// Paste your crime scene here..."}
          className={`
            w-full h-full bg-transparent text-slate-300 font-mono text-xs md:text-sm leading-6 p-6 outline-none resize-none 
            placeholder:text-slate-700
            ${readOnly ? 'opacity-90 cursor-default' : 'cursor-text'}
          `}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
