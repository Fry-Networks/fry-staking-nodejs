// routes/stakingTokenRoutes.js
const express = require('express');
const router = express.Router();

const {
  addStakingToken,
  getAllStakingTokens,
  getStakingTokensByPoolId,
  getPoolTokensAndWithdrawn,
  getStakingRecordsByAppId,
  getUserStakingStats,
  getStakingTokensById
} = require('../controllers/stackingTokenController');

// Add a new staking token
router.post('/add', addStakingToken);

// Get all staking tokens
router.get('/all', getAllStakingTokens);

router.get("/pool/:poolId", getStakingTokensByPoolId);
router.get('/tokens/:poolId', getPoolTokensAndWithdrawn);
router.get('/appId/:appId', getStakingRecordsByAppId);
router.get('/user-staking-stats/:wallet', getUserStakingStats);
router.get('/:poolId', getStakingTokensById);

// Delete staking token by ID
// router.delete('/delete/:id', deleteStakingToken);

module.exports = router;
