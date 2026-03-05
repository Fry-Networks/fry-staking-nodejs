const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * requireAuth — Verifies Authorization: Bearer <token> header.
 * Attaches req.user = { wallet } on success.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { wallet: decoded.wallet };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * requireAdmin — Must be used AFTER requireAuth.
 * Checks req.user.wallet is in ADMIN_WALLETS env var (comma-separated).
 */
const requireAdmin = (req, res, next) => {
  const adminWallets = (process.env.ADMIN_WALLETS || '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);

  if (!req.user || !adminWallets.includes(req.user.wallet)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

/**
 * requireRewardsAdmin — Must be used AFTER requireAuth.
 * Checks req.user.wallet against ADMIN_WALLETS env var AND rewardsConfig.adminWallets from DB.
 */
const requireRewardsAdmin = async (req, res, next) => {
  const envAdmins = (process.env.ADMIN_WALLETS || '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Check env-based admin list first
  if (envAdmins.includes(req.user.wallet)) {
    return next();
  }

  // Check DB-based rewards admin list
  try {
    const RewardsConfig = require('../models/rewardsConfigSchema');
    const config = await RewardsConfig.getConfig();
    if (config.adminWallets && config.adminWallets.includes(req.user.wallet)) {
      return next();
    }
  } catch (err) {
    console.error('Error checking rewards admin:', err.message);
  }

  return res.status(403).json({ success: false, message: 'Rewards admin access required' });
};

module.exports = { requireAuth, requireAdmin, requireRewardsAdmin };
