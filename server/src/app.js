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

// error handling
app.use((err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let message = err.message || '서버 내부 오류';

  //basic error handling
  res.status(statusCode).json({
    error: message,
    errorCode: errorCode,
    statusCode: statusCode
  });
});

module.exports = app;
