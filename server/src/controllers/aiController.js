const { GoogleGenAI } = require('@google/genai');
const aiPrompts = require('../controllers/aiPrompts'); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });
const GEMINI_MODEL = 'gemini-2.5-flash';

const logRequest = (endpoint, data) => {
  console.log(`[${new Date().toISOString()}] [AI ${endpoint}] Request:`, {
    language: data.language,
    codeLength: data.code?.length,
    hasErrorLog: !!data.errorLog,
    errorLogLength: data.errorLog?.length
  });
};

const logResponse = (endpoint, data) => {
  console.log(`[${new Date().toISOString()}] [AI ${endpoint}] Response:`, {
    keys: Object.keys(data),
    hasRequiredFields: !!data && Object.keys(data).length > 0
  });
};

const logError = (endpoint, error) => {
  console.error(`[${new Date().toISOString()}] [AI ${endpoint}] Error:`, {
    message: error.message,
    stack: error.stack,
    statusCode: error.status
  });
};

//Error Explainer
exports.explainer = async (req, res, next) => {
  const { code, language, errorLog } = req.body;

  if (!code || !errorLog) {
    return res.status(400).json({ error: "Source code and errorlog is required." });
  }
  
  logRequest('explainer', { code, language, errorLog });
  
  try {
    const config = aiPrompts.explainer; 

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: config.getPrompt({ language, errorLog, code }),
      config: {
        systemInstruction: config.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: config.responseSchema
      }
    });

    const parsedResponse = JSON.parse(response.text);
    logResponse('explainer', parsedResponse);
    res.json(parsedResponse);
  } catch (err) {
    logError('explainer', err);
    next(err);
  }
};

//Style Reviewer
exports.reviewer = async (req, res, next) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: "no exist code to analyze." });
  }

  logRequest('reviewer', { code, language });

  try {
    const config = aiPrompts.reviewer;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: config.getPrompt({ language, code }),
      config: {
        systemInstruction: config.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: config.responseSchema
      }
    });

    const parsedResponse = JSON.parse(response.text);
    logResponse('reviewer', parsedResponse);
    res.json(parsedResponse);
  } catch (err) {
    logError('reviewer', err);
    next(err);
  }
};

//Code Optimizer
exports.optimizer = async (req, res, next) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: "no exist code to optimize." });
  }

  logRequest('optimizer', { code, language });

  try {
    const config = aiPrompts.optimizer;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: config.getPrompt({ language, code }),
      config: {
        systemInstruction: config.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: config.responseSchema
      }
    });

    const parsedResponse = JSON.parse(response.text);
    logResponse('optimizer', parsedResponse);
    res.json(parsedResponse);
  } catch (err) {
    logError('optimizer', err);
    next(err);
  }
};