const express = require("express");
const { addGasFee } = require("../controllers/gasFeeController");
const { getMonthlyGasFees } = require("../controllers/gasFeeController");
const { getWeeklyGasFees } = require("../controllers/gasFeeController");

const router = express.Router();

router.post("/add", addGasFee);
router.get('/weekly', getWeeklyGasFees);
router.get('/monthly', getMonthlyGasFees); 

module.exports = router;
