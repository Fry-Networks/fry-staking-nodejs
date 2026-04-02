const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const UPLOAD_DIR = '/app/uploads/bug-reports';
const MAX_AGE_DAYS = 30;

function cleanOldBugReports() {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;
  let errors = 0;

  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      } catch (err) {
        errors++;
        logger.error(`Bug report cleanup: failed to delete ${file}:`, err.message);
      }
    }
    if (deleted > 0 || errors > 0) {
      logger.info(`Bug report cleanup: deleted ${deleted} files, ${errors} errors`);
    }
  } catch (err) {
    logger.error('Bug report cleanup: failed to read upload dir:', err.message);
  }
}

// Run daily at 3am
cron.schedule('0 3 * * *', cleanOldBugReports);
logger.info('Bug report cleanup cron: registered (daily at 3am, 30-day retention)');

module.exports = { cleanOldBugReports };
