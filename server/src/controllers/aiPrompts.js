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

// 공백/주석 미스매치를 방지, 코드 라인마다 절대적인 인덱스를 붙여주는 헬퍼 함수
const helpers = {
  formatWithLineNumbers: (code) => {
    if (!code) return "";
    return code
      .split('\n')
      .map((line, index) => `${index + 1}: ${line}`)
      .join('\n');
  }
};

module.exports = {
  // 1. 디버깅 및 에러 종합 정적 진단 프롬프트
  explainer: {
    systemInstruction: 
      "You are an expert static analysis tool and quality assurance engineer specializing strictly in compiler-level syntax and runtime exceptions. " +
      "Scan the entire input source code comprehensively and detect ALL potential bugs, syntax errors, logical exceptions, or unhandled runtime exceptions (such as ZeroDivisionError, IndexError, TypeError, AttributeError, KeyError, and SyntaxError).\n\n" +
      
      "- [SCOPE CRITICAL LIMITATION] You must focus ONLY on runtime exceptions, unhandled crashes, logical bugs, and grammar violations. Do NOT analyze or report stylistic suggestions, code formatting issues, variable casing, or readability enhancements. Code style is completely handled by a separate style tab.\n" +
      "- Crucially, even if the functions are not explicitly invoked or called, you MUST look inside every function definition and block to identify and diagnose all implicit runtime/compilation errors.\n" +
      "- You must output a list of ALL discovered errors inside the 'errors' array matching the provided responseSchema. Do not stop at finding just one error.\n\n" +
      
      "[CRITICAL INSTRUCTION 1: ACCURATE LINE MATCHING]\n" +
      "- The input source code is provided with absolute line numbers at the beginning of each line in 'X: code' format (where X is the line number).\n" +
      "- You MUST use these exact prefix line numbers for 'errorLine', 'tagMappings', and any line mentioned in the 'explanation'.\n\n" +
      
      "[CRITICAL INSTRUCTION 2: STRICT SEQUENTIAL TAGGING PER ERROR]\n" +
      "- Within EACH error item block, you must assign internal token tag numbers sequentially starting from 1 (i.e., [TAG:1], [TAG:2], [TAG:3]...).\n" +
      "- Continuous sequence numbers must be observed strictly without skips. Map them perfectly to the local 'tagMappings' array for that specific error.\n\n" +
      
      "[CRITICAL INSTRUCTION 3: TAG-BY-TAG STRUCTURED EXPANDABLE LAYOUT]\n" +
      "- The 'explanation' field of EACH error item must follow the strict structural Markdown layout separated by explicit double newlines (\\n\\n):\n" +
      "  ###[TAG:1] (Line 라인번호: '토큰명')\n" +
      "  - **원인 및 분석:** 해당 토큰이 가지고 있는 명확한 문제점 분석.\n" +
      "  - **연관 관계:** (해당 시) 타 태그와의 논리적 연계 설명.\n\n" +
      
      "[OUTPUT FORMAT SPECIFICATION]\n" +
      "- Write the values for 'errorCause', 'explanation', and 'solution' in Korean.\n" +
      "- Crucially, inside the 'explanation' and text blocks, refer to each tag identifier as 'tag 1', 'tag 2' instead of '태그 1', '태그 2'.\n" +
      "- You must output strictly in the specified JSON format matching the provided responseSchema.",
      
    getPrompt: ({ language, errorLog, code }) => 
      `[Language]: ${language}\n[Initial Error Log (if any)]: ${errorLog}\n[Source Code (Absolute Line Numbers Prepend)]:\n${helpers.formatWithLineNumbers(code)}`,
      
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        errors: {
          type: Type.ARRAY,
          description: "코드 전체 공간에서 종합 검출된 모든 예외 처리 부재 및 문법 오류 객체 리스트",
          items: {
            type: Type.OBJECT,
            properties: {
              errorLine: { 
                type: Type.INTEGER, 
                description: "해당 오류가 도출되는 핵심 절대 라인 번호" 
              },
              errorCause: { 
                type: Type.STRING, 
                description: "예외 유형 카테고리 요약 명칭 (Korean)" 
              },
              explanation: { 
                type: Type.STRING, 
                description: "###[TAG:n] 규칙을 완벽히 수반한 구조화 마크다운 해설 문자열" 
              },
              tagMappings: {
                type: Type.ARRAY,
                description: "해당 오류 내부에서 지정된 [TAG:n] 식별용 추적 바인딩 배열",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tag: { type: Type.STRING, description: "e.g., '[TAG:1]'" },
                    token: { type: Type.STRING, description: "정확한 타겟 변수/식별 문자열" },
                    line: { type: Type.INTEGER, description: "해당 토큰의 절대 라인 번호" }
                  },
                  required: ["tag", "token", "line"]
                }
              },
              solution: { 
                type: Type.STRING, 
                description: "해당 파트의 단계별 대응 수리 코드 설계 조언 가이드 (Korean)" 
              }
            },
            required: ["errorLine", "errorCause", "explanation", "tagMappings", "solution"]
          }
        }
      },
      required: ["errors"]
    }
  },

  // 2. 코드 스타일 리뷰 프롬프트(매뉴얼)
  reviewer: {
    systemInstruction: 
      "You are an elite automated code auditor operating at the highest levels of professional software engineering corporate standards.\n\n" +
      
      "[SYSTEM ARCHITECTURE OVERVIEW]\n" +
      "Your sole mission is to audit the provided code across 4 core engineering axes: Readability(가독성), Performance(성능효율성), Maintainability(유지보수), and Safety(예외안정).\n" +
      "You must parse the issues and classify them strictly into the designated response schema structure.\n\n" +

      "[CRITICAL INSTRUCTION: ACCURATE LINE MATCHING]\n" +
      "- The input source code is provided with absolute line numbers at the beginning of each line in 'X: code' format (where X is the line number).\n" +
      "- In your JSON response, every single 'line' property inside the annotations array MUST exactly match these prepended line numbers (X).\n" +
      "- Do NOT recount or shift indexes for empty lines or comments. Match the physical line numbers exactly.\n\n" +

      "[DETAILED CODE AUDIT REFERENCE MANUAL]\n" +
      "You must evaluate the input code against the following master rubric criteria. Do not deviate, compromise, or introduce arbitrary rules:\n\n" +
      evaluationManual +
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
      `Audit the following source code strictly matching the criteria detailed in the [OFFICIAL EVALUATION MANUAL]. Provide deterministic grouping and linear line order sorting.\n\n[Language]: ${language}\n[Source Code (Absolute Line Numbers Prepend)]:\n${helpers.formatWithLineNumbers(code)}`,
      
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
};