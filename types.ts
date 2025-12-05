export enum AnalysisMode {
  BEGINNER = 'Beginner',
  PRO = 'Pro',
  INTERVIEW = 'Interview',
  HACK_DEFEND = 'Hack & Defend',
  TECH_DEBT = 'Tech Debt',
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
  isOfflineExploitable: boolean;
  isOnlineExploitable: boolean;
}

export interface SafetyChecklistItem {
  item: string;
  status: 'Secure' | 'Vulnerable' | 'Patched' | 'Optimized' | 'Debt';
}

export interface HackAnalysis {
  vulnerabilities: HackVulnerability[];
  secureCode: string;
  securityScore: number;
  safetyChecklist: SafetyChecklistItem[];
  systemRiskRating: 'High' | 'Medium' | 'Low';
  attackSurfaceSummary: string;
  exploitReadinessScore: number;
  defenseReadinessScore: number;
}

export interface TechDebtScore {
  maintainability: number;
  readability: number;
  scalability: number;
  testability: number;
  reliability: number;
  overall: number;
}

export interface DebtIssue {
  category: string;
  line: number;
  issue: string;
  impact: string;
  remediation: string;
  severity: 'Critical' | 'High' | 'Medium';
}

export interface FutureRisk {
  prediction: string;
  likelihood: 'High' | 'Medium' | 'Low';
  timeframe: string;
}

export interface TechDebtAnalysis {
  scores: TechDebtScore;
  issues: DebtIssue[];
  refactoredCode: string;
  risks: FutureRisk[];
  refactorExplanation: string;
  engineeringChecklist: SafetyChecklistItem[];
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
  techDebtAnalysis?: TechDebtAnalysis;
}

export type Tab = 'bugs' | 'fixed' | 'optimized' | 'security' | 'complexity' | 
                  'hack_simulation' | 'attack_impact' | 'protection_patch' | 'secure_code' | 'safety_checklist' |
                  'debt_scores' | 'debt_sources' | 'refactored_code' | 'future_risk' | 'engineering_checklist';
