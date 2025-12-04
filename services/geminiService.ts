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

  let systemPrompt = `You are FixMyCode AI, a world-class senior software engineer, security analyst, and performance optimizer. 
  Your goal is to be fast, brutally honest, and developer-first. Zero fluff.
  
  Language: ${language}
  Mode: ${mode}
  
  Modes Behavior:
  - Beginner: Explain simply, define terms, be encouraging but clear.
  - Pro: Direct technical review, concise, dense information.
  - Interview: In the 'rootCause' field, ask guiding questions or give hints instead of giving the answer directly. However, YOU MUST STILL PROVIDE THE FIX in 'fixedCode' and 'optimizedCode' fields.
  - Hack & Defend: Act as a certified ethical hacker and senior app security engineer. Focus entirely on security exploitation and defense. Identify ALL attack vectors (SQLi, XSS, etc.), simulate exploits, and provide robust defense strategies.`;

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

  // Add Hack & Defend specific schema if mode matches
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
              name: { type: Type.STRING, description: "Name of the attack vector" },
              line: { type: Type.INTEGER, description: "Line number where vulnerability exists" },
              exploitSteps: { type: Type.STRING, description: "Step-by-step guide on how a hacker would exploit this" },
              impact: { type: Type.STRING, description: "Potential damage (data leak, takeover, etc.)" },
              payload: { type: Type.STRING, description: "Realistic example payload used in attack" },
              patchExplanation: { type: Type.STRING, description: "Explanation of the secure patch" },
              defenseStrategy: { type: Type.STRING, description: "Long-term defense strategy" },
              severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
            },
            required: ["name", "line", "exploitSteps", "impact", "payload", "patchExplanation", "defenseStrategy", "severity"],
          },
        },
        secureCode: { type: Type.STRING, description: "Fully secured version of the code with all protections applied" },
        securityScore: { type: Type.INTEGER, description: "Security score from 0 to 100 after patching" },
        safetyChecklist: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING, description: "Security checklist item (e.g., 'Input Sanitization')" },
              status: { type: Type.STRING, enum: ["Secure", "Vulnerable", "Patched"] },
            },
            required: ["item", "status"],
          },
        },
      },
      required: ["vulnerabilities", "secureCode", "securityScore", "safetyChecklist"],
    };
    requiredProps.push("hackAnalysis");
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
