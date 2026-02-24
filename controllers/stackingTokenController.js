// controllers/stakingTokenController.js
const StakingToken = require("../models/stakingTokenSchema");
const withdrawToken = require("../models/withdrawSchema");
const staking = require("../models/stakingSchema");
const claimReward = require("../models/claimRewardSchema");

// Create a new staking token
const addStakingToken = async (req, res) => {
  try {
    const newToken = new StakingToken(req.body);
    const savedToken = await newToken.save();
    res.status(201).json({ success: true, data: savedToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add staking token', error: error.message });
  }
};

// Get all staking tokens
const getAllStakingTokens = async (req, res) => {
  try {
    const tokens = await StakingToken.find();
    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch staking tokens', error: error.message });
  }
};

// Delete staking token by ID
const deleteStakingToken = async (req, res) => {
  try {
    const deleted = await StakingToken.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    res.status(200).json({ success: true, message: 'Staking token deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete staking token', error: error.message });
  }
};

const getStakingTokensByPoolId = async (req, res) => {
  const { poolId } = req.params;

  if (!poolId) {
    return res.status(400).json({
      success: false,
      message: "Pool ID is required"
    });
  }

  try {
    const data = await StakingToken.find({ poolId }).sort({ timestamp: -1 });

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No staking token records found for the given pool ID"
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error fetching staking tokens by poolId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staking tokens",
      error: error.message
    });
  }
};

const getPoolTokensAndWithdrawn = async (req, res) => {
  const { poolId } = req.params;

  if (!poolId) {
    return res.status(400).json({
      success: false,
      message: "Pool ID is required"
    });
  }

  try {
    const records = await StakingToken.find({ appId: Number(poolId) });
    if (!records.length) {
      return res.status(404).json({
        success: false,
        message: "No staking records found for this user in the given pool"
      });
    }

    const totalStaked = records.reduce((sum, rec) => sum + (rec.totalStaked || 0), 0);
    
    const withdrawalRecords = await withdrawToken.find({ appId: Number(poolId) });
    const totalWithdrawn = withdrawalRecords.reduce((sum, rec) => sum + (rec.tokens || 0), 0);
    const updatedAmount = totalStaked - totalWithdrawn;

    return res.status(200).json({
      success: true,
      totalBalance: updatedAmount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staking records",
      error: error.message
    });
  }
};


const getStakingRecordsByAppId = async (req, res) => {
  const { appId } = req.params;

  if (!appId) {
    return res.status(400).json({
      success: false,
      message: "App ID is required"
    });
  }

  try {
    // Fetch farming records where the appId matches
    const records = await staking.find({ stakingContractId : appId }).sort({ createdAt: -1 });

    if (!records.length) {
      return res.status(404).json({
        success: false,
        message: "No staking records found for the given appId"
      });
    }

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staking records by appId",
      error: error.message
    });
  }
};

const getUserStakingStats = async (req, res) => {
  const { wallet } = req.params;

  if (!wallet) {
    return res.status(400).json({
      success: false,
      message: "Wallet address is required"
    });
  }

  try {
    // Fetch all staking records by wallet
    const stakingRecords = await StakingToken.find({ wallet });

    // Calculate total staked amount (stored in microAlgos, convert to Algos)
    const totalStaked = stakingRecords.reduce((sum, rec) => sum + ((rec.totalStaked || 0) / 1000000), 0);

    // Fetch all withdrawal records by wallet
    const withdrawalRecords = await withdrawToken.find({ wallet });

    // Calculate total withdrawn amount (same unit conversion as totalStaked)
    const totalWithdrawn = withdrawalRecords.reduce((sum, rec) => sum + ((rec.tokens || 0) / 1000000), 0);

    // Final stake = totalStaked - totalWithdrawn
    const activeStake = totalStaked - totalWithdrawn;

    const userRewards = await claimReward.find({ walletId: wallet });
    const totalReward = userRewards.reduce((sum, rec) => sum + (rec.rewardClaimed || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalTVL: totalStaked,       
        myStake: activeStake,
        myReward: totalReward
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user farming stats",
      error: error.message
    });
  }
};

const getStakingTokensById = async (req, res) => {
  const { poolId } = req.params;

  if (!poolId) {
    return res.status(400).json({
      success: false,
      message: "Pool ID is required"
    });
  }

  try {
    const data = await StakingToken.find({ appId : Number(poolId) }).sort({ createdAt: -1 });

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No records found for the given pool ID"
      });
    }

    return res.status(200).json({ success: true, data }); // ✅ return here
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch records by pool ID",
      error: error.message
    });
  }
};


module.exports = {
  addStakingToken,
  getAllStakingTokens,
  deleteStakingToken,
  getStakingTokensByPoolId,
  getPoolTokensAndWithdrawn,
  getStakingRecordsByAppId,
  getUserStakingStats,
  getStakingTokensById
};
