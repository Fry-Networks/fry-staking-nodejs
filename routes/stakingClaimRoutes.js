const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getClaimStatus, claimReward, claimAndWithdraw } = require('../controllers/stakingClaimController');

// Read-only status check (no auth required)
router.get('/:appId/status', getClaimStatus);

// Claim rewards (auth required)
router.post('/:appId/claim', requireAuth, claimReward);

// Claim + prepare withdraw (auth required)
router.post('/:appId/claim-and-withdraw', requireAuth, claimAndWithdraw);

module.exports = router;
