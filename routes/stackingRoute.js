const express = require('express');
const router = express.Router();
const { validate, stakingSchema } = require('../middleware/validate');

const {
    getAllStakingData,
    getStakingDataById,
    getStakingDataByCreatorId,
    getStakingDataByContractId,
    addStakingData,
    updateStakingData,
    deleteStakingData
}  = require('../controllers/stackingController');

router.get('/all', getAllStakingData);
router.get('/contract/:contractId', getStakingDataByContractId);
router.get('/creator/:creatorId', getStakingDataByCreatorId);
router.get('/id/:id', getStakingDataById);
router.post('/add', validate(stakingSchema), addStakingData);
router.delete('/delete/:id', deleteStakingData);
router.put('/update/:id', updateStakingData);

// Backward-compatible: legacy /:creatorId route
router.get('/:creatorId', getStakingDataByCreatorId);

module.exports = router;
