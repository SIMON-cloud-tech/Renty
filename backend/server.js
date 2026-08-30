require('dotenv').config();

// ==================== IMPORTS ====================

// Third-party packages
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db'); // MongoDB connection logic

// Route modules — safe to require now, since .env is already loaded above
const authRoutes = require('./routes/authRoute');
const resetRoutes = require('./routes/resetRoute');
const inventoryRoutes = require('./routes/inventoryRoute');
const blogRoutes = require('./routes/blogRoute');
const testimonialsRoutes = require('./routes/testimonialRoute');
const dashboardRoutes = require('./routes/dashboardRoute');
const chatbotRoutes = require('./routes/chatBotRoute');
const guideRoutes = require('./routes/guideRoute');
const leadRoutes = require('./routes/leadRoute');
const analyticsRoutes = require('./routes/analyticsRoute');
const productAnalyticsRoutes = require('./routes/productAnalyticsRoute');
const leadAnalyticsRoutes = require('./routes/leadAnalyticsRoute');
const blogAnalyticsRoutes = require('./routes/blogAnalyticsRoute');
const guideAnalyticsRoutes = require('./routes/guideAnalyticsRoute');
const botAnalyticsRoutes = require('./routes/botAnalyticsRoute');
// ==================== APP SETUP ====================

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://furnihaven.onrender.com'
  : 'http://localhost:5173';

// Render (and most hosts) sit behind a reverse proxy. Without this, Express
// sees every request as coming from the proxy's internal IP, which breaks
// express-rate-limit (everyone gets rate-limited together) and req.ip generally.
app.set('trust proxy', 1);

// ==================== CORE MIDDLEWARE ====================

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true // allows the auth cookie to be sent cross-origin
}));

app.use(express.json());
app.use(cookieParser());

// ==================== STATIC FILES ====================

// Uploaded images — public, with explicit CORS headers for <img> tags loaded from the frontend origin.
// path.join(__dirname, 'uploads') resolves relative to THIS file's location (backend/),
// matching how uploadMiddleware.js locates the same folder — safe regardless of
// what directory the process was started from.
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Built frontend (index.html, JS/CSS bundles) — only relevant in production.
app.use(express.static(path.join(__dirname, 'public')));

// ==================== PUBLIC ROUTES ====================
// No login required to reach these routers. Any write-protection (POST/PUT/DELETE)
// is scoped per-route inside each route file, not at the mount level.

app.use('/api', authRoutes);              // register, login, /profile (protected inside), logout
app.use('/api/reset', resetRoutes);       // password reset via OTP — must stay reachable while logged out
app.use('/api/inventory', inventoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/bot', chatbotRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics/products', productAnalyticsRoutes);
app.use('/api/analytics/leads', leadAnalyticsRoutes);
app.use('/api/analytics/blogs', blogAnalyticsRoutes);
app.use('/api/analytics/guides', guideAnalyticsRoutes);
app.use('/api/analytics/bot', botAnalyticsRoutes);

app.get('/api/config', (req, res) => {
  res.json({
    whatsappNumber: process.env.VITE_WHATSAPP_NUMBER || '254703433014',
    phoneNumber: process.env.VITE_WHATSAPP_NUMBER || '254703433014'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ==================== PROTECTED ROUTES ====================

// Mounted at its OWN prefix (/api/dashboard), not the shared /api prefix used above.
// This is deliberate: if a route file inside here ever adds an unscoped
// `router.use(authMiddleware)`, it stays contained to /api/dashboard/* and
// can never shadow the public routes mounted at /api/* above.
app.use('/api/dashboard', dashboardRoutes);

// ==================== CLIENT-SIDE ROUTING CATCH-ALL ====================

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== 404 FOR UNMATCHED API ROUTES ====================

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ==================== GLOBAL ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// ==================== START SERVER ====================

// Connect to MongoDB FIRST, and only start listening once the connection is confirmed.
// This prevents a window where the server is accepting requests before the
// database is actually reachable, which would make early requests fail or hang.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
});