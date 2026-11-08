const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { createAccessToken, createRefreshToken, hashToken, refreshSecret } = require('../utils/auth');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const issueTokens = async (user, response) => {
  const accessToken = createAccessToken(user._id.toString());
  const refreshToken = createRefreshToken(user._id.toString());
  await User.findByIdAndUpdate(user._id, { refreshTokenHash: hashToken(refreshToken) });
  response.cookie('spendwise_refresh', refreshToken, cookieOptions);
  return { accessToken, user: { id: user._id, email: user.email } };
};

const getAdminCredentials = () => ({
  loginId: process.env.ADMIN_LOGIN_ID || (process.env.NODE_ENV === 'production' ? null : 'admin@spendwise.local'),
  password: process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'Admin@12345')
});

const ensureAdminUser = async () => {
  const { loginId, password } = getAdminCredentials();
  if (!loginId || !password) return;

  const email = loginId.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    { $set: { email, passwordHash } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin login ready: ${email}`);
};

const signup = asyncHandler(async (request, response) => {
  const email = request.body.email.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists', 409, 'EMAIL_IN_USE');
  const passwordHash = await bcrypt.hash(request.body.password, 12);
  const user = await User.create({ email, passwordHash });
  response.status(201).json({ success: true, data: await issueTokens(user, response) });
});

const login = asyncHandler(async (request, response) => {
  const email = request.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(request.body.password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401, 'AUTH_INVALID');
  }
  response.json({ success: true, data: await issueTokens(user, response) });
});

const refresh = asyncHandler(async (request, response) => {
  const token = request.cookies.spendwise_refresh;
  if (!token) throw new AppError('Refresh token required', 401, 'AUTH_REQUIRED');
  let payload;
  try {
    payload = jwt.verify(token, refreshSecret());
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'AUTH_INVALID');
  }
  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    throw new AppError('Invalid refresh token', 401, 'AUTH_INVALID');
  }
  response.json({ success: true, data: await issueTokens(user, response) });
});

const logout = asyncHandler(async (request, response) => {
  if (request.user) await User.findByIdAndUpdate(request.user.id, { $unset: { refreshTokenHash: 1 } });
  response.clearCookie('spendwise_refresh', cookieOptions);
  response.json({ success: true, data: null });
});

module.exports = { signup, login, refresh, logout, cookieOptions, ensureAdminUser };
