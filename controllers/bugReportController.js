const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const { fromBuffer: fileTypeFromBuffer } = require('file-type');
const logger = require('../config/logger');
const BugReport = require('../models/bugReportSchema');
const User = require('../models/userSchema');
const { sendBugReport } = require('../services/discordBugReportNotifier');

const UPLOAD_DIR = path.join(__dirname, '../uploads/bug-reports');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_LOG_EXTS = ['.txt', '.log'];
const ALLOWED_HAR_EXTS = ['.har', '.json'];

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_LOG_SIZE = 2 * 1024 * 1024;         // 2MB
const MAX_HAR_SIZE = 10 * 1024 * 1024;        // 10MB

const bugReportSchema = Joi.object({
  chain: Joi.string().valid('algorand', 'voi').required(),
  walletAddress: Joi.string().required(),
  title: Joi.string().max(100).required(),
  description: Joi.string().max(2000).required(),
  category: Joi.string().valid('ui', 'staking', 'farming', 'nft-staking', 'swap', 'prediction', 'device-staking', 'other').required(),
});

function saveFile(file, wallet, fieldName) {
  const ext = path.extname(file.originalname).toLowerCase() || '.bin';
  const filename = `${wallet}_${fieldName}_${Date.now()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/bug-reports/${filename}`;
}

function cleanupFile(filePath) {
  if (filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    try { fs.unlinkSync(fullPath); } catch (_) { /* ignore */ }
  }
}

const createBugReport = async (req, res) => {
  const { error, value } = bugReportSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const wallet = req.user.wallet;
  const files = req.files || {};

  const screenshotFile = files.screenshot?.[0];
  const logFile = files.consoleLog?.[0];
  const harFile = files.harFile?.[0];

  // ── Phase 1: Validate ALL files before writing ANY to disk ──

  if (screenshotFile) {
    if (screenshotFile.size > MAX_SCREENSHOT_SIZE) {
      return res.status(400).json({ success: false, message: 'Screenshot must be under 5MB' });
    }
    const detected = await fileTypeFromBuffer(screenshotFile.buffer);
    if (!detected || !ALLOWED_IMAGE_TYPES.includes(detected.mime)) {
      return res.status(400).json({ success: false, message: 'Screenshot must be JPEG, PNG, or WebP' });
    }
  }

  if (logFile) {
    if (logFile.size > MAX_LOG_SIZE) {
      return res.status(400).json({ success: false, message: 'Console log must be under 2MB' });
    }
    const ext = path.extname(logFile.originalname).toLowerCase();
    if (!ALLOWED_LOG_EXTS.includes(ext)) {
      return res.status(400).json({ success: false, message: 'Console log must be .txt or .log' });
    }
  }

  if (harFile) {
    if (harFile.size > MAX_HAR_SIZE) {
      return res.status(400).json({ success: false, message: 'HAR file must be under 10MB' });
    }
    const ext = path.extname(harFile.originalname).toLowerCase();
    if (!ALLOWED_HAR_EXTS.includes(ext)) {
      return res.status(400).json({ success: false, message: 'HAR file must be .har or .json' });
    }
  }

  // ── Phase 2: All validations passed — write files to disk ──

  const savedPaths = {};

  try {
    if (screenshotFile) savedPaths.screenshot = saveFile(screenshotFile, wallet, 'screenshot');
    if (logFile) savedPaths.consoleLog = saveFile(logFile, wallet, 'console');
    if (harFile) savedPaths.harFile = saveFile(harFile, wallet, 'har');

    // Look up Discord username if linked
    let discordUsername;
    try {
      const user = await User.findOne({ walletId: wallet });
      if (user?.discordUsername) {
        discordUsername = user.discordUsername;
      }
    } catch (_) { /* non-critical */ }

    const report = await BugReport.create({
      walletId: wallet,
      walletAddress: value.walletAddress,
      chain: value.chain,
      discordUsername,
      title: value.title,
      description: value.description,
      category: value.category,
      screenshot: savedPaths.screenshot,
      consoleLog: savedPaths.consoleLog,
      harFile: savedPaths.harFile,
    });

    // Send Discord webhook (async, don't block response)
    sendBugReport(report).catch((err) => {
      logger.error('Bug report webhook failed:', err.message);
    });

    return res.status(201).json({ success: true, id: report._id });
  } catch (err) {
    // Cleanup any saved files on error
    Object.values(savedPaths).forEach(cleanupFile);
    logger.error('Error creating bug report:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit bug report' });
  }
};

const listBugReports = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      BugReport.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BugReport.countDocuments(),
    ]);

    return res.json({ success: true, data: reports, total, page, limit });
  } catch (err) {
    logger.error('Error listing bug reports:', err);
    return res.status(500).json({ success: false, message: 'Failed to list bug reports' });
  }
};

module.exports = { createBugReport, listBugReports };
