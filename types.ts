export enum AnalysisMode {
  BEGINNER = 'Beginner',
  PRO = 'Pro',
  INTERVIEW = 'Interview',
  HACK_DEFEND = 'Hack & Defend',
}

export enum SupportedLanguage {
  PYTHON = 'Python',
  JAVASCRIPT = 'JavaScript',
  TYPESCRIPT = 'TypeScript',
  JAVA = 'Java',
  CPP = 'C++',
  CSHARP = 'C#',
  GO = 'Go',
  PHP = 'PHP',
  SQL = 'SQL',
}

export interface Bug {
  line: number;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
}

export interface SecurityIssue {
  vulnerability: string;
  severity: 'High' | 'Medium' | 'Low';
  fix: string;
}

export interface ComplexityAnalysis {
  time: string;
  space: string;
  explanation: string;
}

export interface HackVulnerability {
  name: string;
  line: number;
  exploitSteps: string;
  impact: string;
  payload: string;
  patchExplanation: string;
  defenseStrategy: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface SafetyChecklistItem {
  item: string;
  status: 'Secure' | 'Vulnerable' | 'Patched';
}

export interface HackAnalysis {
  vulnerabilities: HackVulnerability[];
  secureCode: string;
  securityScore: number;
  safetyChecklist: SafetyChecklistItem[];
}

export interface AnalysisResult {
  bugs: Bug[];
  rootCause: string;
  fixedCode: string;
  optimizedCode: string;
  performanceSummary: string;
  securityWarnings: SecurityIssue[];
  complexity: ComplexityAnalysis;
  refactoringSuggestions: string[];
  hackAnalysis?: HackAnalysis;
}

export type Tab = 'bugs' | 'fixed' | 'optimized' | 'security' | 'complexity' | 
                  'hack_simulation' | 'attack_impact' | 'protection_patch' | 'secure_code' | 'safety_checklist';
