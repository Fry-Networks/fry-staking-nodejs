const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  getPrices,
  analyzePool,
  analyzePortfolio,
  analyzeSwap,
} = require("../controllers/aiController");

router.get("/prices", getPrices);
router.post("/analyze-pool", requireAuth, analyzePool);
router.post("/analyze-portfolio", requireAuth, analyzePortfolio);
router.post("/analyze-swap", requireAuth, analyzeSwap);

module.exports = router;
