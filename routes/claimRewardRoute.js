const express = require('express');
const router = express.Router();
const { validate, claimRewardSchema } = require('../middleware/validate');

const {
  addClaimReward,
  getAllClaimRewards,
  getClaimRewardsByWallet,
  getClaimRewardsByPool,
} = require('../controllers/claimRewardController');

router.post('/add', validate(claimRewardSchema), addClaimReward);
router.get('/all', getAllClaimRewards);
router.get('/wallet/:walletId', getClaimRewardsByWallet);
router.get('/pool/:poolId', getClaimRewardsByPool);

module.exports = router;
