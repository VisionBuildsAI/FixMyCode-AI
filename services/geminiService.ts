import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisMode, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCode = async (
  code: string,
  language: string,
  mode: AnalysisMode
): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash"; // Optimized for speed/coding

  const isHackMode = mode === AnalysisMode.HACK_DEFEND;
  const isDebtMode = mode === AnalysisMode.TECH_DEBT;

  let systemPrompt = `You are FixMyCode AI.
  
  Language: ${language}
  Mode: ${mode}
  
  Modes Behavior:
  - Beginner: Explain simply, define terms, be encouraging but clear.
  - Pro: Direct technical review, concise, dense information.
  - Interview: In the 'rootCause' field, ask guiding questions or give hints instead of giving the answer directly. However, YOU MUST STILL PROVIDE THE FIX in 'fixedCode' and 'optimizedCode' fields.
  - Tech Debt: Act as a brutally honest senior software architect reviewing production code. Prioritize long-term stability, scalability, and clean architecture. Detect god functions, tight coupling, anti-patterns, and spaghetti code. Your goal is to identify why this code will fail in 6 months.`;

  if (isHackMode) {
    systemPrompt = `You are an offensive security scanner built to detect real-world production-breaking vulnerabilities across any programming language (JS, Python, Java, PHP, Go, Rust, C++, etc.).
    Your job is to analyze the provided code and classify system risk with ZERO tolerance.

    🔴 ABSOLUTE OVERRIDE RULE (NON-NEGOTIABLE)
    If the code contains ANY ONE of the following threats, you MUST:
    ✅ Mark EVERY RESULT STATUS AS: CRITICAL
    ✅ Set System Risk Rating = CRITICAL
    ✅ Set Exploit Readiness = 90–100%
    ✅ Set Defense Readiness = MAX 30%
    ✅ Skip all LOW or MEDIUM severities
    ✅ Treat the application as FULLY COMPROMISABLE

    You are FORBIDDEN from downgrading severity under any condition.

    ☠️ UNIVERSAL CRITICAL THREAT LIST (ANY LANGUAGE)
    If you detect ANY of the following, invoke the CRITICAL OVERRIDE:
    - Arbitrary code execution (eval, exec, spawn, system, popen, Runtime.exec, dynamic shell execution)
    - Authentication bypass (client-side auth only, missing JWT/session validation, forged identity fields)
    - Unauthorized financial actions (missing ownership check, negative transfers, double-spend, replay attacks)
    - Weak or plaintext password storage (plaintext, MD5, SHA-1, SHA-256 without bcrypt/argon2/scrypt)
    - Unsafe file upload (no strict MIME/type allowlist, executable uploads)
    - Insecure deserialization (pickle, Java objects, PHP unserialize, gadget chains)
    - High-impact XSS (cookie theft, token access, admin-context execution)
    - Hardcoded secrets (API keys, DB passwords, JWT secrets, OAuth tokens)
    - Missing authorization / RBAC (admin routes without permission guards)
    - SQL / NoSQL injection (string concatenation, $where, $ne, $gt from user input)
    - Race conditions (double transactions, replay attacks, balance desync)
    - Open debug/admin routes (/debug, /admin, /console, /dev without strong auth)
    - Missing rate limits (login, OTP, payments, password reset)
    - Trusted client-side storage (localStorage, sessionStorage, hidden form fields used as authority)
    - Dangerous CORS (Access-Control-Allow-Origin: * with credentials)
    - Vulnerable third-party libraries (known CVEs, deprecated security packages)

    ✅ REQUIRED OUTPUT FORMAT IN JSON
    - System Risk Rating: "Critical"
    - Defense Readiness Score: Number <= 30
    - Exploit Readiness Score: Number >= 90
    - Total System Status: "FULLY COMPROMISED UNTIL FIXED" (if critical threats exist)
    - Immediate Impact Summary: Description of what attackers can achieve right now.
    
    You must also provide:
    - residualRiskSummary: Summary of remaining risks after applying fixes.
    - attackSurfaceSummary: Summary of the weakest layer.
    
    In the 'vulnerabilities' array, ensure 'severity' is set to 'Critical' for these threats.
    
    🚫 FORBIDDEN BEHAVIOR
    - You are NOT allowed to: Say “Low”, “Medium”, or “Partially Safe” if threats exist.
    - Say “Depends on configuration”.
    - Say “Best practice”.
    - Assume “trusted users”.
    - Assume “frontend will validate”.
    - Only hard security reality is allowed.
    
    For the 'patchExplanation' field of each vulnerability, you MUST provide:
    1. Original Vulnerability Name
    2. Why It Was Dangerous
    3. Exact Code-Level Fix Logic
    4. Why This Fix Is Now Exploit-Resistant
    5. Updated Severity (Justify any downgrade)
    
    You must output accurate Offline/Online exploitability flags for every vulnerability.`;
  }

  // Base properties for standard analysis
  const baseProperties: any = {
    bugs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER, description: "Line number of the bug" },
          description: { type: Type.STRING, description: "Short description of the bug" },
          severity: { type: Type.STRING, enum: ["Critical", "Warning", "Info"] },
        },
        required: ["line", "description", "severity"],
      },
    },
    rootCause: { type: Type.STRING, description: "Detailed explanation of why the bugs happen." },
    fixedCode: { type: Type.STRING, description: "The code with bugs fixed." },
    optimizedCode: { type: Type.STRING, description: "A cleaner, performance-optimized version of the code." },
    performanceSummary: { type: Type.STRING, description: "Summary of performance improvements." },
    securityWarnings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          vulnerability: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          fix: { type: Type.STRING, description: "How to fix the security issue" },
        },
        required: ["vulnerability", "severity", "fix"],
      },
    },
    complexity: {
      type: Type.OBJECT,
      properties: {
        time: { type: Type.STRING, description: "Time complexity (Big O)" },
        space: { type: Type.STRING, description: "Space complexity (Big O)" },
        explanation: { type: Type.STRING, description: "Brief explanation of complexity" },
      },
      required: ["time", "space", "explanation"],
    },
    refactoringSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  };

  const requiredProps = [
    "bugs",
    "rootCause",
    "fixedCode",
    "optimizedCode",
    "performanceSummary",
    "securityWarnings",
    "complexity",
    "refactoringSuggestions",
  ];

  if (isHackMode) {
    baseProperties.hackAnalysis = {
      type: Type.OBJECT,
      description: "Detailed ethical hacking analysis and defense strategy",
      properties: {
        vulnerabilities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Vulnerability Title" },
              line: { type: Type.INTEGER },
              exploitSteps: { type: Type.STRING, description: "Real-world attack flow (2-5 steps)" },
              impact: { type: Type.STRING, description: "Actual gain for attacker/loss for user" },
              payload: { type: Type.STRING },
              patchExplanation: { type: Type.STRING, description: "MANDATORY: 1. Original Name, 2. Why Dangerous, 3. Exact Fix, 4. Why Resistant, 5. Updated Severity" },
              defenseStrategy: { type: Type.STRING, description: "Long-term defense strategy" },
              severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
              isOfflineExploitable: { type: Type.BOOLEAN, description: "Can this happen without internet?" },
              isOnlineExploitable: { type: Type.BOOLEAN, description: "Can this happen over network/web?" },
            },
            required: ["name", "line", "exploitSteps", "impact", "payload", "patchExplanation", "defenseStrategy", "severity", "isOfflineExploitable", "isOnlineExploitable"],
          },
        },
        secureCode: { type: Type.STRING },
        securityScore: { type: Type.INTEGER },
        safetyChecklist: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["Secure", "Vulnerable", "Patched"] },
            },
            required: ["item", "status"],
          },
        },
        systemRiskRating: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"], description: "Overall system risk rating. Must be CRITICAL if ANY Universal Critical Threat exists." },
        totalSystemStatus: { type: Type.STRING, description: "Example: FULLY COMPROMISED UNTIL FIXED" },
        immediateImpactSummary: { type: Type.STRING, description: "What attackers can achieve right now" },
        attackSurfaceSummary: { type: Type.STRING, description: "Summary of the weakest layer (e.g., API, Auth, DB)" },
        residualRiskSummary: { type: Type.STRING, description: "Summary of remaining risks after applying fixes." },
        exploitReadinessScore: { type: Type.INTEGER, description: "0-100 score: How easy is it to attack? >=90 if critical" },
        defenseReadinessScore: { type: Type.INTEGER, description: "0-100 score: How strong are current protections? <=30 if critical" },
      },
      required: ["vulnerabilities", "secureCode", "securityScore", "safetyChecklist", "systemRiskRating", "totalSystemStatus", "immediateImpactSummary", "attackSurfaceSummary", "residualRiskSummary", "exploitReadinessScore", "defenseReadinessScore"],
    };
    requiredProps.push("hackAnalysis");
  }

  if (isDebtMode) {
    baseProperties.techDebtAnalysis = {
      type: Type.OBJECT,
      description: "Architectural analysis and tech debt scoring",
      properties: {
        scores: {
          type: Type.OBJECT,
          properties: {
            maintainability: { type: Type.INTEGER, description: "0-100 score" },
            readability: { type: Type.INTEGER, description: "0-100 score" },
            scalability: { type: Type.INTEGER, description: "0-100 score" },
            testability: { type: Type.INTEGER, description: "0-100 score" },
            reliability: { type: Type.INTEGER, description: "0-100 score" },
            overall: { type: Type.INTEGER, description: "Weighted average 0-100" },
          },
          required: ["maintainability", "readability", "scalability", "testability", "reliability", "overall"],
        },
        issues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "e.g., Coupling, Modularity, Naming" },
              line: { type: Type.INTEGER },
              issue: { type: Type.STRING },
              impact: { type: Type.STRING, description: "Future problem caused by this" },
              remediation: { type: Type.STRING, description: "Best practice fix" },
              severity: { type: Type.STRING, enum: ["Critical", "High", "Medium"] },
            },
            required: ["category", "line", "issue", "impact", "remediation", "severity"],
          },
        },
        refactoredCode: { type: Type.STRING, description: "Code refactored for clean architecture" },
        refactorExplanation: { type: Type.STRING, description: "Summary of architectural changes made" },
        risks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              prediction: { type: Type.STRING, description: "What will break first" },
              likelihood: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              timeframe: { type: Type.STRING, description: "When it will break (e.g., '6 months', 'High Load')" },
            },
            required: ["prediction", "likelihood", "timeframe"],
          },
        },
        engineeringChecklist: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["Optimized", "Debt"] },
            },
            required: ["item", "status"],
          },
        },
      },
      required: ["scores", "issues", "refactoredCode", "refactorExplanation", "risks", "engineeringChecklist"],
    };
    requiredProps.push("techDebtAnalysis");
  }

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: baseProperties,
    required: requiredProps,
  };

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Analyze the following code:\n\n${code}`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as AnalysisResult;
  }
  
  throw new Error("No response from AI");
};
