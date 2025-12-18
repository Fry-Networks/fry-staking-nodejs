const express = require("express");
const router = express.Router();

const {
  addWithdrawLog,
  getAllWithdrawals,
  getWithdrawalsByWallet
} = require("../controllers/withdrawController");

router.post("/add", addWithdrawLog);
router.get("/all", getAllWithdrawals);
router.get("/wallet/:wallet", getWithdrawalsByWallet);

module.exports = router;
