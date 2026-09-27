const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const Landlord = require('../models/Landlord');
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

const SIGNUP_ROLES = ['client', 'landlord'];

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

// ========== REGISTER ==========
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;

  if (!fullName || !email || !phone || !password || !role) {
    throw new AppError('All fields are required', 400);
  }
  if (!SIGNUP_ROLES.includes(role)) {
    throw new AppError('Invalid account type', 400);
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }
  if (!/^254\d{9}$/.test(phone)) {
    throw new AppError('Phone must be in format 2547XXXXXXXX', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create the User (identity: name, email, phone, password, role)
  const newUser = await new User({
    name: fullName,
    email: normalizedEmail,
    phone,
    password: hashedPassword,
    role,
  }).save();

  // 2. Create the role-specific profile (Client or Landlord).
  try {
    if (role === 'client') {
      await new Client({ userId: newUser._id, name: fullName, phone }).save();
    } else if (role === 'landlord') {
      await new Landlord({ userId: newUser._id, name: fullName, phone }).save();
    }
  } catch (profileErr) {
    // Roll back the User so a failed profile doesn't leave a half-made account.
    await User.deleteOne({ _id: newUser._id });
    throw profileErr;
  }

  res.cookie('token', signToken(newUser), COOKIE_OPTIONS);
  res.status(201).json({ user: publicUser(newUser) });
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

  res.cookie('token', signToken(user), COOKIE_OPTIONS);
  res.json({ user: publicUser(user) });
});

// ========== GET PROFILE ==========
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
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