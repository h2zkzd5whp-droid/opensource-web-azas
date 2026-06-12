const { Type } = require('@google/genai');
const fs = require('fs');
const path = require('path');

//txt파일 로딩
let evaluationManual = "";
try {
  const manualPath = path.join(__dirname, '../controllers/manual.txt'); // 프로젝트 구조에 맞게 경로 지정
  evaluationManual = fs.readFileSync(manualPath, 'utf8');
} catch (err) {
  console.warn("[WARNING] 정밀 진단 매뉴얼 파일을 로드할 수 없어 인라인 압축 텍스트를 사용합니다.", err);
  evaluationManual = "Use standard engineering rubric for Readability, Performance, Maintainability, and Safety.";
}

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

  // 2. 코드 스타일 리뷰 프롬프트(매뉴얼)
  reviewer: {
    systemInstruction: 
      "You are an elite automated code auditor operating at the highest levels of professional software engineering corporate standards.\n\n" +
      
      "[SYSTEM ARCHITECTURE OVERVIEW]\n" +
      "Your sole mission is to audit the provided code across 4 core engineering axes: Readability(가독성), Performance(성능효율성), Maintainability(유지보수), and Safety(예외안정).\n" +
      "You must parse the issues and classify them strictly into the designated response schema structure.\n\n" +

      "[DETAILED CODE AUDIT REFERENCE MANUAL]\n" +
      "You must evaluate the input code against the following master rubric criteria. Do not deviate, compromise, or introduce arbitrary rules:\n\n" +
      evaluationManual + // 👈 파일에서 읽어온 방대한 정밀 매뉴얼 매끄럽게 결합
      "\n\n" +

      "[CRITICAL INSTRUCTION: DETERMINISTIC SCORING RULES]\n" +
      "- Every single metric (readability, performance, maintainability, safety) begins with a perfect baseline score of exactly 100.\n" +
      "- For each 'warning' item found in a specific sector array, deduct exactly 15 points from that sector's starting score.\n" +
      "- For each 'info' item found in a specific sector array, deduct exactly 5 points from that sector's starting score.\n" +
      "- Math formula: SectorScore = Max(0, 100 - (Count(warning) * 15) - (Count(info) * 5)).\n" +
      "- If no issues are flagged within a sector according to the manual criteria, that sector's score MUST be exactly 100.\n" +
      "- The root property 'score' MUST be the exact mathematical average (arithmetic mean) of the 4 individual calculated sector scores.\n" +
      "- Any mathematical discrepancy or randomized scoring will violate safety constraints.\n\n" +
      
      "[OUTPUT SPECS]\n" +
      "- Write all feedback 'message' content in Korean clear, constructive sentences.\n" +
      "- Ensure you match the responseSchema structural signature perfectly. Never omit any arrays.",
      
    getPrompt: ({ language, code }) => 
      `Audit the following source code strictly matching the criteria detailed in the [OFFICIAL EVALUATION MANUAL]. Provide deterministic grouping and linear line order sorting.\n\n[Language]: ${language}\n[Source Code]:\n${code}`,
      
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Overall average code quality index (Average of 4 metrics)" },
        readability: { type: Type.INTEGER, description: "Readability metric score based on deductions" },
        performance: { type: Type.INTEGER, description: "Performance efficiency metric score based on deductions" },
        maintainability: { type: Type.INTEGER, description: "Maintainability metric score based on deductions" },
        safety: { type: Type.INTEGER, description: "Exception safety metric score based on deductions" },
        annotations: {
          type: Type.OBJECT,
          description: "Categorized issue arrays",
          properties: {
            readability: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line: { type: Type.INTEGER },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "'warning' or 'info'" }
                },
                required: ["line", "message", "severity"]
              }
            },
            performance: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line: { type: Type.INTEGER },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "'warning' or 'info'" }
                },
                required: ["line", "message", "severity"]
              }
            },
            maintainability: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line: { type: Type.INTEGER },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "'warning' or 'info'" }
                },
                required: ["line", "message", "severity"]
              }
            },
            safety: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line: { type: Type.INTEGER },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "'warning' or 'info'" }
                },
                required: ["line", "message", "severity"]
              }
            }
          },
          required: ["readability", "performance", "maintainability", "safety"]
        }
      },
      required: ["score", "readability", "performance", "maintainability", "safety", "annotations"]
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