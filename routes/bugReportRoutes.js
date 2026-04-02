const express = require('express');
const path = require('path');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { createBugReport, listBugReports } = require('../controllers/bugReportController');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '/app/uploads/bug-reports/');
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 1 * 1024 * 1024 * 1024 }, // 1GB
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
