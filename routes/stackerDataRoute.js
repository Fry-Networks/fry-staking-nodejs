const express = require('express');
const router = express.Router();
const { validate, stakerDataSchema } = require('../middleware/validate');

const {
    getAllStakerData,
    getStakerDataByWalletId,
    addStakerData,
    deleteStakerData,
    updateStakerData
}  = require('../controllers/stackerDataContoller');

router.get('/all', getAllStakerData);
router.get("/:walletId", getStakerDataByWalletId);
router.post('/add', validate(stakerDataSchema), addStakerData);
router.delete('/delete/:id', deleteStakerData);
router.put('/update/:id', updateStakerData);
module.exports = router;
