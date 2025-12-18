const express = require('express');
const router = express.Router();

const {
  addClaimReward,
  getAllClaimRewards,
  getClaimRewardsByWallet,
  getClaimRewardsByPool,
} = require('../controllers/claimRewardController');

// Add a new claim
router.post('/add', addClaimReward);

// Get all claimed rewards
router.get('/all', getAllClaimRewards);

// Get claimed rewards by wallet ID
router.get('/wallet/:walletId', getClaimRewardsByWallet);

// Get claimed rewards by pool ID
router.get('/pool/:poolId', getClaimRewardsByPool);

module.exports = router;
