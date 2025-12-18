const express = require('express');
const router = express.Router();

const {
  getAllFarmingData,
  getFarmingDataByCreatorId,
  addFarmingData,
  updateFarmingData,
  deleteFarmingData,
  getFarmingDataByAppId,
  getFarmingDataByOnlyAppId
} = require('../controllers/farmingController');

router.get('/all', getAllFarmingData);
router.get('/:creatorId', getFarmingDataByCreatorId);
router.get('/:appId', getFarmingDataByOnlyAppId);
router.post('/add', addFarmingData);
router.put('/update/:appId', updateFarmingData);
router.delete('/delete/:id', deleteFarmingData);

module.exports = router;
