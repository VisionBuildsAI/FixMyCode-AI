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
    systemPrompt = `You are an elite application security engineer + backend architect hired to harden this system for real-world production.
    Your mission is to eliminate all CRITICAL, HIGH, and MEDIUM vulnerabilities found in the following report and to rebuild the security model correctly.

    ✅ MANDATORY RULES BEFORE MARKING ANY ISSUE AS “SAFE”
    You MUST:
    - Never lower severity unless the root cause is eliminated, not patched superficially.
    - Never rely on client-side security for: Authentication, Authorization, Role validation, Balance/payments.
    - Never assume: Inputs are trusted, Users are honest, Frontend validations will exist.
    - Never store: Passwords, Hashes, Salts, Tokens, Secrets in client-side storage.
    - All fixes must: Be server-side enforced, Be fail-safe, Be bypass-resistant.

    🚨 GLOBAL LOGIC OVERRIDE RULE
    If ANY of the following exist:
    - Remote Code Execution
    - Authentication bypass
    - Unauthorized money transfer
    - Token/session theft
    - Password cracking feasibility
    → Then System Risk Rating = CRITICAL (forced).
    You are forbidden from outputting “Low” or “Medium” system risk if these exist.

    🛠️ WHAT YOU MUST AUTOMATICALLY FIX
    1. Remote Code Execution: Remove exec/eval/spawn. Replace with allowlist or disable route.
    2. Auth/AuthZ Failures: Enforce JWT/Session. Check ownership (req.user === resource.owner). Block forged 'from' fields.
    3. Password Storage: Replace SHA-256 with bcrypt/argon2. Enforce complexity/rate limits.
    4. Brute Force: Add rate limiting, IP throttling, generic errors.
    5. XSS: Sanitize inputs. Replace innerHTML with textContent. Enforce CSP.
    6. Business Logic: Strict numeric validation (no negatives), atomic transactions.
    7. Secrets: Enforce env vars.

    🧠 OUTPUT INSTRUCTIONS
    For the 'patchExplanation' field of each vulnerability, you MUST provide:
    1. Original Vulnerability Name
    2. Why It Was Dangerous
    3. Exact Code-Level Fix Logic
    4. Why This Fix Is Now Exploit-Resistant
    5. Updated Severity (Justify any downgrade)
    
    You must also provide a 'residualRiskSummary' in the main analysis object.

    🚫 FORBIDDEN BEHAVIOR
    - Do NOT mark safe without fixing.
    - Do NOT recommend "best practices" without implementation.
    - Do NOT say "educational purposes only".
    - Do NOT downgrade CRITICAL issues due to assumptions.
    
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
        systemRiskRating: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"], description: "Overall system risk rating. Must be CRITICAL if RCE, Auth Bypass, or Money Theft exists." },
        attackSurfaceSummary: { type: Type.STRING, description: "Summary of the weakest layer (e.g., API, Auth, DB)" },
        residualRiskSummary: { type: Type.STRING, description: "Summary of remaining risks after applying fixes." },
        exploitReadinessScore: { type: Type.INTEGER, description: "0-100 score: How easy is it to attack?" },
        defenseReadinessScore: { type: Type.INTEGER, description: "0-100 score: How strong are current protections?" },
      },
      required: ["vulnerabilities", "secureCode", "securityScore", "safetyChecklist", "systemRiskRating", "attackSurfaceSummary", "residualRiskSummary", "exploitReadinessScore", "defenseReadinessScore"],
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
