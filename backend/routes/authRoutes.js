// routes/authRoute.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getProfile, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Limits repeated login attempts per IP — slows down credential-stuffing/brute-force attacks.
// 10 attempts per 15 min is generous for a real user, painful for a script.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limits account creation per IP — stops bots from mass-registering accounts.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many accounts created from this network. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ── Public: create a new account ──
router.post('/register', registerLimiter, register);

// ── Public: log in with email/password — on success, controller sets the JWT as an httpOnly cookie ──
router.post('/login', loginLimiter, login);

// ── Protected: only reachable with a valid JWT cookie — used by the frontend to check "am I logged in" and load user data ──
router.get('/profile', authMiddleware, getProfile);

// ── Public: clears the auth cookie — no valid session required to call this ──
router.post('/logout', logout);

module.exports = router;