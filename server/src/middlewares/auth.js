const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required.',
      errorCode: 'UNAUTHORIZED',
      statusCode: 401
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({
      error: 'Authentication required.',
      errorCode: 'UNAUTHORIZED',
      statusCode: 401
    });
  }
};

module.exports = authMiddleware;
