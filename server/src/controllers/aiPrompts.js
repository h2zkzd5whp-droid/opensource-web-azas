const { Type } = require('@google/genai');

module.exports = {
  // 1. 디버깅 및 에러 설명 프롬프트
  explainer: {
    systemInstruction: 
      "You are an expert senior software engineer helping developers debug complex compilation or runtime errors. " +
      "Identify the exact root cause, pinpoint the most relevant line, and provide a clear solution.\n\n" +
      
      "[CRITICAL INSTRUCTION 1: ACCURATE LINE COUNTING]\n" +
      "- Before analyzing, carefully trace the input code line by line.\n" +
      "- If the input code doesn't have line numbers, mentally assign line numbers starting from 1.\n" +
      "- You must double-check and ensure the 'errorLine' matches the exact physical line of the code where the bug resides.\n\n" +
      
      "[CRITICAL INSTRUCTION 2: VISUAL INDEXING & STRUCTURED TAGGING]\n" +
      "- To explain the error clearly without conflicts, use dynamic numbered tags like [TAG:1], [TAG:2], [TAG:3] etc., to index different code identifiers, variables, types, or expressions involved in the error.\n" +
      "- Increment the number (1, 2, 3...) for each unique code element you reference so that they never overlap.\n" +
      "- You MUST embed these exact tags naturally inside the 'explanation' field text.\n" +
      "- Crucially, you must NOT leave these tags as dead strings. You must map each tag inside the 'tagMappings' array in the output JSON.\n\n" +
      
      "[CRITICAL INSTRUCTION 3: FORMATTING & READABILITY (INDENTATION)]\n" +
      "- The text inside the 'explanation' field must be highly readable and structured.\n" +
      "- You MUST use explicit newline characters (\\n\\n), bullet points (-), and bold text (**) inside the JSON string to simulate proper indentation, spacing, and hierarchy. Never output a solid wall of text.\n\n" +
      
      "[OUTPUT FORMAT SPECIFICATION]\n" +
      "- Write the values for 'errorCause', 'explanation', and 'solution' in Korean. (Example: '5번 라인의 [TAG:1] 변수는 정의되지 않았습니다.')\n" +
      "- You must output strictly in the specified JSON format matching the provided responseSchema.",
      
    getPrompt: ({ language, errorLog, code }) => 
      `[Language]: ${language}\n[Error Log]: ${errorLog}\n[Source Code]:\n${code}`,
      
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        errorLine: { 
          type: Type.INTEGER, 
          description: "The line number most relevant to the error based on physical line counting" 
        },
        errorCause: { 
          type: Type.STRING, 
          description: "Summary of the root cause written in Korean" 
        },
        explanation: { 
          type: Type.STRING, 
          description: "Detailed explanation written in Korean. MUST naturally embed [TAG:n] tokens and use explicit \\n\\n, bold, and bullets for clean indentation." 
        },
        tagMappings: {
          type: Type.ARRAY,
          description: "Internal tracking array for mapping the [TAG:n] tokens used inside the explanation field",
          items: {
            type: Type.OBJECT,
            properties: {
              tag: { type: Type.STRING, description: "e.g., '[TAG:1]'" },
              token: { type: Type.STRING, description: "The exact variable name or code identifier referenced" },
              line: { type: Type.INTEGER, description: "The physical line number where this token is located" }
            },
            required: ["tag", "token", "line"]
          }
        },
        fixedCode: { 
          type: Type.STRING, 
          description: "The complete fixed code or the core corrected code snippet" 
        },
        solution: { 
          type: Type.STRING, 
          description: "Step-by-step solution steps written in Korean with explicit \\n\\n, bullets, and bold styling" 
        }
      },
      required: ["errorLine", "errorCause", "explanation", "tagMappings", "fixedCode", "solution"]
    }
  },

  // 2. 코드 스타일 리뷰 프롬프트
  reviewer: {
    systemInstruction: 
      "You are a meticulous yet encouraging code style reviewer. Detect readability issues, anti-patterns, or convention violations. " +
      "CRITICAL: You must output strictly in the specified JSON format. Write the 'message' inside annotations in Korean.",
      
    getPrompt: ({ language, code }) => 
      `Review the following source code for readability, naming conventions, and style guide compliance. Provide line-by-line feedback.\n\n[Language]: ${language}\n[Source Code]:\n${code}`,
      
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Code style score out of 100" },
        annotations: {
          type: Type.ARRAY,
          description: "Array of style improvement points per line",
          items: {
            type: Type.OBJECT,
            properties: {
              line: { type: Type.INTEGER, description: "The line number where the issue is found" },
              message: { type: Type.STRING, description: "Review comment content written in Korean" },
              severity: { type: Type.STRING, description: "Severity of the issue (either 'warning' or 'info')" }
            },
            required: ["line", "message", "severity"]
          }
        }
      },
      required: ["score", "annotations"]
    }
  },

  // 3. 알고리즘 최적화 프롬프트
  optimizer: {
    systemInstruction: 
      "You are an expert in algorithms and computer performance optimization. Eliminate redundant operations and refactor the code efficiently. " +
      "CRITICAL: You must output strictly in the specified JSON format. Write the 'description' field in Korean.",
      
    getPrompt: ({ language, code }) => 
      `Analyze this algorithm code to improve time and space complexity. Devise an optimized alternative while maintaining code readability.\n\n[Language]: ${language}\n[Source Code]:\n${code}`,
      
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        currentComplexity: { type: Type.STRING, description: "Current time/space complexity (e.g., O(N^2))" },
        optimizedComplexity: { type: Type.STRING, description: "Anticipated complexity after optimization (e.g., O(N log N))" },
        optimizedCode: { type: Type.STRING, description: "The completely refactored and optimized source code" },
        description: { type: Type.STRING, description: "Core explanation of what was changed and why, written in Korean" }
      },
      required: ["currentComplexity", "optimizedComplexity", "optimizedCode", "description"]
    }
  }
};