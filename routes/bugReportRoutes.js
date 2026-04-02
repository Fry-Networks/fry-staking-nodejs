const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { createBugReport, listBugReports } = require('../controllers/bugReportController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB overall limit (HAR files)
});

const bugReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many bug reports. Please try again later.' },
});

router.post(
  '/',
  requireAuth,
  bugReportLimiter,
  upload.fields([
    { name: 'screenshot', maxCount: 1 },
    { name: 'consoleLog', maxCount: 1 },
    { name: 'harFile', maxCount: 1 },
  ]),
  createBugReport,
);

router.get('/', requireAuth, requireAdmin, listBugReports);

module.exports = router;
