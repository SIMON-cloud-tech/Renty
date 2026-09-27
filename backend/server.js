require('dotenv').config();

// ==================== IMPORTS ====================

// Third-party packages
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db'); // MongoDB connection logic
const { errorHandler } = require('./utils/errorHandler'); // shared handler: respects AppError status codes

// Auth
const authRoutes = require('./routes/authRoutes');
const resetRoutes = require('./routes/resetRoutes');

//public facing website
const blogRoutes = require('./routes/blogRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const guideRoutes = require('./routes/guideRoutes');
const houseRoutes = require('./routes/houseRoutes');

// Business dashboard
const businessUnitRoutes = require('./routes/businessUnitRoutes');
const businessClientRoutes = require('./routes/businessClientRoutes');
const businessLandlordRoutes = require('./routes/businessLandlordRoutes');
const businessCancellationRoutes = require('./routes/businessCancellationRoutes');

// Landlord dashboard
const landlordUnitRoutes = require('./routes/landlordUnitRoutes');
const landlordPaymentRoutes = require('./routes/landlordPaymentRoute');
const landlordClientRoutes = require('./routes/landlordClientRoutes');
const landlordComplaintRoutes = require('./routes/landlordComplaintRoutes');
const landlordCancellationRoutes = require('./routes/landlordCancellationRoutes');

// Client dashboard
const clientUnitRoutes = require('./routes/clientUnitRoutes');
const clientPaymentRoutes = require('./routes/clientPaymentRoutes');

// Analytics
const blogAnalyticsRoutes = require('./routes/blogAnalyticsRoutes');
const botAnalyticsRoutes = require('./routes/botAnalyticsRoutes');
const guideAnalyticsRoutes = require('./routes/guideAnalyticsRoutes');
const leadAnalyticsRoutes = require('./routes/leadAnalyticsRoutes');
const clientRentRoutes = require('./routes/clientRentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// ==================== APP SETUP ====================

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://furnihaven.onrender.com' // <-- change to your new production frontend URL
  : 'http://localhost:5173';

// Behind a reverse proxy (Render etc.) this makes req.ip and express-rate-limit work correctly
app.set('trust proxy', 1);

// ==================== CORE MIDDLEWARE ====================

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true, // allows the auth cookie to be sent cross-origin
}));

app.use(express.json());
app.use(cookieParser());

// ==================== STATIC FILES ====================

// Built frontend (index.html, JS/CSS bundles) — only relevant in production.
// Unit images live on Cloudinary, so there is no local /uploads folder to serve.
app.use(express.static(path.join(__dirname, 'public')));

// ==================== AUTH ROUTES ====================

app.use('/api', authRoutes);        // register, login, /profile (protected inside), logout
app.use('/api/reset', resetRoutes); // password reset — must stay reachable while logged out

// ==================== PUBLIC WEBSITE ROUTES ====================
app.use('/api/houses', houseRoutes); // public-facing house listings;
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/house', houseRoutes);

// ==================== BUSINESS (role: business) ====================

app.use('/api/business/units', businessUnitRoutes);
app.use('/api/business/clients', businessClientRoutes);
app.use('/api/business/landlords', businessLandlordRoutes);
app.use('/api/business/cancellations', businessCancellationRoutes);

// ==================== LANDLORD (role: landlord) ====================

app.use('/api/landlord/units', landlordUnitRoutes);
app.use('/api/landlord/payments', landlordPaymentRoutes);
app.use('/api/landlord/clients', landlordClientRoutes);
app.use('/api/landlord/complaints', landlordComplaintRoutes);
app.use('/api/landlord/cancellations', landlordCancellationRoutes);

// ==================== CLIENT (role: client) ====================

app.use('/api/client/units', clientUnitRoutes);
app.use('/api/client/payments', clientPaymentRoutes);

//==================== WEBHOOKS (role: webhook) ====================
app.use('/api/webhooks', express.json(), webhookRoutes);
app.use('/api/client/rent', clientRentRoutes);

// ==================== ANALYTICS ====================

app.use('/api/analytics/blogs', blogAnalyticsRoutes);
app.use('/api/analytics/bot', botAnalyticsRoutes);
app.use('/api/analytics/guides', guideAnalyticsRoutes);
app.use('/api/analytics/leads', leadAnalyticsRoutes);

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ==================== CLIENT-SIDE ROUTING CATCH-ALL ====================

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== 404 FOR UNMATCHED API ROUTES ====================

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ==================== GLOBAL ERROR HANDLER ====================

app.use(errorHandler);

// ==================== START SERVER ====================

// Connect to MongoDB FIRST, and only start listening once the connection is confirmed
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
});