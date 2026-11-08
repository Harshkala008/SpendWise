const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { signup, login, refresh, logout } = require('../controllers/authController');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts. Try again later.' } });
const credentials = [
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
];

router.post('/signup', authLimit, [body('email').isEmail().normalizeEmail().withMessage('A valid email is required'), ...credentials], validate, signup);
router.post('/login', authLimit, [body('email').trim().notEmpty().withMessage('A login ID or email is required'), ...credentials], validate, login);
router.post('/refresh', refresh);
router.post('/logout', requireAuth, logout);

module.exports = router;
