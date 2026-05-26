require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/index');
const { initFirebase } = require('./config/firebase');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Route imports
const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/sites');
const deviceRoutes = require('./routes/devices');
const energyRoutes = require('./routes/energy');
const solarRoutes = require('./routes/solar');
const billingRoutes = require('./routes/billing');
const alertRoutes = require('./routes/alerts');

// ── App Setup ───────────────────────────────────────────────────

const app = express();

// Initialize Firebase
initFirebase();

// ── Middleware ───────────────────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    standardHeaders: true,
  })
);

// ── Routes ──────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/sites', siteRoutes);
app.use('/devices', deviceRoutes);
app.use('/energy', energyRoutes);
app.use('/solar', solarRoutes);
app.use('/billing', billingRoutes);
app.use('/alerts', alertRoutes);

// ── Error Handling ──────────────────────────────────────────────

app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────────

app.listen(config.port, () => {
  logger.info(`Energy Monitor API running on port ${config.port} (${config.nodeEnv})`);
});

module.exports = app;
