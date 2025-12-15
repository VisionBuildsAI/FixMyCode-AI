import { SupportedLanguage } from './types';

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

export const detectLanguage = (code: string): { language: SupportedLanguage; confidence: number } => {
  if (!code || code.trim().length < 10) return { language: SupportedLanguage.JAVASCRIPT, confidence: 0 };

  const patterns: Record<SupportedLanguage, RegExp[]> = {
    [SupportedLanguage.PYTHON]: [
      /def\s+/, /import\s+/, /print\(/, /if\s+.*:/, /elif\s+/, /else:/, 
      /self\./, /class\s+.*:/, /from\s+.*import/, /__init__/, /pass/
    ],
    [SupportedLanguage.JAVASCRIPT]: [
      /const\s+/, /let\s+/, /var\s+/, /function\s+/, /console\.log/, /=>/, 
      /import\s+.*from/, /export\s+/, /document\./, /window\./, /===/, /!==/
    ],
    [SupportedLanguage.TYPESCRIPT]: [
      /interface\s+/, /type\s+/, /:\s*string/, /:\s*number/, /:\s*boolean/, 
      /:\s*any/, /:\s*void/, /public\s+/, /private\s+/, /readonly\s+/, /<.*>/, /as\s+/
    ],
    [SupportedLanguage.JAVA]: [
      /public\s+class/, /public\s+static\s+void\s+main/, /System\.out\.println/, 
      /import\s+java\./, /@Override/, /private\s+/, /protected\s+/, /new\s+ArrayList/, /String\s+args\[\]/
    ],
    [SupportedLanguage.CPP]: [
      /#include\s+<.*>/, /std::/, /cout\s+<</, /cin\s+>>/, /using\s+namespace/, 
      /int\s+main\s*\(/, /#define/, /nullptr/, /::/
    ],
    [SupportedLanguage.CSHARP]: [
      /using\s+System/, /namespace\s+/, /Console\.WriteLine/, /public\s+class/, 
      /\[.*\]/, /async\s+Task/, /var\s+.*=/, /List<.*>/
    ],
    [SupportedLanguage.GO]: [
      /package\s+main/, /import\s+\(/, /func\s+/, /fmt\.P/, /:=\s*/, 
      /go\s+func/, /struct\s+{/, /map\[.*\]/
    ],
    [SupportedLanguage.PHP]: [
      /<\?php/, /\$\w+/, /echo\s+/, /public\s+function/, /->/, 
      /array\(/, /namespace\s+/, /use\s+/, /require_once/
    ],
    [SupportedLanguage.SQL]: [
      /SELECT\s+/i, /FROM\s+/i, /WHERE\s+/i, /INSERT\s+INTO/i, /UPDATE\s+/i, 
      /DELETE\s+FROM/i, /CREATE\s+TABLE/i, /PRIMARY\s+KEY/i, /JOIN\s+/i, /VALUES/i
    ],
  };

  const scores: Partial<Record<SupportedLanguage, number>> = {};
  
  // Initialize scores
  Object.values(SupportedLanguage).forEach(l => scores[l] = 0);

  let maxScore = 0;
  let detected = SupportedLanguage.JAVASCRIPT;

  Object.entries(patterns).forEach(([lang, regexes]) => {
    regexes.forEach(regex => {
      if (regex.test(code)) {
        scores[lang as SupportedLanguage] = (scores[lang as SupportedLanguage] || 0) + 1;
      }
    });
  });

  // Boost TS if JS score is high (TS is superset)
  if ((scores[SupportedLanguage.TYPESCRIPT] || 0) > 0) {
      scores[SupportedLanguage.TYPESCRIPT] = (scores[SupportedLanguage.TYPESCRIPT] || 0) + ((scores[SupportedLanguage.JAVASCRIPT] || 0) * 0.5);
  }

  // Determine best match
  let totalScore = 0;
  Object.entries(scores).forEach(([lang, score]) => {
      totalScore += score;
      if (score > maxScore) {
          maxScore = score;
          detected = lang as SupportedLanguage;
      }
  });

  // Calculate confidence percentage based on signal strength relative to total signals
  // or raw signal count if low total
  const confidence = totalScore === 0 ? 0 : Math.round((maxScore / totalScore) * 100);

  return { language: detected, confidence: maxScore > 0 ? confidence : 0 };
};
