// A simple line-by-line diff utility
export interface DiffLine {
  type: 'same' | 'added' | 'removed';
  content: string;
  originalLineNumber?: number;
  newLineNumber?: number;
}

export const generateDiff = (original: string, modified: string): DiffLine[] => {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  // This is a naive diff for display purposes. 
  // For production, a robust algorithm like Myers would be better, 
  // but this suffices for "Before vs After" visual alignment in a simple web app.
  
  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < originalLines.length || j < modifiedLines.length) {
    const orig = originalLines[i];
    const mod = modifiedLines[j];

    if (orig === mod) {
      diff.push({ type: 'same', content: orig || '', originalLineNumber: i + 1, newLineNumber: j + 1 });
      i++;
      j++;
    } else {
      // Look ahead to find a match
      let foundMatch = false;
      
      // Look ahead in modified
      for (let k = 1; k < 5; k++) {
        if (j + k < modifiedLines.length && modifiedLines[j + k] === orig) {
            // Found a match later in modified, so lines were added
            for (let x = 0; x < k; x++) {
                diff.push({ type: 'added', content: modifiedLines[j + x], newLineNumber: j + x + 1 });
            }
            j += k;
            foundMatch = true;
            break;
        }
      }

      if (!foundMatch) {
         // Look ahead in original
         for (let k = 1; k < 5; k++) {
             if (i + k < originalLines.length && originalLines[i + k] === mod) {
                 // Found a match later in original, so lines were removed
                 for (let x = 0; x < k; x++) {
                     diff.push({ type: 'removed', content: originalLines[i + x], originalLineNumber: i + x + 1 });
                 }
                 i += k;
                 foundMatch = true;
                 break;
             }
         }
      }

      if (!foundMatch) {
        // Assume substitution if no match found nearby
        if (i < originalLines.length) {
            diff.push({ type: 'removed', content: originalLines[i], originalLineNumber: i + 1 });
            i++;
        }
        if (j < modifiedLines.length) {
            diff.push({ type: 'added', content: modifiedLines[j], newLineNumber: j + 1 });
            j++;
        }
      }
    }
  }

  return diff;
};
