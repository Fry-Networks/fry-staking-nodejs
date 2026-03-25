const logger = require('../config/logger');
const AlphaArcadePool = require('../models/alphaArcadePoolSchema');
const { getAlgodClient } = require('./algodService');
const { getMarketGlobalState } = require('@alpha-arcade/sdk');

/**
 * Sync a single Alpha Arcade pool's on-chain global state to MongoDB.
 * Returns { updated: boolean, inSync?: boolean, error?: string }
 */
async function syncAlphaArcadePool(pool) {
  const appId = Number(pool.marketAppId);

  if (!appId || isNaN(appId)) {
    return { updated: false, error: `Invalid marketAppId: ${pool.marketAppId}` };
  }

  try {
    const algodClient = getAlgodClient();
    const globalState = await getMarketGlobalState(algodClient, appId);

    const onChainResolved = globalState.is_resolved === 1;
    let onChainOutcome = null;
    if (onChainResolved) {
      onChainOutcome = globalState.outcome === 1 ? 'yes' : 'no';
    }

    const resolvedDiffers = onChainResolved !== (pool.isResolved || false);
    const outcomeDiffers = onChainOutcome !== (pool.resolutionOutcome || null);

    if (!resolvedDiffers && !outcomeDiffers) {
      await AlphaArcadePool.updateOne(
        { _id: pool._id },
        { $set: { lastOnChainSync: new Date() } }
      );
      return { updated: false, inSync: true };
    }

    const update = { lastOnChainSync: new Date() };

    if (onChainResolved && !pool.isResolved) {
      update.isResolved = true;
      update.resolutionOutcome = onChainOutcome;
      update.isActive = false;
    }

    await AlphaArcadePool.updateOne({ _id: pool._id }, { $set: update });

    logger.info(
      `Alpha Arcade sync: ${appId} — ` +
      `isResolved: ${pool.isResolved} -> ${onChainResolved}, ` +
      `outcome: ${pool.resolutionOutcome || 'null'} -> ${onChainOutcome || 'null'}`
    );

    return { updated: true };
  } catch (err) {
    logger.warn(`Alpha Arcade sync failed for ${appId}: ${err.message}`);
    return { updated: false, error: err.message };
  }
}

/**
 * Sync all active/unresolved Alpha Arcade pools from on-chain state.
 * Processes sequentially with a small delay to avoid algod rate limiting.
 */
async function syncAllAlphaArcadePools() {
  const pools = await AlphaArcadePool.find({
    $or: [{ isActive: true }, { isResolved: false }],
  }).lean();

  const stats = { total: pools.length, synced: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < pools.length; i++) {
    const result = await syncAlphaArcadePool(pools[i]);
    if (result.error) {
      stats.errors++;
    } else if (result.updated) {
      stats.synced++;
    } else {
      stats.skipped++;
    }

    // 200ms delay between pools to avoid burst-loading algod
    if (i < pools.length - 1) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return stats;
}

module.exports = { syncAlphaArcadePool, syncAllAlphaArcadePools };
