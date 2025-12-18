const express = require("express");
const router = express.Router();

const {
  addFarmingWithdrawLog,
  getAllFarmingWithdrawals,
  getFarmingWithdrawalsByWallet
} = require("../controllers/farmingWithdrawController");

router.post("/add", addFarmingWithdrawLog);
router.get("/all", getAllFarmingWithdrawals);
router.get("/wallet/:wallet", getFarmingWithdrawalsByWallet);

module.exports = router;
