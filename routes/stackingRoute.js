const express = require('express');
const router = express.Router();

const {
    getAllStakingData,
    getStakingDataByCreatorId,
    addStakingData,
    updateStakingData,
    deleteStakingData 
}  = require('../controllers/stackingController');

router.get('/all', getAllStakingData);
router.get("/:creatorId", getStakingDataByCreatorId);
router.post('/add', addStakingData);
router.delete('/delete/:id', deleteStakingData);
router.put('/update/:id', updateStakingData);
module.exports = router;