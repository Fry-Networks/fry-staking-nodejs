const cron = require('node-cron');
const logger = require('../config/logger');
const { syncAllPools } = require('../services/poolSyncService');
const { syncAllFarmingPools } = require('../services/farmingSyncService');
const { syncAllNftStakingPools } = require('../services/nftStakingSyncService');
const { syncAllAlphaArcadePools } = require('../services/alphaArcadeSyncService');

// Sync on-chain pool stats to MongoDB every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const start = Date.now();
  logger.info('Pool sync cron: starting');

  // 1. Token staking pools
  try {
    const stats = await syncAllPools({ includeEnded: false });
    logger.info(
      `Pool sync cron [staking]: completed in ${Date.now() - start}ms — ` +
      `total=${stats.total} synced=${stats.synced} skipped=${stats.skipped} errors=${stats.errors}`
    );
  } catch (error) {
    logger.error('Pool sync cron [staking]: error:', error);
  }

  // 2. Farming pools
  const farmStart = Date.now();
  try {
    const stats = await syncAllFarmingPools();
    logger.info(
      `Pool sync cron [farming]: completed in ${Date.now() - farmStart}ms — ` +
      `total=${stats.total} synced=${stats.synced} skipped=${stats.skipped} errors=${stats.errors}`
    );
  } catch (error) {
    logger.error('Pool sync cron [farming]: error:', error);
  }

  // 3. NFT staking pools
  const nftStart = Date.now();
  try {
    const stats = await syncAllNftStakingPools();
    logger.info(
      `Pool sync cron [nft-staking]: completed in ${Date.now() - nftStart}ms — ` +
      `total=${stats.total} synced=${stats.synced} skipped=${stats.skipped} errors=${stats.errors}`
    );
  } catch (error) {
    logger.error('Pool sync cron [nft-staking]: error:', error);
  }

  // 4. Alpha Arcade prediction LP pools
  const aaStart = Date.now();
  try {
    const stats = await syncAllAlphaArcadePools();
    logger.info(
      `Pool sync cron [alpha-arcade]: completed in ${Date.now() - aaStart}ms — ` +
      `total=${stats.total} synced=${stats.synced} skipped=${stats.skipped} errors=${stats.errors}`
    );
  } catch (error) {
    logger.error('Pool sync cron [alpha-arcade]: error:', error);
  }

  logger.info(`Pool sync cron: all syncs completed in ${Date.now() - start}ms`);
});

logger.info('Pool sync cron: registered (every 5 minutes) — staking, farming, nft-staking, alpha-arcade');
