const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * requireAuth — Verifies Authorization: Bearer <token> header.
 * Attaches req.user = { wallet } on success.
 */
const requireAuth = (req, res, next) => {
  // Read JWT from HttpOnly cookie (primary) or Authorization header (fallback)
  let token = req.cookies?.fry_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { wallet: decoded.wallet };
    next();
  } catch (err) {
    // Clear stale cookie
    res.clearCookie('fry_token', { path: '/' });
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * requireAdmin — Must be used AFTER requireAuth.
 * Checks req.user.wallet against ADMIN_WALLETS env var AND rewardsConfig.adminWallets from DB.
 */
const requireAdmin = async (req, res, next) => {
  const adminWallets = (process.env.ADMIN_WALLETS || '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);

  if (!req.user) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  if (adminWallets.includes(req.user.wallet)) {
    return next();
  }

  try {
    const RewardsConfig = require('../models/rewardsConfigSchema');
    const config = await RewardsConfig.getConfig();
    if (config.adminWallets && config.adminWallets.includes(req.user.wallet)) {
      return next();
    }
  } catch (_err) {
    // DB check failed, fall through to deny
  }

  return res.status(403).json({ success: false, message: 'Admin access required' });
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
    logger.error('Error checking rewards admin:', err.message);
  }

  return res.status(403).json({ success: false, message: 'Rewards admin access required' });
};

module.exports = { requireAuth, requireAdmin, requireRewardsAdmin };
