require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },

  emporia: {
    baseUrl: process.env.EMPORIA_API_BASE_URL || 'https://api.emporiaenergy.com',
  },

  sma: {
    baseUrl: process.env.SMA_API_BASE_URL || 'https://www.sunnyportal.com/api/v1',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
