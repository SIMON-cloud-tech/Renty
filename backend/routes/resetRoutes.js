// routes/resetRoute.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendOtp, verifyOtp, resetPassword } = require('../controllers/resetController');

const router = express.Router();

// Limits how often a single IP can request an OTP — without this, someone could
// spam a target's inbox with reset codes, or generate many codes to widen a guessing window.
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many code requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limits verify/reset attempts per IP — backs up the per-record `attempts` counter
// in OtpStore with a broader per-IP throttle, so brute-forcing across many emails
// from one IP is also slowed down, not just brute-forcing one email's code.
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ── Public: user requests a reset code — they're not logged in, so this must stay open ──
router.post('/send-otp', otpRequestLimiter, sendOtp);

// ── Public: user submits the code they received to prove ownership of the account ──
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);

// ── Public: user sets a new password using the verified OTP as proof of identity ──
router.post('/reset-password', otpVerifyLimiter, resetPassword);

module.exports = router;