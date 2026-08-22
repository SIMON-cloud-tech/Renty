const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OtpStore = require('../models/otpStore');
const { sendOTPEmail } = require('../utils/sendEmail');
const { asyncHandler, AppError } = require('../utils/errorHandler');

const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Helper: validate OTP record ───
const validateOtpRecord = (record) => {
  if (!record) throw new AppError('Invalid or expired code', 400);
  if (Date.now() > record.expiresAt) throw new AppError('Invalid or expired code', 400);
  if (record.attempts >= MAX_ATTEMPTS) {
    throw new AppError('Too many attempts. Please request a new code.', 429);
  }
};

// ─── Helper: delete OTP record ───
const deleteOtpRecord = async (email) => {
  await OtpStore.deleteOne({ email });
};

// ========== 1. SEND OTP ==========
exports.sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400);

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // Always return the same message — prevents email enumeration
  if (!user) {
    return res.json({ message: 'If that email is registered, a code has been sent.' });
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;

  await OtpStore.findOneAndUpdate(
    { email: normalizedEmail },
    { otp, expiresAt, attempts: 0 },
    { upsert: true, new: true }
  );

  await sendOTPEmail(normalizedEmail, otp, 'password reset');

  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 OTP for ${normalizedEmail}: ${otp}`);
  }

  res.json({ message: 'If that email is registered, a code has been sent.' });
});

// ========== 2. VERIFY OTP ==========
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new AppError('Email and OTP required', 400);

  const normalizedEmail = email.toLowerCase().trim();
  const record = await OtpStore.findOne({ email: normalizedEmail });

  validateOtpRecord(record);

  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    throw new AppError('Invalid or expired code', 400);
  }

  res.json({ message: 'Code verified successfully' });
});

// ========== 3. RESET PASSWORD ==========
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new AppError('Email, code, and new password required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = await OtpStore.findOne({ email: normalizedEmail });

  validateOtpRecord(record);

  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    throw new AppError('Invalid or expired code', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword });

  await deleteOtpRecord(normalizedEmail);

  res.json({ message: 'Password reset successful' });
});