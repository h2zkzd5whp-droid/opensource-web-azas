require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트 연결
app.use('/api', require('./routes/auth'));
app.use('/api/code', require('./routes/code'));

// 에러 헨들링
app.use((err, req, res, _next) => {
  res.status(err.statusCode || 500).json({
    error: err.message || '서버 내부 오류',
    errorCode: err.errorCode || 'INTERNAL_ERROR',
    statusCode: err.statusCode || 500
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
