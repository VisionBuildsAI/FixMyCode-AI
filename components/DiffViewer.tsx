import React, { useMemo } from 'react';
import { generateDiff, DiffLine } from '../utils';

interface DiffViewerProps {
  original: string;
  modified: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified }) => {
  const diffLines = useMemo(() => generateDiff(original, modified), [original, modified]);

  return (
    <div className="w-full h-full overflow-auto bg-[#050505] font-mono text-xs md:text-sm">
      <table className="w-full border-collapse">
        <tbody>
          {diffLines.map((line, idx) => {
            let bgClass = '';
            let textClass = 'text-slate-400';
            let marker = ' ';

            if (line.type === 'added') {
              bgClass = 'bg-neon-green/10';
              textClass = 'text-neon-green';
              marker = '+';
            } else if (line.type === 'removed') {
              bgClass = 'bg-neon-red/10';
              textClass = 'text-neon-red line-through opacity-70';
              marker = '-';
            }

            return (
              <tr key={idx} className={`${bgClass} transition-colors hover:bg-white/5`}>
                {/* Line Numbers */}
                <td className="w-10 px-2 py-1 text-right text-slate-700 border-r border-white/5 select-none opacity-50">
                  {line.originalLineNumber || ''}
                </td>
                <td className="w-10 px-2 py-1 text-right text-slate-700 border-r border-white/5 select-none opacity-50">
                  {line.newLineNumber || ''}
                </td>
                
                {/* Content */}
                <td className={`px-4 py-1 whitespace-pre-wrap break-all ${textClass}`}>
                  <span className="select-none inline-block w-4 opacity-50 font-bold">{marker}</span>
                  {line.content}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DiffViewer;
