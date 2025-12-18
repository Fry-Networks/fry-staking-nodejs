const express = require('express');
const router = express.Router();

const {
  addClaimFarmReward,
  getAllClaimFarmRewards,
  getClaimFarmRewardsByWallet,
  getClaimFarmRewardsByPool,
} = require('../controllers/claimFarmRewardController');

// ➕ Add a new farm reward claim
router.post('/add', addClaimFarmReward);

// 📄 Get all farm reward claims
router.get('/all', getAllClaimFarmRewards);

// 👤 Get farm reward claims by wallet ID
router.get('/wallet/:walletId', getClaimFarmRewardsByWallet);

// 🏦 Get farm reward claims by pool ID
router.get('/pool/:poolId', getClaimFarmRewardsByPool);

module.exports = router;
