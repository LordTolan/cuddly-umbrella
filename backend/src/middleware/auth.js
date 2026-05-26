const { getAuth } = require('../config/firebase');
const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * Firebase JWT authentication middleware.
 * Verifies the Bearer token, finds or creates the user in our DB,
 * and attaches `req.user` for downstream handlers.
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.split('Bearer ')[1];

  try {
    const decoded = await getAuth().verifyIdToken(token);

    // Upsert user — first request after sign-up creates the DB row
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email,
          name: decoded.name || null,
        },
      });
      logger.info(`New user created: ${user.email}`);
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('Auth failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
