/*
JWT검증 미들웨어
요청 헤더에서 토큰 꺼냄 -> 유효한지 확인 -> 유저 정보를 req.user에 담아서 다음으로 넘김
*/
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: '인증이 필요합니다',
      errorCode: 'UNAUTHORIZED',
      statusCode: 401
    });
  }

  const token = authHeader.split(' ')[1];   // 공백으로 쪼개서 앞의 Bearer는 버리고 뒤의 토큰만 가져오는 거

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({
      error: '인증이 필요합니다',
      errorCode: 'UNAUTHORIZED',
      statusCode: 401
    });
  }
};

module.exports = authMiddleware;