const express = require('express');
const router = express.Router();
const {
    getAllYieldFarmingData,
    addYieldFarmingData,
    getYieldFarmingDataByWalletId,
    deleteYieldFarmingData,
    updateYieldFarmingData
}  = require('../controllers/yieldFarmingController');



router.get('/all', getAllYieldFarmingData);
router.get("/:walletId", getYieldFarmingDataByWalletId);
router.post('/add', addYieldFarmingData);
router.delete('/delete/:id', deleteYieldFarmingData);
router.put('/update/:id', updateYieldFarmingData);
module.exports = router;