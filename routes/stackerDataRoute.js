const express = require('express');
const router = express.Router();

const {
    getAllStakerData,
    getStakerDataByWalletId,
    addStakerData,
    deleteStakerData,
    updateStakerData
}  = require('../controllers/stackerDataContoller');


router.get('/all', getAllStakerData);
router.get("/:walletId", getStakerDataByWalletId);
router.post('/add', addStakerData);
router.delete('/delete/:id', deleteStakerData);
router.put('/update/:id', updateStakerData);
module.exports = router;

