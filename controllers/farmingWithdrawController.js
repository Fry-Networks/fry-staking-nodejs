const FarmingWithdraw = require("../models/withdrawFarmingTokenSchema");

// Add a new farming token withdrawal log
const addFarmingWithdrawLog = async (req, res) => {
  try {
    const { amount, userWallet, poolId, farmingTokenId } = req.body;

    if (!amount || !userWallet || !poolId || !farmingTokenId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newWithdrawal = new FarmingWithdraw({
      amount,
      userWallet,
      poolId,
      farmingTokenId
    });

    const saved = await newWithdrawal.save();

    res.status(201).json({
      success: true,
      message: "Farming token withdrawal log saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error saving farming token withdrawal log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save farming token withdrawal log",
      error: error.message,
    });
  }
};

// Get all farming token withdrawal logs
const getAllFarmingWithdrawals = async (req, res) => {
  try {
    const logs = await FarmingWithdraw.find().sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching farming token withdrawal logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch farming token withdrawal logs",
      error: error.message,
    });
  }
};

// Get farming token withdrawals by wallet address
const getFarmingWithdrawalsByWallet = async (req, res) => {
  try {
    const { wallet } = req.params;
    const logs = await FarmingWithdraw.find({ userWallet: wallet }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching farming token withdrawal logs by wallet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch farming token withdrawal logs by wallet",
      error: error.message,
    });
  }
};

module.exports = {
  addFarmingWithdrawLog,
  getAllFarmingWithdrawals,
  getFarmingWithdrawalsByWallet
};
