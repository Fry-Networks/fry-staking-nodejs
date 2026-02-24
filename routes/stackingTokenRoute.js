const express = require('express');
const router = express.Router();

const {
  addStakingToken,
  getAllStakingTokens,
  deleteStakingToken,
  getStakingTokensByPoolId,
  getPoolTokensAndWithdrawn,
  getStakingRecordsByAppId,
  getUserStakingStats,
  getStakingTokensById
} = require('../controllers/stackingTokenController');

router.post('/add', addStakingToken);
router.get('/all', getAllStakingTokens);
router.get("/pool/:poolId", getStakingTokensByPoolId);
router.get('/tokens/:poolId', getPoolTokensAndWithdrawn);
router.get('/appId/:appId', getStakingRecordsByAppId);
router.get('/user-staking-stats/:wallet', getUserStakingStats);
router.get('/:poolId', getStakingTokensById);
router.delete('/delete/:id', deleteStakingToken);

module.exports = router;
