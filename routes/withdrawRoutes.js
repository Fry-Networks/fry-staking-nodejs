const express = require("express");
const router = express.Router();
const { validate, withdrawSchema } = require('../middleware/validate');

const {
  addWithdrawLog,
  getAllWithdrawals,
  getWithdrawalsByWallet,
  getWithdrawalsByPool
} = require("../controllers/withdrawController");

router.post("/add", validate(withdrawSchema), addWithdrawLog);
router.get("/all", getAllWithdrawals);
router.get("/wallet/:wallet", getWithdrawalsByWallet);
router.get("/pool/:poolId", getWithdrawalsByPool);

module.exports = router;
