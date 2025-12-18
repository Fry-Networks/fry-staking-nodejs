const mongoose = require("mongoose");

const claimFarmRewardSchema = new mongoose.Schema({
  walletId: {
    type: String,
    required: true,
  },
  poolId: {
    type: String,
    required: true,
  },
  rewardClaimed: {
    type: Number, // In tokens (e.g., 0.001)
    required: true,
  },
  stakedAmount: {
    type: Number, // In tokens (e.g., 2)
    required: true,
  },
  stakeStartTime: {
    type: Number, // UNIX timestamp in seconds
    required: true,
  },
  claimTime: {
    type: Number, // UNIX timestamp in seconds
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'claimfarmrewards' // MongoDB collection name
});

const claimFarmRewards = mongoose.model("claimFarmRewards", claimFarmRewardSchema, "claimFarmRewards");
module.exports = claimFarmRewards;
