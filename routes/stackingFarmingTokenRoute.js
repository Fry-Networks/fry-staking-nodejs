const express = require('express');
const router = express.Router();
const controller = require('../controllers/stakingFarmingTokenController');

router.post('/add', controller.addStakingFarmingToken);
router.get('/', controller.getAllStakingFarmingTokens);
router.get('/pool/:poolId', controller.getPoolTokensAndWithdrawn);
router.get('/pool/:poolId/user/:wallet', controller.getStakingFarmingByUserAndPool);
router.get('/appId/:appId', controller.getFarmingRecordsByAppId);
router.get('/user-farming-stats/:wallet', controller.getUserFarmingStats);
router.get('/:poolId', controller.getStakingFarmingTokensByPoolId);
router.delete('/:id', controller.deleteStakingFarmingToken);

module.exports = router;
