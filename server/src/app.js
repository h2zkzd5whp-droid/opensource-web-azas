require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
// middleware
app.use(cors());
app.use(express.json());

// connect route
app.use('/api', require('./routes/auth'));
app.use('/api/code', require('./routes/code'));

// error handling(기존 에러핸들링에서 도커서버와, llm호출 오류 분리하기 위해 if문 사용)
app.use((err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let message = err.message || '서버 내부 오류';

  // 요청 정보 로깅 (디버깅용)
  console.error(`[${new Date().toISOString()}] Error Path: ${req.path}`, {
    method: req.method,
    statusCode,
    errorCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // if docker code execution error
  if (req.path.includes('/run')) { 
    return res.status(200).json({ 
      stdout: "",
      stderr: err.message || 'Docker execution error',
      exitCode: 1,
      executionTime: "0ms",
      error: 'SERVER_EXECUTION_ERROR'
    });
  }

  // if LLM-api error
  if (req.path.includes('/ai/explain-error')) {
    statusCode = 500;
    errorCode = 'AI_EXPLAINER_ERROR';
    message = 'AI 에러 분석 중 서버 오류가 발생했습니다.';
    console.error('[AI Explainer] Error details:', {
      originalError: err.message,
      apiKey: process.env.GEMINI_API ? '설정됨' : '없음',
      model: 'gemini-2.5-flash'
    });
  } 
  else if (req.path.includes('/ai/analyze-style')) {
    statusCode = 500;
    errorCode = 'AI_REVIEWER_ERROR';
    message = 'AI 스타일 분석 중 서버 오류가 발생했습니다.';
    console.error('[AI Reviewer] Error details:', {
      originalError: err.message,
      apiKey: process.env.GEMINI_API ? '설정됨' : '없음'
    });
  } 
  else if (req.path.includes('/ai/optimize')) {
    statusCode = 500;
    errorCode = 'AI_OPTIMIZER_ERROR';
    message = 'AI 코드 최적화 중 서버 오류가 발생했습니다.';
    console.error('[AI Optimizer] Error details:', {
      originalError: err.message,
      apiKey: process.env.GEMINI_API ? '설정됨' : '없음'
    });
  }

  //basic error handling
  res.status(statusCode).json({
    error: message,
    errorCode: errorCode,
    statusCode: statusCode,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
