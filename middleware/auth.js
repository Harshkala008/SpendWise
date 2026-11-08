const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { accessSecret } = require('../utils/auth');

const requireAuth = (request, response, next) => {
  const header = request.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
  try {
    const payload = jwt.verify(token, accessSecret());
    if (payload.type !== 'access') throw new Error('Invalid token type');
    request.user = { id: payload.sub };
    return next();
  } catch {
    return next(new AppError('Invalid or expired access token', 401, 'AUTH_INVALID'));
  }
};

module.exports = requireAuth;
