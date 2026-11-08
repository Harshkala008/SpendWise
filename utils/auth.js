const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const accessSecret = () => process.env.JWT_ACCESS_SECRET;
const refreshSecret = () => process.env.JWT_REFRESH_SECRET;

const requireSecret = (secret, name) => {
  if (!secret) throw new Error(`${name} is not configured`);
  return secret;
};

const createAccessToken = (userId) => jwt.sign({ sub: userId, type: 'access' }, requireSecret(accessSecret(), 'JWT_ACCESS_SECRET'), { expiresIn: '15m' });
const createRefreshToken = (userId) => jwt.sign({ sub: userId, type: 'refresh' }, requireSecret(refreshSecret(), 'JWT_REFRESH_SECRET'), { expiresIn: '7d' });
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { createAccessToken, createRefreshToken, hashToken, accessSecret, refreshSecret };
