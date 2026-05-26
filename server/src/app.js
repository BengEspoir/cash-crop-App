require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const adminAuthRoutes = require('./modules/admin/admin.auth.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const listingsRoutes = require('./modules/listings/listings.routes');
const farmersRoutes = require('./modules/farmers/farmers.routes');
const quotesRoutes = require('./modules/quotes/quotes.routes');
const conversationsRoutes = require('./modules/conversations/conversations.routes');
const messagesRoutes = require('./modules/messages/messages.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const preferencesRoutes = require('./modules/preferences/preferences.routes');
const supportRoutes = require('./modules/support/support.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow requests from Next.js frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// General rate limiter on all API routes
app.use('/api', generalLimiter);

// ── ROUTES ──────────────────────────────────────────────────
// Public auth routes
app.use('/api/v1/auth', authRoutes);

// Admin hidden route — mounted at unpredictable path
app.use('/api/v1/x-secure/admin-access', adminAuthRoutes);

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/listings', listingsRoutes);
app.use('/api/v1/farmers', farmersRoutes);
app.use('/api/v1/quotes', quotesRoutes);
app.use('/api/v1/conversations', conversationsRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/preferences', preferencesRoutes);
app.use('/api/v1/support', supportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AgriculNet API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 — must come AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: { code: 'NOT_FOUND' }
  });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
