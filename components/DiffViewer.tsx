import React, { useMemo } from 'react';
import { generateDiff, DiffLine } from '../utils';

interface DiffViewerProps {
  original: string;
  modified: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified }) => {
  const diffLines = useMemo(() => generateDiff(original, modified), [original, modified]);

  return (
    <div className="w-full h-full overflow-auto bg-[#0d1117] font-mono text-sm">
      <table className="w-full border-collapse">
        <tbody>
          {diffLines.map((line, idx) => {
            let bgClass = '';
            let textClass = 'text-gray-300';
            let sign = ' ';

            if (line.type === 'added') {
              bgClass = 'bg-green-900/30';
              textClass = 'text-green-300';
              sign = '+';
            } else if (line.type === 'removed') {
              bgClass = 'bg-red-900/30';
              textClass = 'text-red-300';
              sign = '-';
            }

            return (
              <tr key={idx} className={`${bgClass} hover:bg-opacity-40`}>
                {/* Line Numbers */}
                <td className="w-10 px-2 py-0.5 text-right text-gray-600 border-r border-gray-800 select-none bg-[#0d1117]">
                  {line.originalLineNumber || ''}
                </td>
                <td className="w-10 px-2 py-0.5 text-right text-gray-600 border-r border-gray-800 select-none bg-[#0d1117]">
                  {line.newLineNumber || ''}
                </td>
                
                {/* Content */}
                <td className={`px-4 py-0.5 whitespace-pre-wrap break-all ${textClass}`}>
                  <span className="select-none inline-block w-4 opacity-50">{sign}</span>
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
