const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../utils/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables — refusing to start server');
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ========== REGISTER (only one user allowed) ==========
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // ── Check if a user already exists ──
  const userCount = await User.countDocuments();
  if (userCount >= 1) {
    throw new AppError('Registration is disabled. Only one admin account is allowed.', 403);
  }

  if (!fullName || !email || !password) {
    throw new AppError('All fields are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name: fullName,
    email: normalizedEmail,
    password: hashedPassword,
  });

  await newUser.save();

  const token = jwt.sign(
    { id: newUser._id, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, COOKIE_OPTIONS);

  res.status(201).json({
    user: { id: newUser._id, name: newUser.name, email: newUser.email },
  });
});

// ========== LOGIN ==========
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, COOKIE_OPTIONS);

  res.json({
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// ========== GET PROFILE ==========
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json({ id: user._id, name: user.name, email: user.email });
});

// ========== LOGOUT ==========
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
};