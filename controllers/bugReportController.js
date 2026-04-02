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
const MAX_HAR_SIZE = 1 * 1024 * 1024 * 1024;  // 1GB

const bugReportSchema = Joi.object({
  chain: Joi.string().valid('algorand', 'voi').required(),
  walletAddress: Joi.string().required(),
  title: Joi.string().max(100).required(),
  description: Joi.string().max(2000).required(),
  category: Joi.string().valid('ui', 'staking', 'farming', 'nft-staking', 'swap', 'prediction', 'device-staking', 'other').required(),
});

/** Remove all uploaded files from this request (cleanup on validation failure or error) */
function cleanupRequestFiles(files) {
  if (!files) return;
  for (const fieldFiles of Object.values(files)) {
    for (const file of fieldFiles) {
      try { fs.unlinkSync(file.path); } catch (_) { /* ignore */ }
    }
  }
}

const createBugReport = async (req, res) => {
  const { error, value } = bugReportSchema.validate(req.body);
  if (error) {
    cleanupRequestFiles(req.files);
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const wallet = req.user.wallet;
  const files = req.files || {};

  const screenshotFile = files.screenshot?.[0];
  const logFile = files.consoleLog?.[0];
  const harFile = files.harFile?.[0];

  // ── Validate files (multer already wrote them to disk) ──

  if (screenshotFile) {
    if (screenshotFile.size > MAX_SCREENSHOT_SIZE) {
      cleanupRequestFiles(req.files);
      return res.status(400).json({ success: false, message: 'Screenshot must be under 5MB' });
    }
    const header = Buffer.alloc(4100);
    const fd = fs.openSync(screenshotFile.path, 'r');
    fs.readSync(fd, header, 0, 4100, 0);
    fs.closeSync(fd);
    const detected = await fileTypeFromBuffer(header);
    if (!detected || !ALLOWED_IMAGE_TYPES.includes(detected.mime)) {
      cleanupRequestFiles(req.files);
      return res.status(400).json({ success: false, message: 'Screenshot must be JPEG, PNG, or WebP' });
    }
  }

  if (logFile) {
    if (logFile.size > MAX_LOG_SIZE) {
      cleanupRequestFiles(req.files);
      return res.status(400).json({ success: false, message: 'Console log must be under 2MB' });
    }
    const ext = path.extname(logFile.originalname).toLowerCase();
    if (!ALLOWED_LOG_EXTS.includes(ext)) {
      cleanupRequestFiles(req.files);
      return res.status(400).json({ success: false, message: 'Console log must be .txt or .log' });
    }
  }

  if (harFile) {
    if (harFile.size > MAX_HAR_SIZE) {
      cleanupRequestFiles(req.files);
      return res.status(400).json({ success: false, message: 'HAR file must be under 1GB' });
    }
    const ext = path.extname(harFile.originalname).toLowerCase();
    if (!ALLOWED_HAR_EXTS.includes(ext)) {
      cleanupRequestFiles(req.files);
      return res.status(400).json({ success: false, message: 'HAR file must be .har or .json' });
    }
  }

  // ── All validations passed — files are already on disk from multer ──

  try {
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
      screenshot: screenshotFile ? `/uploads/bug-reports/${screenshotFile.filename}` : undefined,
      consoleLog: logFile ? `/uploads/bug-reports/${logFile.filename}` : undefined,
      harFile: harFile ? `/uploads/bug-reports/${harFile.filename}` : undefined,
    });

    // Send Discord webhook (async, don't block response)
    sendBugReport(report).catch((err) => {
      logger.error('Bug report webhook failed:', err.message);
    });

    return res.status(201).json({ success: true, id: report._id });
  } catch (err) {
    cleanupRequestFiles(req.files);
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
