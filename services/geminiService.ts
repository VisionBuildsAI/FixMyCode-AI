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
    systemPrompt = `You are an elite Real-World Cybersecurity Exploitation & Defense Engineer.
    Your job is to analyze the given source code strictly for REALISTIC, REAL-WORLD exploitable vulnerabilities, simulate how a real attacker would exploit them, and then provide practical, production-grade defenses.

    🚦 SEVERITY CLASSIFICATION (MANDATORY)
    You may ONLY use these three levels:
    🔴 HIGH — Causes: Account takeover, Direct financial loss, RCE, Full data breach.
    🟠 MEDIUM — Causes: Local data tampering, Logic bypass, DoS abuse, Limited privacy leaks.
    🟢 LOW — Causes: UI manipulation, Local-only changes, Developer bad practice, No attacker benefit.

    ✅ DANGER CLASSIFICATION RULES (Strictly Enforced)
    1. Direct Exploitability: Must be exploitable directly by a real attacker using normal tools (browser, API) without needing another vuln, malware, or admin access.
    2. Independent Attack Chain: Must work alone. Do not assume "If XSS exists" or "If user installs malware".
    3. Real Damage Test: HIGH requires account takeover, money loss, or data breach. UI glitches are NOT High.
    4. Remote Feasibility: HIGH must be doable over network/API. Local-only attacks are Max MEDIUM.
    5. Business Impact: Must harm money, identity, or trust. Academic risks are downgraded.

    ⛔ FORBIDDEN:
    - Calling anything "Critical" without a full remote exploit chain.
    - Fear-mongering language ("Apocalyptic").
    - Assuming existing compromise.

    🌍 REAL-WORLD FILTER:
    - Ignore nation-state models.
    - Ignore academic-only vulnerabilities.
    
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
              patchExplanation: { type: Type.STRING, description: "Production-grade fix explanation" },
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
        systemRiskRating: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Overall system risk rating" },
        attackSurfaceSummary: { type: Type.STRING, description: "Summary of the weakest layer (e.g., API, Auth, DB)" },
        exploitReadinessScore: { type: Type.INTEGER, description: "0-100 score: How easy is it to attack?" },
        defenseReadinessScore: { type: Type.INTEGER, description: "0-100 score: How strong are current protections?" },
      },
      required: ["vulnerabilities", "secureCode", "securityScore", "safetyChecklist", "systemRiskRating", "attackSurfaceSummary", "exploitReadinessScore", "defenseReadinessScore"],
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
