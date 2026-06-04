const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = 'gemini-2.5-flash';

//Error Explainer
exports.explainer = async (req, res, next) => {
  const { code, language, errorLog } = req.body;

  if (!code || !errorLog) {
    return res.status(400).json({ error: "Source code and errorlog is required." });
  }
  
  const prompt = `[Language]: ${language}\n[Error Log]: ${errorLog}\n[Source Code]:\n${code}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 
          "You are an expert senior software engineer helping developers debug complex compilation or runtime errors. " +
          "Identify the exact root cause, pinpoint the most relevant line, and provide a clear solution. " +
          "\n\n" +
          "CRITICAL INSTRUCTIONS FOR VISUAL INDEXING:\n" +
          "1. To explain the error clearly without conflicts, use dynamic numbered tags like [TAG:1], [TAG:2], [TAG:3] etc., to index different code identifiers, variables, types, or expressions involved in the error.\n" +
          "2. Increment the number (1, 2, 3...) for each unique code element you reference so that they never overlap.\n" +
          "3. You MUST embed these exact tags naturally inside the 'explanation' field text.\n" +
          "4. Write the values for 'errorCause' and 'explanation' in Korean. (Example: '5번 라인의 [TAG:1] 변수는 정의되지 않았습니다.')\n" +
          "5. You must output strictly in the specified JSON format.",

        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            errorCause: { type: Type.STRING, description: "Summary of the root cause written in Korean" },
            line: { type: Type.INTEGER, description: "The line number most relevant to the error" },
            fixedCode: { type: Type.STRING, description: "The complete fixed code or the core corrected code snippet" },
            explanation: { type: Type.STRING, description: "Detailed explanation of how to solve it written in Korean, embedding the [TAG:n] tokens properly." }
          },
          required: ["errorCause", "line", "fixedCode", "explanation"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    next(err);
  }
};
//Style Reviewer
exports.reviewer = async (req, res, next) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: "no exist code to analyze." });
  }

  const prompt = `Review the following source code for readability, naming conventions, and style guide compliance. Provide line-by-line feedback.\n\n[Language]: ${language}\n[Source Code]:\n${code}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a meticulous yet encouraging code style reviewer. Detect readability issues, anti-patterns, or convention violations. CRITICAL: You must output strictly in the specified JSON format. Write the 'message' inside annotations in Korean.",
        responseMimeType: "application/json",
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
      }
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    next(err);
  }
};
//Code Optimizer
exports.optimizer =  async (req, res, next) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: "no exist code to optimize." });
  }

  const prompt = `Analyze this algorithm code to improve time and space complexity. Devise an optimized alternative while maintaining code readability.\n\n[Language]: ${language}\n[Source Code]:\n${code}`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert in algorithms and computer performance optimization. Eliminate redundant operations and refactor the code efficiently. CRITICAL: You must output strictly in the specified JSON format. Write the 'description' field in Korean.",
        responseMimeType: "application/json",
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
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    next(err);
  }
};
